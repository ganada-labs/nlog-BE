import { expect, it } from 'vitest';

const sum = (...nums: number[]) => nums.reduce((acc, val) => acc + val, 0);

it('should sum values', () => {
  expect(sum(1, 2, 3)).toBe(6);
});
