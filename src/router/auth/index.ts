import { type Context } from 'koa';
import Router from '@koa/router';
import TokenModel from '@/models/auth';
import { isNil, type, token } from '@/utils';
import GoogleAuth from './google';

const auth = new Router({ prefix: '/auth' });
/**
 * @api {get} /auth/google Google Login
 * @apiDescription 구글 로그인 OAuth. 로그인 성공시 쿠키에 토큰이 추가된다.
 *
 * @apiVersion 0.1.0
 * @apiName google-login
 * @apiGroup Auth *
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
auth.get('/refresh', async (ctx: Context) => {
  const prevToken = token.getBearerCredential(ctx.header.authorization);
  if (prevToken === '') {
    ctx.throw(401, '토큰이 없음');
  }

  const decoded = token.verify(prevToken);
  if (type.isString(decoded)) {
    ctx.throw(403, `토큰이 잘못됨: ${decoded}`);
  }

  const { email, provider } = decoded;
  if (isNil(email) || isNil(provider)) {
    ctx.throw(403, '토큰에 필요한 정보가 포함되지 않음');
  }

  const refreshToken = await TokenModel.get({ email });
  if (isNil(refreshToken)) {
    ctx.throw(401, '인증되지 않은 유저(재로그인 필요)');
  }

  const newAccessToken = token.genAccessToken({ email });
  ctx.set('Authorization', `Bearer ${newAccessToken}`);
  ctx.status = 200;
});

export default auth;
