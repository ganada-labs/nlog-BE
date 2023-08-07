import { createClient } from 'redis';

type Token = string;

interface TokenSchema {
  email: string;
  token: Token;
}

export type TokenQuery = Omit<TokenSchema, 'token'>;

const REDIS_HOST = import.meta.env.VITE_REDIS_HOST ?? 'localhost';
const REDIS_PORT = import.meta.env.VITE_REDIS_PORT ?? '6379';
const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}`;

const createKey = (query: TokenQuery) => `${query.email}`;

const client = createClient({
  url: REDIS_URL,
});

client.connect().then(
  () => {
    console.info('Redis Connected!');
  },
  (err) => {
    console.error('Redis Error', err);
  }
);

const set = async (query: TokenQuery, value: Token) => {
  try {
    const key = createKey(query);
    await client.set(key, value);

    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
};

const remove = async (query: TokenQuery) => {
  try {
    const key = createKey(query);
    await client.del(key);

    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
};

const get = async (query: TokenQuery) => {
  try {
    const key = createKey(query);
    const result = await client.get(key);

    return result;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return null;
  }
};

export default {
  set,
  get,
  remove,
};
