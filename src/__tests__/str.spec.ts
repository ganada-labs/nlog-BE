import { expect, it } from 'vitest';

const merge = (...strs: string[]) => strs.reduce((acc, val) => acc + val, '');

it('should merge string', () => {
  expect(merge('a', 'b', 'c', 'd', 'e')).toBe('abcde');
});

it('should merge string', () => {
  expect(merge('ab', 'bc')).toBe('abbc');
});

it('should merge string', () => {
  expect(merge('ab', 'bc', 'de')).toBe('abbcde');
});
