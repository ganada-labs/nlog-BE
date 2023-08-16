import { Next, type Context } from 'koa';
import corail from 'corail';

import Router from '@koa/router';
import * as Auth from '@/services/auth';
import { StatusError } from '@/utils/error';
import { isNil, isString } from '@/utils';

import GoogleAuth from './google';

const DOMAIN = import.meta.env.VITE_DOMAIN;

export type TokenInfo = {
  payload: Auth.TokenPayload;
  originToken: string;
};

const checkTokenExist = (token?: string): string => {
  if (isNil(token)) {
    throw new StatusError(401, 'Token not exist');
  }
  return token;
};

const checkVerifedToken = ({ refreshToken }: { refreshToken: string }) => {
  const decoded = Auth.decodeRefreshToken(refreshToken);

  if (isString(decoded)) {
    throw new StatusError(401, `Failed to validate token: ${decoded}`);
  }

  return {
    originToken: refreshToken,
    payload: decoded,
  };
};

const checkPayloadSatisfied = ({ payload, originToken }: TokenInfo) => {
  if (Auth.isPayloadSatisfied(payload)) {
    throw new StatusError(401, 'payload is wrong');
  }

  return { payload, originToken };
};

const checkUnusedToken = async (data: TokenInfo) => {
  if (await Auth.isUnusedToken(data.payload.email, data.originToken)) {
    throw new StatusError(403, 'Token is already unsed');
  }

  return data.payload;
};

export const checkAuthorization = async (
  refreshToken?: string
): Promise<StatusError | Auth.TokenPayload> => {
  const result = await corail.railRight(
    checkUnusedToken,
    checkPayloadSatisfied,
    checkVerifedToken,
    checkTokenExist
  )(refreshToken);

  if (corail.isFailed(result)) {
    return result.err;
  }

  return result;
};

const auth = new Router({ prefix: '/auth' });
/**
 * @api {get} /auth/google Google Login
 * @apiDescription 구글 로그인 OAuth. 로그인 성공시 쿠키에 토큰이 추가된다.
 *
 * @apiVersion 0.1.0
 * @apiName google-login
 * @apiGroup Auth
 */
auth.use('/google', GoogleAuth.routes());

const verifyRequest = async (ctx: Context, next: Next) => {
  const refreshToken = ctx.cookies.get('refresh_token');
  const result = await checkAuthorization(refreshToken);

  if (result instanceof StatusError) {
    ctx.throw(result.status, result.message);
  }

  const { email, provider } = result;

  ctx.state.user = {
    email,
    provider,
  };
  await next();
};

const refresh = async (ctx: Context) => {
  const { email, provider } = ctx.state.user;

  const payload = { email, provider };
  const accessToken = Auth.generateAccessToken(payload);
  const refreshToken = Auth.generateRefreshToken(payload);
  await Auth.saveToken(email, refreshToken);

  ctx.status = 200;
  ctx.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    domain: DOMAIN,
    maxAge: Auth.REFRESH_TOKEN_EXPIRES_IN,
    sameSite: 'strict',
    path: '/',
  });
  ctx.body = {
    accessToken,
  };
};
/**
 * @api {get} /auth/refresh Refresh
 * @apiDescription 토큰 만료시 토큰을 재발급할 수 있는 API
 * Access Token은 반환값으로, Refresh Token은 Cookie로 설정되어 반환된다.
 *
 * @apiVersion 0.1.0
 * @apiName refresh
 * @apiGroup Auth
 * @apiHeader {String} authorization Bearer 토큰 스트링, 리프레시 토큰을 Authorization Header로 넘길 것
 * @apiSuccess {String} accessToken 액세스 토큰
 * @apiSuccess {String} refreshToken 리프레시 토큰
 */
auth.get('/refresh', verifyRequest, refresh);

export default auth;
