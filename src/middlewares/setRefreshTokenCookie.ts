import { Context } from 'koa';
import * as Auth from '@/services/auth';

const OAUTH_REDIRECT_URL = import.meta.env.VITE_OAUTH_REDIRECT_URL;
const DOMAIN = import.meta.env.VITE_DOMAIN;

export const setRefreshTokenCookie = async (ctx: Context) => {
  const { refreshToken } = ctx;

  ctx.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    domain: DOMAIN,
    maxAge: Auth.REFRESH_TOKEN_EXPIRES_IN * 1000,
    sameSite: 'strict',
    path: '/',
  });

  ctx.redirect(OAUTH_REDIRECT_URL);
};
