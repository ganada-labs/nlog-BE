import Koa, { Context } from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import Auth from '@/router/auth';
import User from '@/router/user';
import Post from '@/router/post';
import { passport } from '@/packages/passport';
import * as mongodb from '@/repos/mongodb';
import * as redis from '@/repos/redis';

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
 * passport 등록
 */
app.use(passport.initialize());

/**
 * 서브도메인에 대한 CORS 해제
 */

app.use(
  cors({
    origin: (ctx: Context) => {
      const allowedOrigins = [
        `https://www.${CLIENT_DOMAIN}`,
        'http://localhost:3000',
      ];
      const { origin } = ctx.request.header;
      if (!origin || !allowedOrigins.includes(origin)) {
        console.log(48, origin);
        return ctx.throw(403, `${origin} is not a valid origin`);
      }
      return origin;
    },
    credentials: true,
  })
);

app.use(router.routes());
app.use(Auth.routes());
app.use(User.routes());
app.use(Post.routes());
app.use(router.allowedMethods());

export default app;
