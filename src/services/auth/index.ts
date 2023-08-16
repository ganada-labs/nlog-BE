import { StatusError } from '@/utils/error';
import { isNil, type } from '@/utils';
import { decodeRefreshToken } from './token';
/**
 * TODO: strategies auth 도메인으로 옮기기
 * network 관련 로직 분리
 * passport를 auth 도메인으로 이동
 */

export * from './token';

export const verifyRefreshToken = (refreshToken: string) => {
  const decoded = decodeRefreshToken(refreshToken);

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
