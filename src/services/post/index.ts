import PostModel, { type MetaSchema, type PostSchema } from '@/models/post';
import { type Nil, isNil } from '@/utils';
import { type UpdateQuery } from '@/infrastructures/mongodb';
import { checkCondition, updateQuery } from '@/utils/context';
import { StatusError } from '@/utils/error';

export const isPostNotExist = (p?: Partial<PostSchema> | null): p is Nil =>
  isNil(p);

export const isPostOwner = (email: string, metaInfo?: Partial<MetaSchema>) =>
  !isNil(metaInfo) && metaInfo.author === email;

export async function getPostById(id: string) {
  return PostModel.read({ id });
}

export async function removePostById(id: string) {
  return PostModel.remove({ id });
}

export async function updatePostById(
  id: string,
  query: UpdateQuery<PostSchema>
) {
  return PostModel.update({ id }, query);
}

export const updateAuthor = (value?: string) =>
  updateQuery('meta.author', value);

export const updateTitle = (value?: string) => updateQuery('title', value);
export const updateContents = (value?: object[]) =>
  updateQuery('contents', value);

export const updateModifiedAt = (value?: Date) =>
  updateQuery('meta.modifiedAt', value);

export const checkAuthority = checkCondition<{
  email: string;
  post: PostSchema;
}>(
  (context) => isPostOwner(context.email, context.post.meta),
  new StatusError(403, 'Forbidden')
);

export const checkIdExist = checkCondition<{ id?: string }>(
  (context: { id?: string }) => !isNil(context.id),
  new StatusError(400, 'Bad Request')
);

export async function readPostList<T extends { query: { author?: string } }>(
  context: T
) {
  console.log(context.query);
  const posts = await PostModel.readAll(context.query);
  console.log(posts);
  return {
    ...context,
    posts,
  };
}

export async function readPost<T extends { id: string }>(context: T) {
  const post = await getPostById(context.id);
  if (isPostNotExist(post)) {
    throw new StatusError(400, 'Bad Request');
  }

  return {
    ...context,
    post,
  };
}
export async function removePost<T extends { id: string }>(context: T) {
  const isSuccess = await removePostById(context.id);
  if (!isSuccess) {
    throw new StatusError(500, 'Internal Server Error');
  }

  return context;
}

export async function updatePost<T extends { id: string; query: object }>(
  context: T
) {
  const isSuccess = await updatePostById(context.id, context.query);
  if (!isSuccess) {
    throw new StatusError(500, 'Internal Server Error');
  }

  return context;
}
