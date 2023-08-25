import { describe, expect, it } from 'vitest';
import { updateQuery } from '../context';

describe('updateQuery', () => {
  it('should update query of context', () => {
    const context = { query: { name: 'abc' } };
    const newContext = updateQuery('name', 'def')(context);

    expect(newContext).toStrictEqual({ query: { name: 'def' } });
  });

  it('should add query property if it is not exist in context', () => {
    const context = {};
    const newContext = updateQuery('name', 'abc')(context);

    expect(newContext).toStrictEqual({ query: { name: 'abc' } });
  });
});
