import { describe, expect, it } from 'vitest';
import { isString, isNull } from '@/utils';

describe('types', () => {
  it('타입가드', () => {
    expect(isString('')).toBe(true);
    expect(isNull(null)).toBe(true);
  });
});
