import Koa, { Context } from 'koa';
import Router from '@koa/router';
import Auth from '@/router/auth';
import User from '@/router/user';
import googleStrategy from '@/strategies/google';
import localStrategy from '@/strategies/local';
import passport from 'koa-passport';
import * as mongodb from '@/repositories/mongodb';
import * as redis from '@/repositories/redis';

mongodb.connect();
redis.connect();

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
 * passport 등록
 */
passport.use(googleStrategy.name, googleStrategy);
passport.use('local', localStrategy);
app.use(passport.initialize());

app.use(router.routes());
app.use(Auth.routes());
app.use(User.routes());
app.use(router.allowedMethods());

export default app;
