import { type Context } from 'koa';
import Router from '@koa/router';
import UserModel from '@/models/user';
import AuthModel from '@/models/auth';
import passport from 'koa-passport';
import { isNil } from '@/utils';

const user = new Router({ prefix: '/user' });
/**
 * @api {get} /user Get Account
 * @apiDescription 계정 정보 요청
 *
 * @apiVersion 0.1.0
 * @apiGroup User
 * @apiHeader {String} authorization Bearer 토큰 스트링
 * @apiSuccess {String} name 유저 이름
 * @apiSuccess {String} email 유저 이메일
 */
user.get(
  '/',
  passport.authenticate('local', { session: false }),
  async (ctx: Context) => {
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
  }
);

/**
 * @api {delete} /user Delete Account
 * @apiDescription 계정 삭제 요청
 *
 * @apiVersion 0.1.0
 * @apiGroup User
 * @apiHeader {String} authorization Bearer 토큰 스트링
 */
user.delete(
  '/',
  passport.authenticate('local', { session: false }),
  async (ctx: Context) => {
    const { email } = ctx.state.user;

    await UserModel.remove({ email });
    await AuthModel.remove({ email });
    ctx.cookies.set('token', null, { expires: new Date(0) });

    ctx.status = 204;
  }
);

export default user;
