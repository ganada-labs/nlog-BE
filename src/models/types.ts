import { type FilterQuery, type UpdateQuery } from '@/repos/mongodb';

type AsyncValue<T> = T | Promise<T>;

export type Create<T> = (data: T) => AsyncValue<boolean>;

export type Read<T> = (
  query: FilterQuery<T>,
  select?: Partial<T>
) => AsyncValue<null | Partial<T>>;

export type ReadAll<T> = (
  query: FilterQuery<T>,
  select?: Partial<T>
) => AsyncValue<Partial<T>[]>;

export type Update<T> = (
  query: FilterQuery<T>,
  data: UpdateQuery<T>
) => AsyncValue<boolean>;

export type Remove<T> = (query: FilterQuery<T>) => AsyncValue<boolean>;

export interface CRUDable<T> {
  create: Create<T>;
  read: Read<T>;
  readAll?: ReadAll<T>;
  update: Update<T>;
  remove: Remove<T>;
}
