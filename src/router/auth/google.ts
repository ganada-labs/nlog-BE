import Router from '@koa/router';
import passport from '@/middlewares/passport';
import AuthModel from '@/models/auth';
import UserModel, { type UserSchema } from '@/models/user';
import { isEmail } from '@/utils';
import * as Auth from '@/services/auth';

type UserRaw = {
  displayName: string;
  emails: {
    value: string;
    verified: boolean;
  }[];
  provider: string;
};

const OAUTH_REDIRECT_URL = import.meta.env.VITE_OAUTH_REDIRECT_URL;
const DOMAIN = import.meta.env.VITE_DOMAIN;

const normalizeUser = (raw: UserRaw) => {
  const userName = raw.displayName ?? '???';
  const userEmail = raw.emails.find((email) => email.verified)?.value;
  const { provider } = raw;

  return {
    userName,
    userEmail,
    provider,
  };
};

const isNotSigned = async (email: string) => !(await UserModel.read({ email }));

const signup = ({ email, name }: UserSchema) =>
  UserModel.create({ email, name });

const saveRefreshToken = (email: string, tokenStr: string) =>
  AuthModel.set({ email }, tokenStr);

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
    const { userEmail, userName, provider } = normalizeUser(ctx.state.user);

    if (!isEmail(userEmail)) {
      const message = 'invalid email';
      ctx.redirect(`${OAUTH_REDIRECT_URL}?status=failed&message='${message}'`);
      return;
    }

    if (await isNotSigned(userEmail)) {
      await signup({ email: userEmail, name: userName });
    }

    const refreshToken = Auth.generateRefreshToken({
      email: userEmail,
      provider,
    });

    const success = await saveRefreshToken(userEmail, refreshToken);

    if (!success) {
      const message = 'failed to save user session';
      ctx.redirect(`${OAUTH_REDIRECT_URL}?status=failed&message='${message}'`);
      return;
    }

    ctx.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      domain: DOMAIN,
      maxAge: Auth.REFRESH_TOKEN_EXPIRES_IN,
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
