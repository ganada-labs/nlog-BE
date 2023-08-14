import { Next, type Context } from 'koa';
import Router from '@koa/router';
import TokenModel from '@/models/auth';
import { isNil, type, token as Token } from '@/utils';
import corail from 'corail';
import { StatusError } from '@/utils/error';
import GoogleAuth from './google';

type TokenPayload = { email: string; provider: string };
type TokenInfo = TokenPayload & {
  token: string;
};

const isUnusedToken = async (tokenInfo: TokenInfo) => {
  const savedToken = await TokenModel.get({ email: tokenInfo.email });

  if (isNil(savedToken) || tokenInfo.token !== savedToken) {
    throw new StatusError(403, '탈취된 토큰');
  }

  return tokenInfo;
};

const verifyToken = (token: string) => {
  const decoded = Token.verify(token);

  if (type.isString(decoded)) {
    throw new StatusError(401, `토큰이 잘못됨: ${decoded}`);
  }

  if (isNil(decoded.email) || isNil(decoded.provider)) {
    throw new StatusError(401, '토큰에 필요한 정보가 포함되지 않음');
  }

  return {
    token,
    email: decoded.email,
    provider: decoded.provider,
  };
};

const extractToken = (authorization: string) => {
  const token = Token.getBearerCredential(authorization);
  if (token === '') {
    throw new StatusError(401, '토큰이 없음');
  }
  return token;
};

const refreshTokenAuthenticate = async (ctx: Context, next: Next) => {
  const result = await corail.railRight(
    isUnusedToken,
    verifyToken,
    extractToken
  )(ctx.header.authorization);

  if (corail.isFailed(result)) {
    if (result.err instanceof StatusError) {
      ctx.throw(result.err.status, result.err.message);
    }
    return;
  }

  const { email, provider } = result;

  ctx.state.user = {
    email,
    provider,
  };
  await next();
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
auth.get('/refresh', refreshTokenAuthenticate, async (ctx: Context) => {
  const { email, provider } = ctx.state.user;

  const { accessToken, refreshToken } = Token.genTokens({ email, provider });
  await TokenModel.set({ email }, refreshToken);

  ctx.status = 200;
  ctx.body = {
    accessToken,
    refreshToken,
  };
});

export default auth;
