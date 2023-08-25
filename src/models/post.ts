import { Schema, model } from '@/infrastructures/mongodb';

import type {
  CRUDable,
  Create,
  Read,
  ReadAll,
  Update,
  Remove,
} from './types.ts';

export interface MetaSchema {
  author: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface PostSchema {
  id: string;
  title: string;
  contents?: object[];
  meta: MetaSchema;
}

const metaSchema = new Schema<MetaSchema>({
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

const postSchema = new Schema<PostSchema>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  contents: { type: Array, default: [] },
  meta: metaSchema,
});

const PostModel = model<PostSchema>('Post', postSchema);

const create: Create<PostSchema> = async (data: PostSchema) => {
  try {
    const isExist = await PostModel.exists({ id: data.id });
    if (isExist) {
      throw Error(`key: ${data.id} is already exist`);
    }

    await new PostModel({
      ...data,
    }).save();

    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
};

const read: Read<PostSchema> = async (
  query: Partial<PostSchema>,
  select?: Partial<PostSchema>
) => {
  try {
    const result = await PostModel.findOne(query, select);

    return result;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return null;
  }
};

const readAll: ReadAll<PostSchema> = async (query, select?) => {
  try {
    const result = await PostModel.find(query, select);

    return result;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return [];
  }
};

const update: Update<PostSchema> = async (query, data) => {
  try {
    await PostModel.updateOne(query, data);

    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
};

const remove: Remove<PostSchema> = async (query: Partial<PostSchema>) => {
  try {
    await PostModel.deleteOne(query);

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
  readAll,
  update,
  remove,
} satisfies CRUDable<PostSchema>;
