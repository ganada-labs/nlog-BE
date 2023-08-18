import Router from '@koa/router';
import passport from '@/middlewares/passport';
import { normGoogleUser } from '@/middlewares/normGoogleUser';
import { saveRefreshToken } from '@/middlewares/saveRefreshToken';
import { setRefreshTokenCookie } from '@/middlewares/setRefreshTokenCookie';

const OAUTH_REDIRECT_URL = import.meta.env.VITE_OAUTH_REDIRECT_URL;

const GoogleAuth = new Router();

GoogleAuth.get(
  '/',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent',
  })
);

GoogleAuth.get(
  '/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/callback/failure',
  }),
  normGoogleUser,
  saveRefreshToken,
  setRefreshTokenCookie
);

GoogleAuth.get('/callback/failure', (ctx) => {
  const message = 'oauth request failed';
  ctx.redirect(`${OAUTH_REDIRECT_URL}?status=failed&message='${message}'`);
});

export default GoogleAuth;
