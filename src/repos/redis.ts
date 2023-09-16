import { createClient } from 'redis';
import { ENV } from '@/constants';

const REDIS_URL = `redis://${ENV.REDIS_HOST}:${ENV.REDIS_PORT}`;

export const client = createClient({
  url: REDIS_URL,
});

export const connect = () => {
  client.connect().then(
    () => {
      console.info('Redis Connected!');
    },
    (err) => {
      console.error('Redis Error', err);
    }
  );
};
