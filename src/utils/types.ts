type Email = `${string}@${string}`;

export type Nil = null | undefined;

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

export const isNull = (value: unknown): value is null => value === null;

export const isUndefined = (value: unknown): value is undefined =>
  value === undefined;

export const isNil = (value: unknown): value is Nil =>
  isNull(value) || isUndefined(value);

export const isEmail = (value: unknown): value is Email => {
  if (!isString(value)) return false;

  const EMAIL_REG =
    /^[0-9a-zA-Z]+@[0-9a-zA-Z]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
  return EMAIL_REG.test(value);
};
