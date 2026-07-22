import { describe, expect, it } from 'vitest';
import { generateHorizontalFillProblems } from './generator/horizontalFill';
import { additionRequiresRegroup, subtractionRequiresRegroup } from './generator/regroup';
import { PRACTICE_BANDS } from './generator/worksheetRules';
import { Range, RegroupOption } from '../types';

describe('Horizontal Fill-in-the-Blank Arithmetic Generator', () => {
  const modes = ['horizontal-fill-add', 'horizontal-fill-sub', 'horizontal-fill-mixed'] as const;

  it('1. generates problems for all three fill modes', () => {
    modes.forEach((mode) => {
      const result = generateHorizontalFillProblems('1-20', mode, 'mixed', 10);
      expect(result.problems.length).toBeGreaterThan(0);
      expect(result.problems[0].type).toBe('horizontal-fill');
    });
  });

  it('2. ensures all operands and results are positive integers >= 1 (no zero anywhere)', () => {
    const ranges: Range[] = ['1-10', '1-20', '1-30', '1-50', '1-100'];
    const regroups: RegroupOption[] = ['mixed', 'none', 'only'];

    ranges.forEach((range) => {
      modes.forEach((mode) => {
        regroups.forEach((regroup) => {
          const { problems } = generateHorizontalFillProblems(range, mode, regroup, 60);
          problems.forEach((p) => {
            expect(p.num1).toBeGreaterThanOrEqual(1);
            expect(p.num2).toBeGreaterThanOrEqual(1);
            expect(p.result).toBeGreaterThanOrEqual(1);

            if (p.operator === '+') {
              expect(p.num1 + p.num2).toBe(p.result);
            } else {
              expect(p.num1 - p.num2).toBe(p.result);
            }
          });
        });
      });
    });
  });

  it('3. ensures addition result stays strictly within practice band', () => {
    const ranges: Range[] = ['1-10', '1-20', '1-30', '1-50', '1-100'];
    ranges.forEach((range) => {
      const [minTarget, maxTarget] = PRACTICE_BANDS[range];
      const { problems } = generateHorizontalFillProblems(range, 'horizontal-fill-add', 'mixed', 60);
      problems.forEach((p) => {
        expect(p.result).toBeGreaterThanOrEqual(minTarget);
        expect(p.result).toBeLessThanOrEqual(maxTarget);
      });
    });
  });

  it('4. ensures subtraction minuend (num1) stays strictly within practice band', () => {
    const ranges: Range[] = ['1-10', '1-20', '1-30', '1-50', '1-100'];
    ranges.forEach((range) => {
      const [minTarget, maxTarget] = PRACTICE_BANDS[range];
      const { problems } = generateHorizontalFillProblems(range, 'horizontal-fill-sub', 'mixed', 60);
      problems.forEach((p) => {
        expect(p.num1).toBeGreaterThanOrEqual(minTarget);
        expect(p.num1).toBeLessThanOrEqual(maxTarget);
      });
    });
  });

  it('5. enforces none mode (no carry / no borrow) for ranges > 1-10', () => {
    const ranges: Range[] = ['1-20', '1-30', '1-50', '1-100'];
    ranges.forEach((range) => {
      const { problems } = generateHorizontalFillProblems(range, 'horizontal-fill-mixed', 'none', 60);
      problems.forEach((p) => {
        if (p.operator === '+') {
          expect(additionRequiresRegroup(p.num1, p.num2)).toBe(false);
        } else {
          expect(subtractionRequiresRegroup(p.num1, p.num2)).toBe(false);
        }
      });
    });
  });

  it('6. enforces only mode (carry / borrow only) for ranges > 1-10', () => {
    const ranges: Range[] = ['1-20', '1-30', '1-50', '1-100'];
    ranges.forEach((range) => {
      const { problems } = generateHorizontalFillProblems(range, 'horizontal-fill-mixed', 'only', 60);
      problems.forEach((p) => {
        if (p.operator === '+') {
          expect(additionRequiresRegroup(p.num1, p.num2)).toBe(true);
        } else {
          expect(subtractionRequiresRegroup(p.num1, p.num2)).toBe(true);
        }
      });
    });
  });

  it('7. ensures blankPosition is strictly 1 or 2', () => {
    const { problems } = generateHorizontalFillProblems('1-20', 'horizontal-fill-mixed', 'mixed', 50);
    problems.forEach((p) => {
      expect([1, 2]).toContain(p.blankPosition);
    });
  });

  it('8. ensures both blankPosition 1 and 2 appear across generated problems', () => {
    const { problems } = generateHorizontalFillProblems('1-20', 'horizontal-fill-add', 'mixed', 30);
    const pos1Count = problems.filter((p) => p.blankPosition === 1).length;
    const pos2Count = problems.filter((p) => p.blankPosition === 2).length;
    expect(pos1Count).toBeGreaterThan(0);
    expect(pos2Count).toBeGreaterThan(0);
  });

  it('9. ensures unique keys (${num1}-${operator}-${num2}-${blankPosition}) without duplicate problems', () => {
    const { problems } = generateHorizontalFillProblems('1-50', 'horizontal-fill-mixed', 'mixed', 60);
    const keys = problems.map((p) => `${p.num1}-${p.operator}-${p.num2}-${p.blankPosition}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(problems.length);
  });

  it('10. balances addition and subtraction in mixed mode as equally as possible', () => {
    const { problems } = generateHorizontalFillProblems('1-30', 'horizontal-fill-mixed', 'mixed', 30);
    const addCount = problems.filter((p) => p.operator === '+').length;
    const subCount = problems.filter((p) => p.operator === '-').length;
    expect(Math.abs(addCount - subCount)).toBeLessThanOrEqual(1);
  });

  it('11. does not use duplicates or fallback when candidate pool is smaller than requested count', () => {
    // 1-10 addition has 44 candidates (9 targets * 2 pos). Requesting 100 should cap at 72 (2..10 target sum = 72)
    const result = generateHorizontalFillProblems('1-10', 'horizontal-fill-add', 'mixed', 100);
    expect(result.problems.length).toBeLessThan(100);
    expect(result.truncated).toBe(true);
    expect(result.availableCount).toBe(result.problems.length);

    const keys = result.problems.map((p) => `${p.num1}-${p.operator}-${p.num2}-${p.blankPosition}`);
    expect(new Set(keys).size).toBe(result.problems.length);
  });

  it('12. correctly returns truncation and availableCount status', () => {
    const resultSufficient = generateHorizontalFillProblems('1-50', 'horizontal-fill-add', 'mixed', 10);
    expect(resultSufficient.truncated).toBe(false);
    expect(resultSufficient.problems.length).toBe(10);

    const resultTruncated = generateHorizontalFillProblems('1-10', 'horizontal-fill-add', 'mixed', 200);
    expect(resultTruncated.truncated).toBe(true);
    expect(resultTruncated.availableCount).toBe(resultTruncated.problems.length);
  });

  it('keeps ordinary +1 and -1 equations available while de-prioritizing only 1 + 1 and 2 - 1', () => {
    const addition = generateHorizontalFillProblems(
      '1-10',
      'horizontal-fill-add',
      'mixed',
      20,
      () => 0,
    ).problems;
    const subtraction = generateHorizontalFillProblems(
      '1-10',
      'horizontal-fill-sub',
      'mixed',
      20,
      () => 0,
    ).problems;

    expect(addition.filter(problem => problem.num1 === 1 || problem.num2 === 1)).toHaveLength(14);
    expect(subtraction.filter(problem => problem.num2 === 1).length).toBeGreaterThan(1);
  });

  it('replaces 1 + 1 and 2 - 1 when the low-priority draw rejects them', () => {
    const rejectLowPriority = () => {
      let calls = 0;
      return () => ++calls <= 71 ? 0 : 0.99;
    };
    const addition = generateHorizontalFillProblems(
      '1-10',
      'horizontal-fill-add',
      'mixed',
      20,
      rejectLowPriority(),
    ).problems;
    const subtraction = generateHorizontalFillProblems(
      '1-10',
      'horizontal-fill-sub',
      'mixed',
      20,
      rejectLowPriority(),
    ).problems;

    expect(addition.some(problem => problem.num1 === 1 && problem.num2 === 1)).toBe(false);
    expect(subtraction.some(problem => problem.num1 === 2 && problem.num2 === 1)).toBe(false);
  });
});
