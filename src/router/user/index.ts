import { type Context } from 'koa';
import Router from '@koa/router';
import UserModel from '@/models/user';
import AuthModel from '@/models/auth';
import { isNil, type, token } from '@/utils';

const user = new Router({ prefix: '/user' });
/**
 * @api {delete} /user Delete Account
 * @apiDescription 계정 삭제 요청
 *
 * @apiVersion 0.1.0
 * @apiGroup User
 * @apiHeader {String} authorization Bearer 토큰 스트링
 */
user.delete('/', async (ctx: Context) => {
  const prevToken = token.getBearerCredential(ctx.header.authorization);
  if (prevToken === '') {
    ctx.throw(401, '토큰이 없음');
  }

  const decoded = token.verify(prevToken);
  if (type.isString(decoded)) {
    ctx.throw(401, `토큰이 잘못됨: ${decoded}`);
  }

  const { email, provider } = decoded;
  if (isNil(email) || isNil(provider)) {
    ctx.throw(401, '토큰에 필요한 정보가 포함되지 않음');
  }

  const userData = await UserModel.read({ email });
  if (isNil(userData)) {
    ctx.throw(400, '없는 계정임');
  }

  await UserModel.remove({ email });
  await AuthModel.remove({ email });
  ctx.cookies.set('token', null, { expires: new Date(0) });

  ctx.status = 204;
});

export default user;
