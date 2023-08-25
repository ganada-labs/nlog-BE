import { isNil } from './types';

type Query = Record<string, any>;

export const updateQuery =
  (property: string, value?: any) => (context: { query?: Query }) => {
    if (isNil(value)) return context;

    return {
      ...context,
      query: {
        ...context.query,
        [property]: value,
      },
    };
  };

export const checkCondition =
  <T extends object>(condition: (context: T) => boolean, error: Error) =>
  (context: T) => {
    if (!condition(context)) {
      throw error;
    }

    return context;
  };
