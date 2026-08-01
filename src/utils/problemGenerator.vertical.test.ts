import { describe, expect, it, vi } from "vitest";
import { generateProblems, getPrintTitle, requiresRegroup } from "./problemGenerator";
import type { Problem } from "../types";
import { seededRandom } from "../test/seededRandom";
import { PRACTICE_BANDS } from "./generator/worksheetRules";

describe('generateProblems - Vertical Arithmetic', () => {
  it('should generate a mix of carry and no-carry addition problems', () => {
    let hasCarry = false, hasNoCarry = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('1-20', 'vertical-add');
      const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
      expect(arithmeticProblems.length).toBe(20);
      hasCarry = arithmeticProblems.some(p => (p.num1 % 10) + (p.num2 % 10) > 9);
      hasNoCarry = arithmeticProblems.some(p => (p.num1 % 10) + (p.num2 % 10) <= 9);
      if (hasCarry && hasNoCarry) break;
    }
    expect(hasCarry).toBe(true);
    expect(hasNoCarry).toBe(true);
  });

  it('should generate a mix of borrow and no-borrow subtraction problems', () => {
    let hasBorrow = false, hasNoBorrow = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('1-20', 'vertical-sub');
      const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '-');
      expect(arithmeticProblems.length).toBe(20);
      hasBorrow = arithmeticProblems.some(p => (p.num1 % 10) < (p.num2 % 10));
      hasNoBorrow = arithmeticProblems.some(p => (p.num1 % 10) >= (p.num2 % 10));
      if (hasBorrow && hasNoBorrow) break;
    }
    expect(hasBorrow).toBe(true);
    expect(hasNoBorrow).toBe(true);
  });

  it('should generate mixed carry/borrow for the vertical-mixed problem type', () => {
    let hasCarry = false, hasBorrow = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('1-20', 'vertical-mixed');
      const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
      expect(arithmeticProblems.length).toBe(20);
      hasCarry = arithmeticProblems.some(p => p.operator === '+' && (p.num1 % 10) + (p.num2 % 10) > 9);
      hasBorrow = arithmeticProblems.some(p => p.operator === '-' && (p.num1 % 10) < (p.num2 % 10));
      if (hasCarry && hasBorrow) break;
    }
    expect(hasCarry).toBe(true);
    expect(hasBorrow).toBe(true);
  });

  it('returns every unique carry addition when fewer than 20 equations are possible', () => {
    const problems = generateProblems('1-20', 'vertical-add', 'only');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');

    expect(arithmeticProblems).toHaveLength(9);
    expect(new Set(arithmeticProblems.map(p => `${p.num1}+${p.num2}`)).size).toBe(9);

    const allHaveCarry = arithmeticProblems.every(p => (p.num1 % 10) + (p.num2 % 10) > 9);
    expect(allHaveCarry).toBe(true);
  });

  it('uses the available 9 carry and 11 no-carry additions in a mixed worksheet within 20', () => {
    const problems = generateProblems('1-20', 'vertical-add', 'mixed')
      .filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');

    expect(problems).toHaveLength(20);
    expect(problems.filter(p => (p.num1 % 10) + (p.num2 % 10) >= 10)).toHaveLength(9);
    expect(problems.filter(p => (p.num1 % 10) + (p.num2 % 10) < 10)).toHaveLength(11);
    expect(new Set(problems.map(p => `${p.num1}+${p.num2}`)).size).toBe(20);
  });

  it('should generate ONLY no-carry addition problems when regroup is none', () => {
    const problems = generateProblems('1-20', 'vertical-add', 'none');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');

    expect(arithmeticProblems.length).toBe(20);

    const allHaveNoCarry = arithmeticProblems.every(p => (p.num1 % 10) + (p.num2 % 10) <= 9);
    expect(allHaveNoCarry).toBe(true);
  });

  it('should generate ONLY borrow subtraction problems when regroup is only', () => {
    const problems = generateProblems('1-20', 'vertical-sub', 'only');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '-');

    expect(arithmeticProblems.length).toBe(20);

    const allHaveBorrow = arithmeticProblems.every(p => (p.num1 % 10) < (p.num2 % 10));
    expect(allHaveBorrow).toBe(true);
  });

  it('uses all 20 unique regrouping equations for mixed vertical arithmetic within 20', () => {
    const problems = generateProblems('1-20', 'vertical-mixed', 'only')
      .filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');

    expect(problems).toHaveLength(20);
    expect(new Set(problems.map(p => `${p.num1}${p.operator}${p.num2}`)).size).toBe(20);
    expect(problems.filter(p => p.operator === '+')).toHaveLength(9);
    expect(problems.filter(p => p.operator === '-')).toHaveLength(11);
    expect(problems.every(p => p.operator === '+'
      ? (p.num1 % 10) + (p.num2 % 10) >= 10
      : (p.num1 % 10) < (p.num2 % 10))).toBe(true);
  });

  it('should generate ONLY no-borrow subtraction problems when regroup is none', () => {
    const problems = generateProblems('1-20', 'vertical-sub', 'none');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '-');

    expect(arithmeticProblems.length).toBe(20);

    const allHaveNoBorrow = arithmeticProblems.every(p => (p.num1 % 10) >= (p.num2 % 10));
    expect(allHaveNoBorrow).toBe(true);
  });
});


