export const isString = (value: unknown): value is string =>
  typeof value === 'string';

export const isNull = (value: unknown): value is null => value === null;
