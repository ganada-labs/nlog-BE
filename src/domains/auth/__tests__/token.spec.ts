import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as token from '../token';

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

  it.todo('토큰을 검증할 수 있다');
});
