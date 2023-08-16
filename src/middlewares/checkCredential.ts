import { Next, type Context } from 'koa';
import corail from 'corail';
import * as Auth from '@/services/auth';

import { StatusError } from '@/utils/error';
import { isNil, isString } from '@/utils';

export type TokenInfo = {
  payload: Auth.TokenPayload;
  originToken: string;
};

const checkTokenExist = (token?: string): string => {
  if (isNil(token)) {
    throw new StatusError(401, 'Token not exist');
  }
  return token;
};

const checkVerifedToken = ({ refreshToken }: { refreshToken: string }) => {
  const decoded = Auth.decodeRefreshToken(refreshToken);

  if (isString(decoded)) {
    throw new StatusError(401, `Failed to validate token: ${decoded}`);
  }

  return {
    originToken: refreshToken,
    payload: decoded,
  };
};

const checkPayloadSatisfied = ({ payload, originToken }: TokenInfo) => {
  if (Auth.isPayloadSatisfied(payload)) {
    throw new StatusError(401, 'payload is wrong');
  }

  return { payload, originToken };
};

const checkUnusedToken = async (data: TokenInfo) => {
  if (await Auth.isUnusedToken(data.payload.email, data.originToken)) {
    throw new StatusError(403, 'Token is already unsed');
  }

  return data.payload;
};

export const checkRefreshCredential = async (ctx: Context, next: Next) => {
  const refreshToken = ctx.cookies.get('refresh_token');

  const result = await corail.railRight(
    checkUnusedToken,
    checkPayloadSatisfied,
    checkVerifedToken,
    checkTokenExist
  )(refreshToken);

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.throw(error.status, error.message);
  }

  ctx.state.user = result;

  await next();
};
