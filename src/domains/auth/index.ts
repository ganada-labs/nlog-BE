import corail from 'corail';

import TokenModel from '@/models/auth';
import { StatusError } from '@/utils/error';
import { isNil, type, token } from '@/utils';

export const ACCESS_TOKEN_EXPIRES_IN = 3600; // 1 hour
export const REFRESH_TOKEN_EXPIRES_IN = 3600 * 24 * 14; // 14 day

export const JWT_ACCESS_SECRET =
  import.meta.env.VITE_JWT_ACCESS_SECRET ?? 'my_access_secret';
export const JWT_REFRESH_SECRET =
  import.meta.env.VITE_JWT_REFRESH_SECRET ?? 'my_refresh_secret';
/**
 * TODO: strategies auth 도메인으로 옮기기
 * network 관련 로직 분리
 * passport를 auth 도메인으로 이동
 */
export type TokenPayload = { email: string; provider: string };
export type TokenInfo = TokenPayload & {
  refreshToken: string;
};

export const isUnusedToken = async (tokenInfo: TokenInfo) => {
  const savedToken = await TokenModel.get({ email: tokenInfo.email });
  if (isNil(savedToken) || tokenInfo.refreshToken !== savedToken) {
    throw new StatusError(403, '탈취된 토큰');
  }

  return tokenInfo;
};

export const verifyRefreshToken = (refreshToken: string) => {
  const decoded = token.verify(refreshToken, JWT_REFRESH_SECRET);

  if (type.isString(decoded)) {
    throw new StatusError(401, `토큰이 잘못됨: ${decoded}`);
  }

  if (isNil(decoded.email) || isNil(decoded.provider)) {
    throw new StatusError(401, '토큰에 필요한 정보가 포함되지 않음');
  }

  return {
    refreshToken,
    email: decoded.email,
    provider: decoded.provider,
  };
};

export const isRefreshTokenExist = (refreshToken?: string) => {
  if (refreshToken === '') {
    throw new StatusError(401, '토큰이 없음');
  }
  return refreshToken;
};

export const generateAccessToken = (email: string, provider: string) =>
  token.genToken({ email, provider }, JWT_ACCESS_SECRET, {
    expiresIn: `${ACCESS_TOKEN_EXPIRES_IN}s`,
  });

export const generateRefreshToken = (email: string, provider: string) =>
  token.genToken({ email, provider }, JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRES_IN}s`,
  });

export const generateTokens = (email: string, provider: string) => {
  const accessToken = generateAccessToken(email, provider);
  const refreshToken = generateRefreshToken(email, provider);

  return {
    accessToken,
    refreshToken,
  };
};

export const saveToken = async (email: string, refreshToken: string) => {
  await TokenModel.set({ email }, refreshToken);
};

export const checkAuthorization = async (
  refreshToken?: string
): Promise<StatusError | TokenInfo> => {
  const result = await corail.railRight(
    isUnusedToken,
    verifyRefreshToken,
    isRefreshTokenExist
  )(refreshToken);

  if (corail.isFailed(result)) {
    return result.err;
  }

  return result;
};
