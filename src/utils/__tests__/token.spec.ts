import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isString, token } from '@/utils';

const setup = () => {
  const content = {
    id: 'abc',
  };
  const accessToken = token.genAccessToken(content);
  const refreshToken = token.genRefreshToken(content);

  return { content, accessToken, refreshToken };
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
    const { accessToken } = setup();

    const setDecoded = () => {
      token.verify(accessToken);
    };
    expect(setDecoded).not.toThrowError();
  });

  it('엑세스 토큰을 만들 수 있다', () => {
    const { content } = setup();

    const accessToken = token.genAccessToken(content);

    expect(() => token.verify(accessToken)).not.toThrowError();
    const decoded = token.verify(accessToken);
    expect(isString(decoded) ? false : decoded.id).toBe(content.id);
  });

  it('리프레시 토큰을 만들 수 있다', () => {
    const { content } = setup();

    const refreshToken = token.genRefreshToken(content);

    expect(() => token.verify(refreshToken)).not.toThrowError();
    const decoded = token.verify(refreshToken);
    expect(isString(decoded) ? false : decoded.id).toBe(content.id);
  });
});
