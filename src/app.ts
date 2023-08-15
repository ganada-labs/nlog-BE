import Koa, { Context } from 'koa';
import cookie from 'koa-cookie';
import passport from 'koa-passport';
import Router from '@koa/router';
import cors from '@koa/cors';
import Auth from '@/router/auth';
import User from '@/router/user';
import googleStrategy from '@/strategies/google';
import localStrategy from '@/strategies/local';
import * as mongodb from '@/repositories/mongodb';
import * as redis from '@/repositories/redis';

const CLIENT_DOMAIN = import.meta.env.VITE_DOMAIN;

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
 * 쿠키 미들웨어 등록
 */
// app.use(cookie());
/**
 * passport 등록
 */
passport.use(googleStrategy.name, googleStrategy);
passport.use('local', localStrategy);
app.use(passport.initialize());

/**
 * 서브도메인에 대한 CORS 해제
 */
app.use(
  cors({
    origin: `https://www.${CLIENT_DOMAIN}`,
    credentials: true,
  })
);
app.use(router.routes());
app.use(Auth.routes());
app.use(User.routes());
app.use(router.allowedMethods());

export default app;
