import { isNil } from '.';

export const updateQuery =
  <T>(property: string, value?: T) =>
  (context: { query?: Record<string, T> }) => {
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
