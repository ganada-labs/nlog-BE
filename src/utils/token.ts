import jwt from 'jsonwebtoken';
import { isString, isNil } from './types';

export type TokenSecret = jwt.Secret;
export type TokenPayload = string | object | Buffer;
export type TokenSuccessDecoded = jwt.JwtPayload;
export type TokenDecoded = string | TokenSuccessDecoded;
export type TokenOption = {
  expiresIn?: `${string}s`;
};

/**
 * 토큰을 생성해 반환한다.
 *
 * @param payload 토큰 페이로드
 * @returns Refresh Token
 */
export const genToken = (
  payload: TokenPayload,
  secret: TokenSecret,
  options?: TokenOption
) => jwt.sign(payload, secret, options);

/**
 * 토큰을 검증한다.
 *
 * @param token 토큰 문자열
 * @param secret 검증에 사용되는 비밀키
 * @returns 토큰 디코딩 결과 혹은 실패 메세지
 */
export const verify = (token: string, secret: TokenSecret) => {
  try {
    const decoded = jwt.verify(token, secret);

    if (isString(decoded)) {
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
  if (isNil(authorization)) return '';

  const [scheme, credential] = authorization.split(' ');

  if (scheme !== 'Bearer') return '';
  return credential;
};
