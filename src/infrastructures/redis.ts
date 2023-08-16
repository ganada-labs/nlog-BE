import { createClient } from 'redis';

const REDIS_HOST = import.meta.env.VITE_REDIS_HOST ?? 'localhost';
const REDIS_PORT = import.meta.env.VITE_REDIS_PORT ?? '6379';
const REDIS_URL = `redis://${REDIS_HOST}:${REDIS_PORT}`;

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
