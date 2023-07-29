import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import * as type from '@/utils/types';

export const ACCESS_TOKEN_EXPIRES_IN = '3600s';
export const REFRESH_TOKEN_EXPIRES_IN = '14d';
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET ?? 'boostcamphimdura';

export type TokenPayload = string | object | Buffer;
export type TokenDecoded = string | jwt.Jwt | jwt.JwtPayload;

const genToken = (payload: TokenPayload, options?: jwt.SignOptions) =>
  jwt.sign(payload, JWT_SECRET, options);

/**
 * 리프레시 토큰을 생성해 반환한다.
 *
 * @param payload 토큰 페이로드
 * @returns Refresh Token
 */
export const genRefreshToken = (payload: TokenPayload) => {
  const options = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  };

  return genToken(payload, options);
};

/**
 * 엑세스 토큰을 생성해 반환한다.
 *
 * @param payload 토큰 페이로드
 * @returns Access Token
 */
export const genAccessToken = (payload: TokenPayload) => {
  const options = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  };

  return genToken(payload, options);
};

export const verify = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

    if (type.isString(decoded)) {
      throw Error('검증에 실패함');
    }

    return decoded;
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      return err.message;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return '토큰에서 알 수 없는 에러 발생';
  }
};