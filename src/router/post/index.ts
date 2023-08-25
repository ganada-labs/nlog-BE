import { koaBody } from 'koa-body';
import { type Context } from 'koa';
import Router from '@koa/router';
import PostModel, { type MetaSchema, type PostSchema } from '@/models/post';
import { uid } from '@/packages/uid';
import { checkCredential } from '@/middlewares/credential';
import { type Nil, isNil } from '@/utils';
import { UpdateQuery } from '@/infrastructures/mongodb';

type PostQuery = {
  id?: string;
  author?: PostSchema['meta']['author'];
};
type PostBody = {
  contents?: object[];
  title?: string;
};
const post = new Router({ prefix: '/post' });

const isPostNotExist = (p?: Partial<PostSchema> | null): p is Nil => isNil(p);
const isPostOwner = (email: string, metaInfo?: Partial<MetaSchema>) =>
  !isNil(metaInfo) && metaInfo.author !== email;
const addAuthorToQuery = (author?: PostQuery['author'], query = {}) => {
  if (author) {
    return {
      ...query,
      'meta.author': author,
    };
  }
  return query;
};
const addTitleToQuery = (title?: PostBody['title'], query = {}) => {
  if (title) {
    return {
      ...query,
      title,
    };
  }
  return query;
};
const addContentsToQuery = (contents?: PostBody['contents'], query = {}) => {
  if (contents) {
    return {
      ...query,
      contents,
    };
  }
  return query;
};
const addModifiedToQuery = (modifiedAt?: Date, query = {}) => {
  if (modifiedAt) {
    return {
      ...query,
      'meta.modifiedAt': modifiedAt,
    };
  }
  return query;
};

async function getPostList(query: { author?: string }) {
  return PostModel.readAll(query);
}

async function getPostById(id: string) {
  return PostModel.read({ id });
}

async function removePostById(id: string) {
  return PostModel.remove({ id });
}

async function updatePostById(
  id: string,
  updateQuery: UpdateQuery<PostSchema>
) {
  return PostModel.update({ id }, updateQuery);
}
/**
 * @api {get} /post/:id Read Post
 * @apiDescription 특정 id의 포스트를 조회한다. API
 * 해당하는 id의 포스트를 읽고 반환한다.
 *
 * @apiVersion 0.1.0
 * @apiGroup Post
 */
post.get('/:id', async (ctx: Context) => {
  const { id } = ctx.params;

  const doc = await getPostById(id);

  ctx.status = 200;
  ctx.body = doc;
});

/**
 * @api {get} /post Read Post list
 * @apiDescription 포스트 목록을 조회한다.
 * 포스트 목록을 조회한다.
 * 쿼리를 통해 특정 조건의 포스트만 조회할 수 있다.
 * TODO: 페이지네이션을 적용한다.
 *
 * @apiParam {String} [author] 글 작성자의 이메일
 * @apiVersion 0.1.0
 * @apiGroup Post
 */
post.get('/', async (ctx: Context) => {
  const { query } = ctx.request;
  const { author } = query as PostQuery;

  const filterQuery = addAuthorToQuery(author, {});
  const posts = await getPostList(filterQuery);

  ctx.status = 200;
  ctx.body = posts;
});

/**
 * @api {post} /post Create Post
 * @apiDescription 포스트를 생성하는 API
 * 전달받은 컨텐츠로 포스트를 생성하고 아이디를 부여한다.
 *
 * @apiVersion 0.1.0
 * @apiGroup Post
 * @apiHeader {String} authorization 인증 토큰, Bearer 사용
 */
post.post('/', checkCredential, koaBody(), async (ctx: Context) => {
  const { title, contents } = ctx.request.body;
  const { email } = ctx.state.user;

  const newPost: PostSchema = {
    id: uid(),
    title,
    contents,
    meta: {
      author: email,
    },
  };

  await PostModel.create(newPost);

  ctx.status = 200;
});

/**
 * @api {delete} /post Delete Post
 * @apiDescription 포스트를 제거하는 API
 * body에 id 정보를 전달하면 해당하는 post를 제거한다.
 *
 * @apiParam {String} id 제거할 포스트의 id
 * @apiVersion 0.1.0
 * @apiGroup Post
 * @apiHeader {String} authorization 인증 토큰, Bearer 사용
 */
post.delete('/', checkCredential, koaBody(), async (ctx: Context) => {
  const { query } = ctx.request;
  const { email } = ctx.state.user;
  const { id } = query as PostQuery;

  if (isNil(id)) {
    ctx.throw(400, 'Bad Request');
  }
  const targetPost = await getPostById(id);
  if (isPostNotExist(targetPost)) {
    ctx.throw(400, 'Bad Request');
  }
  if (!isPostOwner(email, targetPost.meta)) {
    ctx.throw(403, 'Forbidden');
  }

  await removePostById(id);

  ctx.status = 200;
});

/**
 * @api {patch} /post Update Post
 * @apiDescription 포스트를 수정하는 API
 * body에 id 정보를 전달하면 해당하는 post를 수정한다.
 *
 * @apiBody {String} id 수정할 포스트의 id
 * @apiBody {String} [title] 새 타이틀
 * @apiVersion 0.1.0
 * @apiGroup Post
 * @apiHeader {String} authorization 인증 토큰, Bearer 사용
 */
post.patch('/', checkCredential, koaBody(), async (ctx: Context) => {
  const { id, title, contents } = ctx.request.body;
  const { email } = ctx.state.user;

  if (isNil(id)) {
    ctx.throw(400, 'Bad Request');
  }
  const targetPost = await getPostById(id);
  if (isPostNotExist(targetPost)) {
    ctx.throw(400, 'Bad Request');
  }
  if (!isPostOwner(email, targetPost.meta)) {
    ctx.throw(403, 'Forbidden');
  }

  const updateQuery = addModifiedToQuery(
    new Date(),
    addContentsToQuery(contents, addTitleToQuery(title, {}))
  );

  await updatePostById(id, updateQuery);
  ctx.status = 200;
});

export default post;
