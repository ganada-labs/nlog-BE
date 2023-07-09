type AsyncValue<T> = T | Promise<T>;

export type Create<T> = (data: T) => AsyncValue<boolean>;

export type Read<T> = (
  query: Partial<T>,
  select?: Partial<T>
) => AsyncValue<null | Partial<T>>;

export type Update<T> = (
  query: Partial<T>,
  data: Partial<T>
) => AsyncValue<boolean>;

export type Remove<T> = (query: Partial<T>) => AsyncValue<boolean>;

export interface CRUDable<T> {
  create: Create<T>;
  read: Read<T>;
  update: Update<T>;
  remove: Remove<T>;
}
