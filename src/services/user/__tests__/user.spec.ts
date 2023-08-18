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

  return {
    email,
    name,
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
