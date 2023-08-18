import { Context, Next } from 'koa';
import * as User from '@/services/user';

export const signupIfNotSigned = async (ctx: Context, next: Next) => {
  const { userEmail, userName } = ctx.state.user;
  if (await User.isNotSigned(userEmail)) {
    await User.signup({ email: userEmail, name: userName });
  }

  await next();
};
