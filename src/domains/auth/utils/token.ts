import jwt from 'jsonwebtoken';
import * as type from '@/utils/types';

export const ACCESS_TOKEN_EXPIRES_IN = 3600; // 1 hour
export const REFRESH_TOKEN_EXPIRES_IN = 3600 * 24 * 14; // 14 day

const JWT_SECRET: jwt.Secret = import.meta.env.VITE_JWT_SECRET ?? 'my_secret';

export type TokenPayload = string | object | Buffer;
export type TokenSuccessDecoded = jwt.JwtPayload;
export type TokenDecoded = string | TokenSuccessDecoded;

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
    expiresIn: `${REFRESH_TOKEN_EXPIRES_IN}s`,
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
    expiresIn: `${ACCESS_TOKEN_EXPIRES_IN}s`,
  };

  return genToken(payload, options);
};

/**
 * 엑세스 토큰과 리프레시 토큰을 생성해 반환한다.
 *
 * @param payload 토큰 페이로드
 * @returns Access Token
 */
export const genTokens = (payload: TokenPayload) => {
  const accessToken = genAccessToken(payload);
  const refreshToken = genRefreshToken(payload);

  return { accessToken, refreshToken };
};
/**
 * 토큰을 검증한다.
 *
 * @param token 토큰 문자열
 * @returns 토큰 디코딩 결과 혹은 실패 메세지
 */
export const verify = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (type.isString(decoded)) {
      throw Error('검증에 실패함');
    }

    return decoded;
  } catch (err) {
    if (err instanceof Error) {
      return err.message;
    }
    return '토큰에서 알 수 없는 에러 발생';
  }
};
/**
 * authorization 헤더 문자열로부터 토큰을 분리해 반환한다.
 *
 * @param authorization authorization 헤더
 * @returns 토큰 문자열
 */
export const getBearerCredential = (authorization: string | undefined) => {
  if (type.isNil(authorization)) return '';

  const [scheme, credential] = authorization.split(' ');

  if (scheme !== 'Bearer') return '';
  return credential;
};
