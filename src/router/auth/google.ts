import Router from '@koa/router';
import { ENV } from '@/constants';
import { googleOAuth, googleOAuthCallback } from '@/middlewares/oauth';
import { signupIfNotSigned } from '@/middlewares/user';
import { normGoogleUser } from '@/middlewares/normGoogleUser';
import { saveRefreshToken } from '@/middlewares/token';
import * as Auth from '@/services/auth';

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
      domain: ENV.DOMAIN,
      maxAge: Auth.REFRESH_TOKEN_EXPIRES_IN * 1000,
      sameSite: ENV.DEV_MODE ? 'lax' : 'strict',
      path: '/',
    });

    ctx.redirect(ENV.OAUTH_REDIRECT_URL);
  }
);

GoogleAuth.get('/callback/failure', (ctx) => {
  const message = 'oauth request failed';
  ctx.redirect(`${ENV.OAUTH_REDIRECT_URL}?status=failed&message='${message}'`);
});

export default GoogleAuth;
