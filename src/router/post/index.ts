import { koaBody } from 'koa-body';
import { type Context } from 'koa';
import Router from '@koa/router';
import PostModel, { type PostSchema } from '@/models/post';
import { uid } from '@/packages/uid';
import { checkCredential } from '@/middlewares/credential';
import {
  checkAuthority,
  checkIdExist,
  readPost,
  readPostList,
  removePost,
  updateAuthor,
  updateContents,
  updateModifiedAt,
  updatePost2,
  updateTitle,
} from '@/services/post';
import corail from '@/packages/corail';
import { StatusError } from '@/utils/error';

type PostQuery = {
  author?: PostSchema['meta']['author'];
};

type PostBody = {
  contents?: object[];
  title?: string;
};

const post = new Router({ prefix: '/post' });

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

  const result = await corail.railRight(readPost)({ id });

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.throw(error.status, error.message);
  }

  const { post: targetPost } = result;

  ctx.status = 200;
  ctx.body = targetPost;
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

  const result = await corail.railRight(readPostList, updateAuthor(author))({});

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.throw(error.status, error.message);
  }

  ctx.status = 200;
  ctx.body = result.posts;
});

/**
 * @api {post} /post Create Post
 * @apiDescription 포스트를 생성하는 API
 * 전달받은 컨텐츠로 포스트를 생성하고 아이디를 부여한다.
 *
 * @apiBody {String} [title] 타이틀
 * @apiBody {String} [contents] 컨텐츠
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
  ctx.body = {
    id: newPost.id,
  };
});

/**
 * @api {delete} /post/:id Delete Post
 * @apiDescription 포스트를 제거하는 API
 * id에 해당하는 post를 제거한다.
 *
 * @apiVersion 0.1.0
 * @apiGroup Post
 * @apiHeader {String} authorization 인증 토큰, Bearer 사용
 */
post.delete('/:id', checkCredential, koaBody(), async (ctx: Context) => {
  const { id } = ctx.params;
  const { email } = ctx.state.user;

  const result = await corail.railRight(
    removePost,
    checkAuthority(new StatusError(403, 'Forbidden')),
    readPost,
    checkIdExist(new StatusError(400, 'Bad Request'))
  )({ id, email });

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.throw(error.status, error.message);
  }

  ctx.status = 200;
});

/**
 * @api {patch} /post/:id Update Post
 * @apiDescription 포스트를 수정하는 API
 * id에 해당하는 post를 수정한다.
 *
 * @apiBody {String} [title] 새 타이틀
 * @apiBody {String} [contents] 새 컨텐츠
 * @apiVersion 0.1.0
 * @apiGroup Post
 * @apiHeader {String} authorization 인증 토큰, Bearer 사용
 */
post.patch('/:id', checkCredential, koaBody(), async (ctx: Context) => {
  const { id } = ctx.params;
  const { title, contents } = ctx.request.body as PostBody;
  const { email } = ctx.state.user;

  const result = await corail.railRight(
    updatePost2(new StatusError(500, 'Internal Server Error')),
    updateModifiedAt(new Date()),
    updateContents(contents),
    updateTitle(title),
    checkAuthority(new StatusError(403, 'Forbidden')),
    readPost,
    checkIdExist(new StatusError(400, 'Bad Request'))
  )({ id, email, title, contents });

  if (corail.isFailed(result)) {
    const error = result.err as StatusError;
    ctx.throw(error.status, error.message);
  }
  ctx.status = 200;
});

export default post;
