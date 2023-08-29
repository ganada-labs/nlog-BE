import { type Context } from 'koa';
import Router from '@koa/router';
import UserModel from '@/models/user';
import AuthModel from '@/models/auth';
import { checkCredential } from '@/middlewares/credential';
import { isNil } from '@/utils';
import { isString } from '@/utils/types';
import * as Auth from '@/services/auth';

const user = new Router({ prefix: '/user' });
/**
 * @api {get} /user Get My Account
 * @apiDescription 내 계정 정보 요청
 *
 * @apiVersion 0.1.0
 * @apiGroup User
 * @apiHeader {String} authorization Bearer 토큰 스트링
 * @apiSuccess {String} name 유저 이름
 * @apiSuccess {String} email 유저 이메일
 */
user.get('/', checkCredential, async (ctx: Context) => {
  const { email } = ctx.state.user;

  const userData = await UserModel.read({ email });

  if (isNil(userData)) {
    ctx.throw(400, '유저 정보를 읽는데 실패함');
  }

  ctx.body = {
    name: userData.name,
    email,
  };
  ctx.status = 200;
});

/**
 * @api {get} /user/:email Get Account
 * @apiDescription 지정 유저 계정 정보 요청
 * 지정한 email에 해당하는 유저의 정보를 조회한다.
 *
 * @apiVersion 0.1.0
 * @apiGroup User
 * @apiSuccess {Boolean} myAccount 조회한 계정이 내 계정인지 여부
 * @apiSuccess {String} name 유저 이름
 * @apiSuccess {String} email 유저 이메일
 */
user.get('/:email', async (ctx: Context) => {
  const { email } = ctx.params;
  const userData = await UserModel.read({ email });

  if (isNil(userData)) {
    ctx.throw(400, '유저 정보를 읽는데 실패함');
  }

  const token = Auth.getBearerCredential(ctx.request.header.authorization);
  const decoded = Auth.decodeAccessToken(token);
  if (isString(decoded) || decoded.email !== email) {
    ctx.body = {
      myAccount: false,
      name: userData.name,
      email,
    };
    ctx.status = 200;
    return;
  }

  ctx.body = {
    myAccount: true,
    name: userData.name,
    email,
  };
  ctx.status = 200;
});

/**
 * @api {delete} /user Delete Account
 * @apiDescription 계정 삭제 요청
 *
 * @apiVersion 0.1.0
 * @apiGroup User
 * @apiHeader {String} authorization Bearer 토큰 스트링
 */
user.delete('/', checkCredential, async (ctx: Context) => {
  const { email } = ctx.state.user;

  await UserModel.remove({ email });
  await AuthModel.remove({ email });
  ctx.cookies.set('token', null, { expires: new Date(0) });

  ctx.status = 204;
});

export default user;
