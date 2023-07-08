import Koa, { Context } from 'koa';
import Router from '@koa/router';

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
app.use(router.routes());
app.use(router.allowedMethods());

export default app;
