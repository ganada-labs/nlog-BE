import mongoose, { Schema, model } from 'mongoose';
import { CRUDable } from './types.ts';

interface TestSchema {
  name: string;
}

let isConnected = false;

const connecter = mongoose.connect('mongodb://localhost:27017/test', {}).then(
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

const create = async (data: TestSchema) => {
  try {
    if (!isConnected) {
      await connecter;
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

const read = async (
  query: Partial<TestSchema>,
  select: Partial<TestSchema>
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

const update = async (
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

const remove = async (query: Partial<TestSchema>) => {
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
