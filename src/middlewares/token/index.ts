import { Next, Context } from 'koa';
import corail from '@/packages/corail';
import * as Auth from '@/services/auth';
import * as User from '@/services/user';
import { StatusError } from '@/utils/error';

const OAUTH_REDIRECT_URL = import.meta.env.VITE_OAUTH_REDIRECT_URL;

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

export const saveToken = async ({
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

export const saveRefreshToken = async (ctx: Context, next: Next) => {
  const result = await corail.railRight(
    saveToken,
    generateRefreshToken
  )(ctx.state.user);

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.redirect(
      `${OAUTH_REDIRECT_URL}?status=failed&message='${error.message}'`
    );
  }

  ctx.refreshToken = result;
  await next();
};
