import PostModel, { type MetaSchema, type PostSchema } from '@/models/post';
import { type Nil, isNil } from '@/utils';
import { UpdateQuery } from '@/infrastructures/mongodb';

export const isPostNotExist = (p?: Partial<PostSchema> | null): p is Nil =>
  isNil(p);

export const isPostOwner = (email: string, metaInfo?: Partial<MetaSchema>) =>
  !isNil(metaInfo) && metaInfo.author !== email;

export async function getPostList(query: { author?: string }) {
  return PostModel.readAll(query);
}

export async function getPostById(id: string) {
  return PostModel.read({ id });
}

export async function removePostById(id: string) {
  return PostModel.remove({ id });
}

export async function updatePostById(
  id: string,
  updateQuery: UpdateQuery<PostSchema>
) {
  return PostModel.update({ id }, updateQuery);
}
