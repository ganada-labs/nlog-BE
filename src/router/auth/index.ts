import { type Context } from 'koa';
import Router from '@koa/router';
import * as Auth from '@/services/auth';
import { checkRefreshCredential } from '@/middlewares/credential';
import { ENV } from '@/constants';
import GoogleAuth from './google';

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
auth.get('/refresh', checkRefreshCredential, async (ctx: Context) => {
  const { email, provider } = ctx.state.user;

  const payload = { email, provider };
  const accessToken = Auth.generateAccessToken(payload);
  const refreshToken = Auth.generateRefreshToken(payload);
  await Auth.saveToken(email, refreshToken);

  ctx.status = 200;
  ctx.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    domain: `.${ENV.DOMAIN}`,
    maxAge: Auth.REFRESH_TOKEN_EXPIRES_IN * 1000,
    sameSite: ENV.DEV_MODE ? 'none' : 'strict',
    secure: true,
    path: '/',
  });
  ctx.body = {
    accessToken,
  };
});

export default auth;