describe('generateProblems - Vertical operand shape', () => {
  const verticalProblems = (lowerDigits: 'one' | 'two' | 'mixed') =>
    generateProblems('1-100', 'vertical-mixed', 'mixed', 'mixed', 'practice', 5, false, lowerDigits)
      .filter((problem): problem is Extract<Problem, { type: 'arithmetic' }> => problem.type === 'arithmetic');

  it('does not repeat equations across vertical worksheet configurations', () => {
    const ranges = ['1-20', '1-30', '1-50', '1-100'] as const;
    const modes = ['vertical-add', 'vertical-sub', 'vertical-mixed'] as const;
    const regroupOptions = ['mixed', 'none', 'only'] as const;
    const lowerDigitOptions = ['mixed', 'one', 'two'] as const;

    for (const range of ranges) {
      for (const mode of modes) {
        for (const regroup of regroupOptions) {
          for (const lowerDigits of lowerDigitOptions) {
            const problems = generateProblems(range, mode, regroup, 'mixed', 'practice', 5, false, lowerDigits);
            const equations = problems.map(problem => {
              if (problem.type !== 'arithmetic') throw new Error('Expected an arithmetic problem');
              return `${problem.num1}${problem.operator}${problem.num2}`;
            });

            expect(
              new Set(equations).size,
              `${range} ${mode} ${regroup} ${lowerDigits}`
            ).toBe(equations.length);
          }
        }
      }
    }
  });

  it('uses 20 problems and always places a two-digit number on top', () => {
    const problems = verticalProblems('mixed');
    expect(problems).toHaveLength(20);
    expect(problems.every(problem => problem.num1 >= 10 && problem.num1 <= 99)).toBe(true);
  });

  it('supports one-digit and two-digit lower operands', () => {
    expect(verticalProblems('one').every(problem => problem.num2 >= 1 && problem.num2 <= 9)).toBe(true);
    expect(verticalProblems('two').every(problem => problem.num2 >= 10 && problem.num2 <= 99)).toBe(true);
  });

  it('does not silently replace an impossible two-digit lower operand with a one-digit operand', () => {
    const problems = generateProblems('1-20', 'vertical-add', 'only', 'mixed', 'practice', 5, false, 'two');
    expect(problems).toHaveLength(0);
  });

  it('balances mixed lower-operand widths and operators', () => {
    const problems = verticalProblems('mixed');
    expect(problems.filter(problem => problem.num2 < 10)).toHaveLength(10);
    expect(problems.filter(problem => problem.num2 >= 10)).toHaveLength(10);
    expect(problems.filter(problem => problem.operator === '+')).toHaveLength(10);
    expect(problems.filter(problem => problem.operator === '-')).toHaveLength(10);
  });

  it('does not concentrate mixed-width borrowing problems within 20 on minuend 20', () => {
    const random = vi.spyOn(Math, 'random');

    try {
      for (const seed of [0, 1, 2, 3, 4]) {
        random.mockImplementation(seededRandom(seed));
        const problems = generateProblems(
          '1-20',
          'vertical-sub',
          'only',
          'mixed',
          'practice',
          5,
          false,
          'mixed'
        ).filter((problem): problem is Extract<Problem, { type: 'arithmetic' }> =>
          problem.type === 'arithmetic'
        );
        const minuendCounts = new Map<number, number>();
        for (const problem of problems) {
          minuendCounts.set(problem.num1, (minuendCounts.get(problem.num1) ?? 0) + 1);
        }
        const twoDigitLowerOperands = problems.filter(problem => problem.num2 >= 10);

        expect(problems).toHaveLength(20);
        expect(Math.max(...minuendCounts.values())).toBeLessThanOrEqual(3);
        expect(twoDigitLowerOperands.length).toBeGreaterThan(0);
        expect(twoDigitLowerOperands.length).toBeLessThanOrEqual(3);
      }
    } finally {
      random.mockRestore();
    }
  });
});

