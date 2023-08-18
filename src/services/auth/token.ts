import { isNil, token } from '@/utils';
import TokenModel from '@/models/auth';

export type TokenPayload = { email: string; provider: string };

export const ACCESS_TOKEN_EXPIRES_IN = 3600; // 1 hour
export const REFRESH_TOKEN_EXPIRES_IN = 3600 * 24 * 14; // 14 day

export const JWT_ACCESS_SECRET =
  import.meta.env.VITE_JWT_ACCESS_SECRET ?? 'my_access_secret';
export const JWT_REFRESH_SECRET =
  import.meta.env.VITE_JWT_REFRESH_SECRET ?? 'my_refresh_secret';

export const generateAccessToken = (payload: TokenPayload) =>
  token.genToken(payload, JWT_ACCESS_SECRET, {
    expiresIn: `${ACCESS_TOKEN_EXPIRES_IN}s`,
  });

export const generateRefreshToken = (payload: TokenPayload) =>
  token.genToken(payload, JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRES_IN}s`,
  });

export const saveToken = async (email: string, refreshToken: string) => {
  await TokenModel.set({ email }, refreshToken);
};

export const decodeRefreshToken = (refreshToken: string) =>
  token.verify(refreshToken, JWT_REFRESH_SECRET);

export const isUsedToken = async (email: string, tokenStr: string) => {
  const savedToken = await TokenModel.get({ email });
  if (isNil(savedToken) || tokenStr !== savedToken) {
    return true;
  }

  return false;
};

export const isPayloadSatisfied = (
  payload: Record<string, string>
): payload is TokenPayload => !isNil(payload.email) && !isNil(payload.provider);
