import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isString, token } from '@/utils';

const setup = () => {
  const content = {
    id: 'abc',
  };
  const accessToken = token.genAccessToken(content);
  const refreshToken = token.genRefreshToken(content);
  const authorization = 'Bearer abc';

  return { content, accessToken, refreshToken, authorization };
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

  it('리프레시 토큰과 액세스 토큰을 동시에 만들 수 있다', () => {
    const { content } = setup();

    const { refreshToken, accessToken } = token.genTokens(content);

    expect(() => token.verify(refreshToken)).not.toThrowError();
    expect(() => token.verify(accessToken)).not.toThrowError();

    const refreshTokenDecoded = token.verify(refreshToken);
    const accessTokenDecoded = token.verify(refreshToken);
    expect(isString(refreshTokenDecoded) ? false : refreshTokenDecoded.id).toBe(
      content.id
    );
    expect(isString(accessTokenDecoded) ? false : accessTokenDecoded.id).toBe(
      content.id
    );
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
