import Router from '@koa/router';
import { googleOAuth, googleOAuthCallback } from '@/middlewares/credential';
import { signupIfNotSigned } from '@/middlewares/user';
import { normGoogleUser } from '@/middlewares/normGoogleUser';
import { saveRefreshToken } from '@/middlewares/token';
import * as Auth from '@/services/auth';

const OAUTH_REDIRECT_URL = import.meta.env.VITE_OAUTH_REDIRECT_URL;
const DOMAIN = import.meta.env.VITE_DOMAIN;

const GoogleAuth = new Router();

GoogleAuth.get('/', googleOAuth);

GoogleAuth.get(
  '/callback',
  googleOAuthCallback,
  normGoogleUser,
  signupIfNotSigned,
  saveRefreshToken,
  async (ctx) => {
    const { refreshToken } = ctx;

    ctx.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      domain: DOMAIN,
      maxAge: Auth.REFRESH_TOKEN_EXPIRES_IN * 1000,
      sameSite: 'strict',
      path: '/',
    });

    ctx.redirect(OAUTH_REDIRECT_URL);
  }
);

GoogleAuth.get('/callback/failure', (ctx) => {
  const message = 'oauth request failed';
  ctx.redirect(`${OAUTH_REDIRECT_URL}?status=failed&message='${message}'`);
});

export default GoogleAuth;
