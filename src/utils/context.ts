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

export function checkCondition<T extends Record<string, any>>(
  condition: (context: T) => boolean
): (err: Error) => (context: T) => T;
export function checkCondition<T extends Record<string, any>>(
  condition: (context: T) => boolean,
  error: Error
): (context: T) => T;
export function checkCondition<T extends Record<string, any>>(
  condition: (context: T) => boolean,
  error?: Error
) {
  if (error) {
    return (context: T) => {
      if (!condition(context)) {
        throw error;
      }

      return context;
    };
  }

  return (err: Error) => checkCondition(condition, err);
}
