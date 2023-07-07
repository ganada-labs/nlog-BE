import Koa, { Context } from 'koa';

export const app = new Koa();

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
app.use(async (ctx: Context) => {
  ctx.body = 'Hello World!';
});

export default app;
