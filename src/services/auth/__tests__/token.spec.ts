import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TokenModel from '@/models/auth';
import { type } from '@/utils';
import * as token from '../token';

vi.mock('@/models/auth', async (importOriginal) => {
  const origin = (await importOriginal()) as object;
  const set = vi.fn();

  return {
    default: {
      ...origin,
      set,
    },
  };
});

const setup = () => {
  const payload = {
    email: 'abc@example.com',
    provider: 'example',
  };

  return {
    payload,
  };
};

describe('token', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2000, 1, 1, 1, 1));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('토큰을 만들 수 있다', () => {
    const { payload } = setup();

    const accessToken = token.generateAccessToken(payload);
    const refreshToken = token.generateRefreshToken(payload);

    expect(accessToken.length > 0).toBe(true);
    expect(refreshToken.length > 0).toBe(true);
  });

  it('토큰을 저장할 수 있다', async () => {
    const { payload } = setup();

    const refreshToken = token.generateRefreshToken(payload);
    await token.saveToken(payload.email, refreshToken);

    expect(TokenModel.set).toBeCalledWith(
      { email: payload.email },
      refreshToken
    );
  });

  it('리프레시 토큰을 해석할 수 있다', () => {
    const { payload } = setup();

    const refreshToken = token.generateRefreshToken(payload);
    const decoded = token.decodeRefreshToken(refreshToken);

    expect(type.isString(decoded)).toBe(false);

    const maybePayload = !type.isString(decoded) && {
      email: decoded.email,
      provider: decoded.provider,
    };
    expect(maybePayload).toStrictEqual(payload);
  });
});
