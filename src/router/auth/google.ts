import Router from '@koa/router';
import passport from '@/middlewares/passport';
import * as Auth from '@/services/auth';
import * as User from '@/services/user';
import corail from '@/packages/corail';
import { StatusError } from '@/utils/error';

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

const checkEmailExist = (userData: User.UserData) => {
  const { userName, userEmail, provider } = userData;

  if (User.isEmailNotExist(userEmail)) {
    throw new StatusError(401, 'There is no valid email');
  }

  return {
    userName,
    userEmail,
    provider,
  };
};

const generateRefreshToken = (userData: User.UserData) => {
  const { userEmail, provider } = userData;

  const refreshToken = Auth.generateRefreshToken({
    email: userEmail,
    provider,
  });

  return {
    email: userEmail,
    refreshToken,
  };
};

const saveRefreshToken = async ({
  email,
  refreshToken,
}: {
  email: string;
  refreshToken: string;
}) => {
  const isSuccess = await Auth.saveToken(email, refreshToken);
  if (!isSuccess) throw new StatusError(500, 'Failed to save refresh token');

  return refreshToken;
};

GoogleAuth.get(
  '/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/callback/failure',
  }),
  async (ctx, next) => {
    const result = await corail.railRight(
      checkEmailExist,
      User.normalizeUser
    )(ctx.state.user);

    if (corail.isFailed(result)) {
      const error = result.err as StatusError;
      ctx.redirect(
        `${OAUTH_REDIRECT_URL}?status=failed&message='${error.message}'`
      );
      return;
    }

    const { userEmail, userName } = result;
    if (await User.isNotSigned(userEmail)) {
      await User.signup({ email: userEmail, name: userName });
    }

    ctx.state.user = result;
    await next();
  },
  async (ctx) => {
    const result = await corail.railRight(
      saveRefreshToken,
      generateRefreshToken
    )(ctx.state.user);

    if (corail.isFailed(result)) {
      const error = result.err as StatusError;
      ctx.redirect(
        `${OAUTH_REDIRECT_URL}?status=failed&message='${error.message}'`
      );
      return;
    }

    const refreshToken = result;

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
