import { Context, Next } from 'koa';
import * as User from '@/services/user';
import { StatusError } from '@/utils/error';
import corail from '@/packages/corail';
import { ENV } from '@/constants';

export const { normalizeUser } = User;
export const checkEmailExist = (userData: User.UserData) => {
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

export const normGoogleUser = async (ctx: Context, next: Next) => {
  const result = await corail.railRight(
    checkEmailExist,
    normalizeUser
  )(ctx.state.user);

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.redirect(
      `${ENV.OAUTH_REDIRECT_URL}?status=failed&message='${error.message}'`
    );
    return;
  }

  ctx.state.user = result;
  await next();
};
