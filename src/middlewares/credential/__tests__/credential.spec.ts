import { Mock, describe, expect, it, vi } from 'vitest';
import { StatusError } from '@/utils/error';
import * as Auth from '@/services/auth';
import authModel from '@/models/auth';
import {
  checkPayloadSatisfied,
  checkRefreshTokenExist,
  checkUnusedToken,
  checkVerifedToken,
} from '..';

vi.mock('@/models/auth', async (importOrigin) => {
  const mod = (await importOrigin()) as object;

  return {
    default: {
      ...mod,
      get: vi.fn(),
    },
  };
});

const setup = () => {
  const payload = {
    email: 'user@example.com',
    provider: 'example',
  };
  const refreshToken = Auth.generateRefreshToken(payload);

  return { payload, refreshToken };
};

describe('checkRefreshTokenExist', () => {
  it('should check token exist', async () => {
    const { refreshToken } = setup();

    expect(() => {
      checkRefreshTokenExist(refreshToken);
    }).not.toThrow(new StatusError(401, 'Token not exist'));

    const result = checkRefreshTokenExist(refreshToken);
    expect(result).toEqual({ refreshToken });
  });

  it('should throw StatusError when refresh token not given', async () => {
    expect(() => {
      checkRefreshTokenExist();
    }).toThrow(StatusError);
  });
});

describe('checkVerifedToken', () => {
  it('should check given token is verifed', async () => {
    const { refreshToken } = setup();

    expect(() => {
      checkVerifedToken({ refreshToken });
    }).not.toThrow(StatusError);

    const result = checkVerifedToken({ refreshToken });
    expect(result).toEqual({
      originToken: refreshToken,
      payload: Auth.decodeRefreshToken(refreshToken),
    });
  });

  it('should throw StatusError when refresh token is not valid', async () => {
    expect(() => {
      checkVerifedToken({ refreshToken: 'imnotatoken' });
    }).toThrow(StatusError);
  });
});

describe('checkPayloadSatisfied', () => {
  it('should check token payload is satisfied', async () => {
    const { payload, refreshToken } = setup();

    expect(() => {
      checkPayloadSatisfied({ payload, originToken: refreshToken });
    }).not.toThrow(StatusError);

    const result = checkPayloadSatisfied({
      payload,
      originToken: refreshToken,
    });

    expect(result.originToken).toBe(refreshToken);
    expect(result.payload.email).toEqual(payload.email);
    expect(result.payload.provider).toEqual(payload.provider);
  });

  it('should throw StatusError when payload is not satisfied', async () => {
    const { refreshToken } = setup();

    const payload1 = {
      provider: 'example',
    };
    const payload2 = {
      email: 'user@example.com',
    };

    expect(() => {
      checkPayloadSatisfied({
        payload: payload1 as Auth.TokenPayload,
        originToken: refreshToken,
      });
    }).toThrow(StatusError);

    expect(() => {
      checkPayloadSatisfied({
        payload: payload2 as Auth.TokenPayload,
        originToken: refreshToken,
      });
    }).toThrow(StatusError);
  });
});

describe('checkUnusedToken', () => {
  it('should check token is already used', async () => {
    const { payload, refreshToken } = setup();

    (authModel.get as Mock).mockReturnValue(refreshToken);

    const result = await checkUnusedToken({
      payload,
      originToken: refreshToken,
    });

    expect(result.email).toEqual(payload.email);
    expect(result.provider).toEqual(payload.provider);
  });

  it('should throw StatusError when token is already used', async () => {
    const { payload, refreshToken } = setup();

    (authModel.get as Mock).mockReturnValue('imanothertoken');

    await expect(() =>
      checkUnusedToken({
        payload,
        originToken: refreshToken,
      })
    ).rejects.toThrow(StatusError);
  });
});
