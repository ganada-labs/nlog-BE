import Koa, { Context } from 'koa';
import cookie from 'koa-cookie';
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
 * @api {get} / Hello World
 * @apiDescription Hello World 반환, 서버가 살아있는지 확인할 때 사용
 *
 * @apiVersion 0.1.0
 * @apiGroup Test
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

app.use(cookie());
export default app;
