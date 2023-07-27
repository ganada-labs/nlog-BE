import { ENV } from '@/constants/index.ts';
import { createClient } from 'redis';

interface TokenSchema {
  id: string;
  value: string;
}

let isConnected = false;

const client = createClient({
  url: `redis://${ENV.REDIS_HOST}:${ENV.REDIS_PORT}`,
});

client.connect().then(
  () => {
    isConnected = true;
    console.info('Redis Connected!');
  },
  (err) => {
    console.error('Redis Error', err);
  }
);

const set = async (data: TokenSchema) => {
  try {
    if (!isConnected) {
      throw Error('DB is not connected');
    }

    await client.set(data.id, data.value);
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
};

const get = async (query: { id: TokenSchema['id'] }) => {
  try {
    if (!isConnected) {
      throw Error('DB is not connected');
    }
    const result = await client.get(query.id);

    return result;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return null;
  }
};

const Token = {
  set,
  get,
};

export default Token;
