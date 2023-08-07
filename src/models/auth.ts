import { client } from '@/repositories/redis';

type Token = string;

interface TokenSchema {
  email: string;
  token: Token;
}

export type TokenQuery = Omit<TokenSchema, 'token'>;

const createKey = (query: TokenQuery) => `${query.email}`;

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
