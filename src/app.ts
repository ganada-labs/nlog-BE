import Koa, { Context } from 'koa';

export const app = new Koa();

app.use(async (ctx: Context) => {
  ctx.body = 'Hello World!';
});

export default app;
