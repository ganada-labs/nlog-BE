import { Mock, describe, expect, it, vi } from 'vitest';
import UserModel from '@/models/user';
import * as user from '..';

vi.mock('@/models/user', async (importOriginal) => {
  const origin = (await importOriginal()) as object;

  return {
    default: {
      ...origin,
      read: vi.fn(),
      create: vi.fn(),
    },
  };
});

const setup = () => {
  const email = 'user@example.com';
  const name = 'john doe';
  const provider = 'example';

  const rawUserData = {
    displayName: name,
    emails: [{ value: email, verified: true }],
    provider,
  };

  return {
    email,
    name,
    provider,
    rawUserData,
  };
};

describe('isNotSigned', () => {
  it('should return false if user exist', async () => {
    const { email } = setup();
    (UserModel.read as Mock).mockReturnValue({});

    const result = await user.isNotSigned(email);
    expect(result).toBe(false);
  });

  it('should return true if user not exist', async () => {
    const { email } = setup();
    (UserModel.read as Mock).mockReturnValue(undefined);

    const result = await user.isNotSigned(email);
    expect(result).toBe(true);
  });
});

describe('signup', () => {
  it('should store new user when signup', async () => {
    const { email, name } = setup();
    const spy = vi.spyOn(UserModel, 'create');

    await user.signup({ email, name });
    expect(spy).toBeCalled();
  });
});

describe('normalizeUser', () => {
  it('should normalize raw user data from google', async () => {
    const { rawUserData, email, name, provider } = setup();

    const result = user.normalizeUser(rawUserData);
    expect(result).toEqual({
      userName: name,
      userEmail: email,
      provider,
    });
  });
});

describe('isEmailNotExist', () => {
  it('should return email existance', async () => {
    const { email } = setup();

    expect(user.isEmailNotExist(email)).toBe(false);
    expect(user.isEmailNotExist('')).toBe(true);
    expect(user.isEmailNotExist(undefined)).toBe(true);
  });
});
