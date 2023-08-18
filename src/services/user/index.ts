import UserModel, { type UserSchema } from '@/models/user';
import { isEmail } from '@/utils';

type UserRawData = {
  displayName: string;
  emails: {
    value: string;
    verified: boolean;
  }[];
  provider: string;
};

export type UserData = {
  userName: string;
  userEmail: string;
  provider: string;
};

export const signup = ({ email, name }: UserSchema) =>
  UserModel.create({ email, name });

export const isNotSigned = async (email: string) =>
  !(await UserModel.read({ email }));

export const normalizeUser = (raw: UserRawData): UserData => {
  const userName = raw.displayName;
  const userEmail = raw.emails.find((email) => email.verified)?.value ?? '';
  const { provider } = raw;

  return {
    userName,
    userEmail,
    provider,
  };
};

export const isEmailNotExist = (email?: string): email is undefined => {
  if (isEmail(email)) {
    return false;
  }

  return true;
};
