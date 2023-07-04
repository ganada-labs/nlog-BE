import { expect, it } from 'vitest';

const sum = (...nums: number[]) => nums.reduce((acc, val) => acc + val);

it('should sum values', () => {
  expect(sum(1, 2, 3)).toBe(6);
});
