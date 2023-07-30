import { type Context } from 'koa';
import Router from '@koa/router';
import TokenModel from '@/models/token';
import { isEmail, isNil, type, token } from '@/utils';

const auth = new Router({ prefix: '/api/auth' });

/**
 * @api {get} /api/login/google
 *
 * @apiVersion 0.1.0
 * @apiName google-login
 * @apiDescription 구글 로그인 (미완)
 */
auth.get('/login/google', async (ctx: Context) => {
  /**
   * TODO: OAuth 과정을 거치도록 수정한다.
   * TODO: 실제 유저 정보를 받을 수 있게 수정한다.
   */
  const email = 'nlog@gmail.com';

  if (!isEmail(email)) {
    ctx.status = 400;
    return;
  }

  const payload = {
    email,
  };
  const refreshToken = token.genRefreshToken(payload);
  await TokenModel.set(payload, refreshToken);

  /**
   * 로그인시 쿠키에 access token을 포함해 전달한다.
   * 클라이언트는 SSR에 화면 요청마다 쿠키를 전송하게 된다.
   * SSR에서 BE로 데이터 요청을 보낼 땐 SSR에서 header에 토큰을 넣어 보낸다.
   */
  ctx.status = 200;
});
/**
 * @api {get} /api/auth/refresh Refresh
 * @apiDescription 토큰 만료시 토큰을 재발급할 수 있는 API
 *
 * @apiVersion 0.1.0
 * @apiName refresh
 * @apiGroup Auth
 * @apiHeader {String} authorization Bearer 토큰 스트링
 * @apiSuccess {String} Scheme 인증 방식을 알려주는 스킴
 * @apiSuccess {String} Token 사용된 토큰 문자열
 * @apiSuccessExample {json} 성공 예제:
 * HTTP/1.1 200 OK
 * {
 *    "scheme": "Bearer",
 *    "token": "tokenstring"
 * }
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
