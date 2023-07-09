export interface CRUDable<T> {
  create: (data: T) => boolean | Promise<boolean>;
  read: (
    query: Partial<T>,
    select?: Partial<T>
  ) => null | Partial<T> | Promise<Partial<T> | null>;
  update: (query: Partial<T>, data: Partial<T>) => boolean | Promise<boolean>;
  remove: (query: Partial<T>) => boolean | Promise<boolean>;
}
