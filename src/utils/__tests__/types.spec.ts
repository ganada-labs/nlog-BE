import { describe, expect, it } from 'vitest';
import { isString, isNull, isUndefined, isNil, isEmail } from '@/utils';

describe('types', () => {
  it('타입가드', () => {
    expect(isString('')).toBe(true);
    expect(isNull(null)).toBe(true);
    expect(isUndefined(undefined)).toBe(true);

    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
  });

  it('이메일 검증', () => {
    expect(isEmail('johndoe@naver.com')).toBe(true);
    expect(isEmail('johndoe@google.com')).toBe(true);
    expect(isEmail('johndoe@some.ac.kr')).toBe(true);
    expect(isEmail('@naver.com')).toBe(false);
    expect(isEmail('johndoenaver.com')).toBe(false);
    expect(isEmail('johndoe@naver')).toBe(false);
  });
});
