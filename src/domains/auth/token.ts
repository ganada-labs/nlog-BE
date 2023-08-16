import { token } from '@/utils';

export type TokenPayload = { email: string; provider: string };

export const ACCESS_TOKEN_EXPIRES_IN = 3600; // 1 hour
export const REFRESH_TOKEN_EXPIRES_IN = 3600 * 24 * 14; // 14 day

export const JWT_ACCESS_SECRET =
  import.meta.env.VITE_JWT_ACCESS_SECRET ?? 'my_access_secret';
export const JWT_REFRESH_SECRET =
  import.meta.env.VITE_JWT_REFRESH_SECRET ?? 'my_refresh_secret';

export const generateAccessToken = (email: string, provider: string) =>
  token.genToken({ email, provider }, JWT_ACCESS_SECRET, {
    expiresIn: `${ACCESS_TOKEN_EXPIRES_IN}s`,
  });

export const generateRefreshToken = (email: string, provider: string) =>
  token.genToken({ email, provider }, JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRES_IN}s`,
  });
