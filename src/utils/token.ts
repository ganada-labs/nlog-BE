import jwt from 'jsonwebtoken';

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

export const verify = (token: string) => jwt.verify(token, JWT_SECRET);
