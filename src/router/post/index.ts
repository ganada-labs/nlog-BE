import { koaBody } from 'koa-body';
import { type Context } from 'koa';
import Router from '@koa/router';
import PostModel, { PostSchema } from '@/models/post';
import { uid } from '@/packages/uid';
import { checkCredential } from '@/middlewares/credential';

const post = new Router({ prefix: '/post' });

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
  const { title } = ctx.request.body;
  const { email } = ctx.state.user;

  const newPost: PostSchema = {
    id: uid(),
    title,
    meta: {
      author: email,
    },
  };

  await PostModel.create(newPost);

  ctx.status = 200;
});

export default post;
