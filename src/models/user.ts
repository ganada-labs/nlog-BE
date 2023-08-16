import { Schema, model } from '@/infrastructures/mongodb.ts';
import type { CRUDable, Create, Read, Update, Remove } from './types.ts';

export interface UserSchema {
  email: string;
  name: string;
}

/**
 * TODO: 유저 스키마 정하고 갱신
 */
const userSchema = new Schema<UserSchema>({
  email: { type: String, required: true },
  name: { type: String, required: true },
});

const UserModel = model<UserSchema>('User', userSchema);

const create: Create<UserSchema> = async (data: UserSchema) => {
  try {
    const isExist = await UserModel.exists({ email: data.email });
    if (isExist) {
      throw Error(`key: ${data.email} is already exist`);
    }

    await new UserModel({
      email: data.email,
      name: data.name,
    }).save();

    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
};

const read: Read<UserSchema> = async (
  query: Partial<UserSchema>,
  select?: Partial<UserSchema>
) => {
  try {
    const result = await UserModel.findOne(query, select);

    return result;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return null;
  }
};

const update: Update<UserSchema> = async (
  query: Partial<UserSchema>,
  data: Partial<UserSchema>
) => {
  try {
    await UserModel.updateOne(query, data);

    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
};

const remove: Remove<UserSchema> = async (query: Partial<UserSchema>) => {
  try {
    await UserModel.deleteOne(query);

    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
};

export default {
  create,
  read,
  update,
  remove,
} satisfies CRUDable<UserSchema>;
