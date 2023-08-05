import Koa, { Context } from 'koa';
import Router from '@koa/router';
import Test from '@/models/test-model';
import Auth from '@/router/auth';
import googleStrategy from '@/strategies/google';
import localStrategy from '@/strategies/local';
import passport from 'koa-passport';

export const app = new Koa();

const router = new Router();

/**
 * @api {get} /user/:id Request User information
 *
 * @apiVersion        0.1.0
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get('/', async (ctx: Context) => {
  ctx.body = 'Hello World!';
});

/**
 * @api {get} /test test용 API
 *
 * @apiVersion 0.1.0
 * @apiName Test
 * @apiGroup Test
 * @apiDescription MongoDB 테스트용 명령어들을 실행할 수 있는 API
 *
 * @apiParam {String="create","read","update","remove"} order 명령어
 *
 * @apiSuccess (200) {String} result create,update,remove -> success 문자열 반환, read -> db 값을 반환함
 */
router.get('/test', async (ctx: Context) => {
  let isSuccess = false;
  if (ctx.query.order === 'create') {
    isSuccess = await Test.create({ name: 'ABC' });
  }
  if (ctx.query.order === 'read') {
    const result = await Test.read({ name: 'ABC' });
    ctx.body = result;
    return;
  }
  if (ctx.query.order === 'update') {
    isSuccess = await Test.update({ name: 'ABC' }, { name: 'CBA' });
  }
  if (ctx.query.order === 'remove') {
    isSuccess = await Test.remove({ name: 'ABC' });
  }

  ctx.body = isSuccess ? 'success' : 'failed';
});
/**
 * passport 등록
 */
passport.use(googleStrategy.name, googleStrategy);
passport.use('local', localStrategy);
app.use(passport.initialize());

app.use(router.routes());
app.use(Auth.routes());
app.use(router.allowedMethods());

export default app;
