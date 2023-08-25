import mongoose from 'mongoose';

const MONGO_HOST = import.meta.env.VITE_MONGO_HOST ?? 'localhost';
const MONGO_PORT = import.meta.env.VITE_MONGO_PORT ?? '27019';
const MONGO_URL = `mongodb://${MONGO_HOST}:${MONGO_PORT}/nlog`;

export const connect = () => {
  mongoose
    .connect(MONGO_URL, {
      serverSelectionTimeoutMS: 1000,
    })
    .then(
      () => {
        console.info('Mongo Connected!');
      },
      (err) => {
        console.error(err.message);
      }
    );
};

export { Schema, model, type FilterQuery, type UpdateQuery } from 'mongoose';
