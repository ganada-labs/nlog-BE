export interface CRUDable<T> {
  create: (data: T) => boolean | Promise<boolean>;
  read: (query: Partial<T>) => T | Promise<T>;
  update: (query: Partial<T>, data: Partial<T>) => boolean | Promise<boolean>;
  remove: (query: Partial<T>) => boolean | Promise<boolean>;
}
