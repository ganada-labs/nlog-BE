import { describe, expect, it, vi } from 'vitest';
import { generateRefreshToken } from '@/services/auth';
import { StatusError } from '@/utils/error';
import { checkRefreshTokenExist } from '..';

vi.mock('@/models/');
const setup = () => {
  const payload = {
    email: 'user@example.com',
    provider: 'example',
  };
  const refreshToken = generateRefreshToken(payload);

  return { refreshToken };
};

describe('checkRefreshTokenExist', () => {
  it('should check cookie exist', async () => {
    const { refreshToken } = setup();

    expect(() => {
      checkRefreshTokenExist(refreshToken);
    }).not.toThrow(new StatusError(401, 'Token not exist'));

    const result = checkRefreshTokenExist(refreshToken);
    expect(result).toEqual({ refreshToken });
  });

  it('should throw 401 error when refresh token not given', async () => {
    expect(() => {
      checkRefreshTokenExist();
    }).toThrow(StatusError);
  });
});
