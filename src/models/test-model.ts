import mongoose, { Schema, model } from 'mongoose';
import type { CRUDable, Create, Read, Update, Remove } from './types.ts';

interface TestSchema {
  name: string;
}

let isConnected = false;

mongoose
  .connect('mongodb://host.docker.internal:27017/testdb', {
    serverSelectionTimeoutMS: 1000,
  })
  .then(
    () => {
      isConnected = true;
    },
    (err) => {
      console.error(err.message);
    }
  );

const testSchema = new Schema<TestSchema>({
  name: { type: String, required: true },
});

const TestModel = model<TestSchema>('Test', testSchema);

const create: Create<TestSchema> = async (data: TestSchema) => {
  try {
    if (!isConnected) {
      throw Error('DB is not connected');
    }
    const alreadyExist = await TestModel.exists({ name: data.name });
    if (alreadyExist) {
      throw Error(`key: ${data.name} is already exist`);
    }
    const newTest = new TestModel({
      name: data.name,
    });
    await newTest.save();
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
};

const read: Read<TestSchema> = async (
  query: Partial<TestSchema>,
  select?: Partial<TestSchema>
) => {
  try {
    const result = await TestModel.findOne(query, select);

    return result;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return null;
  }
};

const update: Update<TestSchema> = async (
  query: Partial<TestSchema>,
  data: Partial<TestSchema>
) => {
  try {
    await TestModel.updateOne(query, data);

    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
};

const remove: Remove<TestSchema> = async (query: Partial<TestSchema>) => {
  try {
    await TestModel.deleteOne(query);

    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
};

const Test: CRUDable<TestSchema> = {
  create,
  read,
  update,
  remove,
};

export default Test;
