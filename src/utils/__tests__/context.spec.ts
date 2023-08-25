import { describe, expect, it } from 'vitest';
import { checkCondition, updateQuery } from '../context';

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

describe('checkCondition', () => {
  it('should check condition', () => {
    const context = { name: 'John Doe' };
    const isNameJohn = (ctx: { name: string }) => ctx.name === 'John Doe';

    const checkName = checkCondition(isNameJohn, new Error());
    const checkName2 = checkCondition(isNameJohn);

    expect(checkName(context)).toStrictEqual(context);
    expect(checkName2(new Error())(context)).toStrictEqual(context);
  });

  it('should throw given error if condition check failed', () => {
    const context = { name: 'John Due' };
    const isNameJohn = (ctx: { name: string }) => ctx.name === 'John Doe';

    const checkName = checkCondition(isNameJohn, new Error());

    expect(() => checkName(context)).toThrowError();
  });
});
