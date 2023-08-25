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
