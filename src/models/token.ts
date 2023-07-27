// import { ENV } from '@/constants/index.ts';
import { createClient } from 'redis';

interface TokenSchema {
  id: string;
  value: string;
}

let isConnected = false;

const client = createClient({});
client.on('connect', () => {
  isConnected = true;
  console.info('Redis Connected!');
});
client.on('error', (err) => {
  console.error('Redis Error', err);
});
client.connect().then();

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