describe('generateProblems - Extended vertical ranges', () => {
  const ranges = ['1-200', '1-500'] as const;
  const modes = ['vertical-add', 'vertical-sub', 'vertical-mixed'] as const;
  const minTargetFor = (range: (typeof ranges)[number]) => PRACTICE_BANDS[range][0];
  const maxTargetFor = (range: (typeof ranges)[number]) => PRACTICE_BANDS[range][1];
  const asArithmeticProblems = (
    range: (typeof ranges)[number],
    mode: (typeof modes)[number],
    regroup: 'mixed' | 'none' | 'only' = 'mixed',
  ) => generateProblems(range, mode, regroup)
      .filter((problem): problem is Extract<Problem, { type: 'arithmetic' }> => problem.type === 'arithmetic');
  const targetFor = (problem: Extract<Problem, { type: 'arithmetic' }>) =>
    problem.operator === '+' ? problem.num1 + problem.num2 : problem.num1;
  const withSeed = <T,>(seed: number, callback: () => T): T => {
    const random = vi.spyOn(Math, 'random').mockImplementation(seededRandom(seed));
    try {
      return callback();
    } finally {
      random.mockRestore();
    }
  };

  it.each(ranges.flatMap(range => modes.map(mode => [range, mode] as const)))
    ('keeps every %s %s worksheet within the new vertical rules', (range, mode) => {
      for (const seed of [1, 2, 3, 4, 5]) {
        const problems = withSeed(seed, () => asArithmeticProblems(range, mode));
        const targets = problems.map(targetFor);
        const equations = problems.map(problem => `${problem.num1}${problem.operator}${problem.num2}`);

        expect(problems, `${range} ${mode} seed ${seed}`).toHaveLength(20);
        expect(new Set(targets).size).toBe(20);
        expect(new Set(equations).size).toBe(20);
        expect(problems.every(problem => problem.num1 > 0 && problem.num2 > 0)).toBe(true);
        expect(problems.every(problem => targetFor(problem) >= minTargetFor(range) && targetFor(problem) <= maxTargetFor(range))).toBe(true);
        expect(problems.filter(problem => problem.num2 < 10)).toHaveLength(2);
        expect(problems.filter(problem => problem.num2 >= 10)).toHaveLength(18);
        expect(problems.filter(problem => problem.num2 >= 1 && problem.num2 <= 5).length).toBeLessThanOrEqual(1);
      }
    });

  it.each(ranges)('samples %s target values without a high-end bias', (range) => {
    const targets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap(seed =>
      withSeed(seed, () => asArithmeticProblems(range, 'vertical-mixed').map(targetFor))
    );
    const average = targets.reduce((sum, target) => sum + target, 0) / targets.length;
    const midpoint = (minTargetFor(range) + maxTargetFor(range)) / 2;
    const tolerance = maxTargetFor(range) * 0.2;

    expect(average).toBeGreaterThan(midpoint - tolerance);
    expect(average).toBeLessThan(midpoint + tolerance);
  });

  it.each(ranges.flatMap(range => modes.flatMap(mode =>
    (['none', 'only'] as const).map(regroup => [range, mode, regroup] as const)
  )))('generates 20 %s %s problems for %s regrouping', (range, mode, regroup) => {
    for (const seed of [1, 2, 3]) {
      const problems = withSeed(seed, () => asArithmeticProblems(range, mode, regroup));

      expect(problems, `${range} ${mode} ${regroup} seed ${seed}`).toHaveLength(20);
      expect(problems.filter(problem => problem.num2 < 10)).toHaveLength(2);
      expect(problems.filter(problem => problem.num2 >= 10)).toHaveLength(18);
      expect(problems.every(problem => requiresRegroup(problem.num1, problem.operator, problem.num2) === (regroup === 'only'))).toBe(true);
    }
  });

  it('checks regrouping across the hundreds place', () => {
    expect(requiresRegroup(198, '+', 27)).toBe(true);
    expect(requiresRegroup(198, '+', 1)).toBe(false);
    expect(requiresRegroup(402, '-', 187)).toBe(true);
    expect(requiresRegroup(432, '-', 210)).toBe(false);
  });

  it('uses the extended range in vertical print titles', () => {
    const translations = { printTitles: {} };

    expect(getPrintTitle('vertical-add', '1-200', 'none', 'zh', translations)).toBe('200以内不进位加法');
    expect(getPrintTitle('vertical-sub', '1-500', 'only', 'en', translations)).toBe('Borrowing Subtraction Within 500');
    expect(getPrintTitle('horizontal-add', '1-200', 'mixed', 'en', translations)).toBe('Addition Within 100');
  });
});
