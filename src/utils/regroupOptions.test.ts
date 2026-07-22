import { describe, expect, it } from 'vitest';

import { DEFAULT_REGROUP_OPTION, normalizeRegroupOption } from './regroupOptions';

describe('regrouping configuration', () => {
  it('defaults to without regrouping', () => {
    expect(DEFAULT_REGROUP_OPTION).toBe('none');
  });

  it('preserves a selection whenever it remains available', () => {
    expect(normalizeRegroupOption('1-30', 'vertical-add', 'only', 'one')).toBe('only');
    expect(normalizeRegroupOption('1-20', 'vertical-sub', 'only', 'mixed')).toBe('only');
    expect(normalizeRegroupOption('1-20', 'vertical-mixed', 'only', 'mixed')).toBe('only');
    expect(normalizeRegroupOption('1-20', 'horizontal-add', 'only', 'mixed')).toBe('only');
  });

  it('falls back to mixed when vertical addition within 20 makes With Regrouping unavailable', () => {
    expect(normalizeRegroupOption('1-20', 'vertical-add', 'only', 'mixed')).toBe('mixed');
  });

  it('also falls back to mixed for mixed or two-digit lower operands within 30', () => {
    expect(normalizeRegroupOption('1-30', 'vertical-add', 'only', 'mixed')).toBe('mixed');
    expect(normalizeRegroupOption('1-30', 'vertical-add', 'only', 'two')).toBe('mixed');
    expect(normalizeRegroupOption('1-30', 'vertical-add', 'only', 'one')).toBe('only');
    expect(normalizeRegroupOption('1-50', 'vertical-add', 'only', 'two')).toBe('only');
  });
});
