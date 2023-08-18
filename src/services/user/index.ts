import UserModel, { type UserSchema } from '@/models/user';

export const signup = ({ email, name }: UserSchema) =>
  UserModel.create({ email, name });

export const isNotSigned = async (email: string) =>
  !(await UserModel.read({ email }));
