import corail from 'corail';

import TokenModel from '@/models/auth';
import { isNil, type, token as Token } from '@/utils';
import { StatusError } from '@/utils/error';

export type TokenPayload = { email: string; provider: string };
export type TokenInfo = TokenPayload & {
  token: string;
};

export const isUnusedToken = async (tokenInfo: TokenInfo) => {
  const savedToken = await TokenModel.get({ email: tokenInfo.email });

  if (isNil(savedToken) || tokenInfo.token !== savedToken) {
    throw new StatusError(403, '탈취된 토큰');
  }

  return tokenInfo;
};

export const verifyToken = (token: string) => {
  const decoded = Token.verify(token);

  if (type.isString(decoded)) {
    throw new StatusError(401, `토큰이 잘못됨: ${decoded}`);
  }

  if (isNil(decoded.email) || isNil(decoded.provider)) {
    throw new StatusError(401, '토큰에 필요한 정보가 포함되지 않음');
  }

  return {
    token,
    email: decoded.email,
    provider: decoded.provider,
  };
};

export const extractToken = (authorization: string) => {
  const token = Token.getBearerCredential(authorization);
  if (token === '') {
    throw new StatusError(401, '토큰이 없음');
  }
  return token;
};

export const generateTokens = (email: string, provider: string) =>
  Token.genTokens({ email, provider });

export const saveToken = async (email: string, token: string) => {
  await TokenModel.set({ email }, token);
};

export const verifyRefreshToken = async (
  authorization?: string
): Promise<StatusError | TokenInfo> => {
  const result = await corail.railRight(
    isUnusedToken,
    verifyToken,
    extractToken
  )(authorization);

  if (corail.isFailed(result)) {
    return result.err;
  }

  return result;
};