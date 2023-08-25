import { koaBody } from 'koa-body';
import { type Context } from 'koa';
import Router from '@koa/router';
import PostModel, { type PostSchema } from '@/models/post';
import { uid } from '@/packages/uid';
import { checkCredential } from '@/middlewares/credential';
import { updateQuery } from '@/utils';
import {
  checkAuthority,
  checkIdExist,
  getPostById,
  getPostList,
  isPostNotExist,
  removePostById,
  updatePostById,
} from '@/services/post';
import corail from '@/packages/corail';
import { StatusError } from '@/utils/error';

type PostQuery = {
  id?: string;
  author?: PostSchema['meta']['author'];
};
type PostBody = {
  id?: string;
  contents?: object[];
  title?: string;
};
const post = new Router({ prefix: '/post' });

const getPost = async (data: { id: string; email: string }) => {
  const targetPost = await getPostById(data.id);
  if (isPostNotExist(targetPost)) {
    throw new StatusError(400, 'Bad Request');
  }

  return {
    ...data,
    targetPost,
  };
};

const removePost = async (data: {
  id: string;
  targetPost: PostSchema;
  email: string;
}) => {
  await removePostById(data.id);
};

const saveModifiedPost = async <T extends { id: string; query: object }>(
  context: T
) => {
  const isSuccess = await updatePostById(context.id, context.query);

  if (!isSuccess) {
    throw new StatusError(500, 'Internal Server Error');
  }

  return context;
};

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

  const result = await corail.railRight(getPostById)(id);

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.throw(error.status, error.message);
  }

  ctx.status = 200;
  ctx.body = result;
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

  const result = await corail.railRight(
    getPostList,
    updateQuery('meta.author', author)
  )({});

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.throw(error.status, error.message);
  }

  ctx.status = 200;
  ctx.body = result;
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

  const result = await corail.railRight(
    removePost,
    checkAuthority,
    getPost,
    checkIdExist
  )({ id, email });

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.throw(error.status, error.message);
  }

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
  const { id, title, contents } = ctx.request.body as PostBody;
  const { email } = ctx.state.user;

  const updateModifiedAt = updateQuery('meta.modifiedAt', new Date());
  const updateContents = updateQuery('contents', contents);
  const updateTitle = updateQuery('title', title);

  const result = await corail.railRight(
    saveModifiedPost,
    updateModifiedAt,
    updateContents,
    updateTitle,
    checkAuthority,
    getPost,
    checkIdExist
  )({ id, email, title, contents });

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.throw(error.status, error.message);
  }
  ctx.status = 200;
});

export default post;
