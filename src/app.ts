import dotenv from 'dotenv';
import Koa, { Context } from 'koa';
import Router from '@koa/router';
import Test from '@/models/test-model';
import Auth from '@/router/auth';

dotenv.config();

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
router.get('/api', async (ctx: Context) => {
  ctx.body = 'Hello World!';
});

/**
 * @api {get} /api/test test용 API
 *
 * @apiVersion 0.1.0
 * @apiName Test
 * @apiDescription MongoDB 테스트용 명령어들을 실행할 수 있는 API
 *
 * @apiParam {String="create","read","update","remove"} order 명령어
 *
 * @apiSuccess (200) {String} create,update,remove -> success 문자열 반환
 * @apiSuccess (200) {String} read -> db 요소를 읽은 값을 반환함
 */
router.get('/api/test', async (ctx: Context) => {
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

app.use(router.routes());
app.use(Auth.routes());
app.use(router.allowedMethods());

export default app;
