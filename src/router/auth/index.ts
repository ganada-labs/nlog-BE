import { Next, type Context } from 'koa';
import Router from '@koa/router';
import TokenModel from '@/models/auth';
import { isNil, type, token } from '@/utils';
import GoogleAuth from './google';

const DOMAIN = import.meta.env.VITE_DOMAIN;

const refreshTokenAuthenticate = async (ctx: Context, next: Next) => {
  const refreshToken = token.getBearerCredential(ctx.header.authorization);
  if (refreshToken === '') {
    ctx.throw(401, '토큰이 없음');
  }

  const decoded = token.verify(refreshToken);
  if (type.isString(decoded)) {
    ctx.throw(401, `토큰이 잘못됨: ${decoded}`);
  }

  const { email, provider } = decoded;
  if (isNil(email) || isNil(provider)) {
    ctx.throw(401, '토큰에 필요한 정보가 포함되지 않음');
  }

  const savedRefreshToken = await TokenModel.get({ email });
  if (isNil(savedRefreshToken) || refreshToken !== savedRefreshToken) {
    ctx.throw(403, '탈취된 토큰');
  }

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
 *
 * @apiVersion 0.1.0
 * @apiName refresh
 * @apiGroup Auth
 * @apiHeader {String} authorization Bearer 토큰 스트링
 */
auth.get('/refresh', refreshTokenAuthenticate, async (ctx: Context) => {
  const { email, provider } = ctx.state.user;

  const { accessToken, refreshToken } = token.genTokens({ email, provider });
  await TokenModel.set({ email }, refreshToken);
  ctx.cookies.set('access_token', accessToken, {
    httpOnly: true,
    domain: DOMAIN,
  });
  ctx.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    domain: DOMAIN,
  });

  ctx.status = 204;
});

export default auth;
