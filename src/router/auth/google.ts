import Router from '@koa/router';
import passport from 'koa-passport';
import Auth from '@/models/auth';
import { isEmail, token } from '@/utils';

type Email = {
  value: `${string}@${string}.${string}`;
  verified: boolean;
};

const OAUTH_REDIRECT_URL = import.meta.env.VITE_OAUTH_REDIRECT_URL;
const DOMAIN = import.meta.env.VITE_DOMAIN;

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
  async (ctx) => {
    const { user } = ctx.state;
    const userEmail = user.emails.find((email: Email) => email.verified)?.value;

    if (!isEmail(userEmail)) {
      ctx.redirect(`${OAUTH_REDIRECT_URL}?status=failed`);
      return;
    }

    const accessToken = token.genAccessToken({
      email: userEmail,
    });

    const refreshToken = token.genRefreshToken({
      email: userEmail,
    });

    const success = await Auth.set({ email: userEmail }, refreshToken);

    if (!success) {
      ctx.redirect(`${OAUTH_REDIRECT_URL}?status=failed`);
      return;
    }

    ctx.cookies.set('token', accessToken, { httpOnly: true, domain: DOMAIN });
    ctx.redirect(OAUTH_REDIRECT_URL);
  }
);

GoogleAuth.get('/callback/failure', (ctx) => {
  ctx.redirect(`${OAUTH_REDIRECT_URL}?status=failed`);
});

export default GoogleAuth;
