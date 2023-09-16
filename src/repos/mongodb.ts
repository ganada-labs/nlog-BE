import mongoose from 'mongoose';
import { ENV } from '@/constants';

const MONGO_URL = `mongodb://${ENV.MONGO_HOST}:${ENV.MONGO_PORT}/${ENV.MONGO_DBNAME}`;

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
