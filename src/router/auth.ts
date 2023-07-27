import { type Context } from 'koa';
import Router from '@koa/router';
import Token from '@/models/token';

const auth = new Router({ prefix: '/api/auth' });

auth.get('/test', async (ctx: Context) => {
  const value = await Token.get({ id: 'johndoe@gmail.com' });
  ctx.body = value;
});

auth.post('/test', async (ctx: Context) => {
  await Token.set({
    id: 'johndoe@gmail.com',
    value: 'i am refresh token',
  });

  ctx.status = 200;
});

export default auth;
