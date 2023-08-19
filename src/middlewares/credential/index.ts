import { Next, type Context } from 'koa';
import corail from '@/packages/corail';
import * as Auth from '@/services/auth';
import { StatusError } from '@/utils/error';
import { isNil, isString } from '@/utils';
import { passport } from '@/packages/passport';

export type TokenInfo = {
  payload: Auth.TokenPayload;
  originToken: string;
};

export const checkRefreshTokenExist = (
  refreshToken?: string
): { refreshToken: string } => {
  if (isNil(refreshToken)) {
    throw new StatusError(401, 'Token not exist');
  }

  return { refreshToken };
};

export const checkVerifedToken = ({
  refreshToken,
}: {
  refreshToken: string;
}) => {
  const decoded = Auth.decodeRefreshToken(refreshToken);

  if (isString(decoded)) {
    throw new StatusError(401, `Failed to validate token: ${decoded}`);
  }

  return {
    originToken: refreshToken,
    payload: decoded,
  };
};

export const checkPayloadSatisfied = ({ payload, originToken }: TokenInfo) => {
  if (!Auth.isPayloadSatisfied(payload)) {
    throw new StatusError(401, 'payload is wrong');
  }

  return { payload, originToken };
};

export const checkUnusedToken = async ({ payload, originToken }: TokenInfo) => {
  if (await Auth.isUsedToken(payload.email, originToken)) {
    throw new StatusError(403, 'Token is already used');
  }

  return payload;
};

export const checkRefreshCredential = async (ctx: Context, next: Next) => {
  const refreshToken = ctx.cookies.get('refresh_token');

  const result = await corail.railRight(
    checkUnusedToken,
    checkPayloadSatisfied,
    checkVerifedToken,
    checkRefreshTokenExist
  )(refreshToken);

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.throw(error.status, error.message);
  }

  ctx.state.user = result;

  await next();
};

export const checkCredential = passport.authenticate('local', {
  session: false,
});

export const googleOAuth = passport.authenticate('google', {
  session: false,
  scope: ['profile', 'email'],
  accessType: 'offline',
  prompt: 'consent',
});

export const googleOAuthCallback = passport.authenticate('google', {
  session: false,
  failureRedirect: '/callback/failure',
});
