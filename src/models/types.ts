export interface CRUDable<T> {
  create: (data: T) => void;
  read: (query: Partial<T>) => T;
  update: (query: Partial<T>, data: Partial<T>) => void;
  remove: (query: Partial<T>) => void;
}
