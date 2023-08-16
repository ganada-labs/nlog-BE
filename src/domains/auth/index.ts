import corail from 'corail';

import TokenModel from '@/models/auth';
import { StatusError } from '@/utils/error';
import { isNil, type, token } from '@/utils';
import { type TokenPayload, JWT_REFRESH_SECRET } from './token';
/**
 * TODO: strategies auth 도메인으로 옮기기
 * network 관련 로직 분리
 * passport를 auth 도메인으로 이동
 */
export type TokenInfo = TokenPayload & {
  refreshToken: string;
};

export * from './token';

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
