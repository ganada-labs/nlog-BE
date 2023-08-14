import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isString } from '@/utils';
import * as token from '../token';

const setup = () => {
  const content = {
    id: 'abc',
  };
  const accessSecret = 'access-secret';
  const refreshSecret = 'refresh-secret';
  const accessToken = token.genToken(content, accessSecret);
  const refreshToken = token.genToken(content, refreshSecret);
  const authorization = 'Bearer abc';

  return {
    content,
    accessToken,
    refreshToken,
    authorization,
    accessSecret,
    refreshSecret,
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

  it('토큰을 검증할 수 있다', () => {
    const { accessToken, accessSecret } = setup();

    const setDecoded = () => {
      token.verify(accessToken, accessSecret);
    };
    expect(setDecoded).not.toThrowError();
  });

  it('토큰을 만들 수 있다', () => {
    const { content, accessSecret } = setup();

    const accessToken = token.genToken(content, accessSecret);

    expect(() => token.verify(accessToken, accessSecret)).not.toThrowError();

    const decoded = token.verify(accessToken, accessSecret);
    expect(isString(decoded) ? false : decoded.id).toBe(content.id);
  });

  it('authorization 헤더에서 토큰을 꺼내 반환할 수 있다.', () => {
    const credential1 = token.getBearerCredential('Bearer abc');
    const credential2 = token.getBearerCredential('B abc');
    const credential3 = token.getBearerCredential('abc');

    expect(credential1).toBe('abc');
    expect(credential2).not.toBe('abc');
    expect(credential3).not.toBe('abc');
  });
});
