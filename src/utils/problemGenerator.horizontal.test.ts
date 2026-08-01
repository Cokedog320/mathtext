import { describe, expect, it, vi } from "vitest";
import { generateProblems, getRequestedProblemCount } from "./problemGenerator";
import type { Problem } from "../types";

describe('generateProblems - Horizontal Arithmetic', () => {
  it('should generate 30 problems for the horizontal-add problem type within 20', () => {
    const problems = generateProblems('1-20', 'horizontal-add');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
    expect(arithmeticProblems.length).toBe(30);
    expect(arithmeticProblems.every(p => p.operator === '+')).toBe(true);
  });

  it('should generate 30 problems for the horizontal-sub problem type within 20', () => {
    const problems = generateProblems('1-20', 'horizontal-sub');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
    expect(arithmeticProblems.length).toBe(30);
    expect(arithmeticProblems.every(p => p.operator === '-')).toBe(true);
  });

  it('should generate 30 problems for the horizontal-mixed problem type within 20', () => {
    let hasAdd = false, hasSub = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('1-20', 'horizontal-mixed');
      const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
      expect(arithmeticProblems.length).toBe(30);
      hasAdd = arithmeticProblems.some(p => p.operator === '+');
      hasSub = arithmeticProblems.some(p => p.operator === '-');
      if (hasAdd && hasSub) break;
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });
});


describe('generateProblems - Horizontal Arithmetic Details', () => {
  it.each(([
    '1-20',
    '1-30',
    '1-50',
    '1-100',
  ] as const).flatMap(range => (
    ['horizontal-add', 'horizontal-sub', 'horizontal-mixed'] as const
  ).map(mode => [range, mode] as const)))(
    'excludes unit operations for %s %s worksheets',
    (range, mode) => {
      const problems = generateProblems(range, mode, 'mixed')
        .filter((problem): problem is Extract<Problem, { type: 'arithmetic' }> =>
          problem.type === 'arithmetic'
        );

      expect(problems).toHaveLength(getRequestedProblemCount(range, mode));
      expect(problems.every(problem =>
        problem.operator === '+'
          ? problem.num1 !== 1 && problem.num2 !== 1
          : problem.num2 !== 1
      )).toBe(true);
    }
  );

  it('generates 30 unique complete subtraction expressions within 20', () => {
    const problems = generateProblems('1-20', 'horizontal-sub', 'only');
    const equations = problems.map(problem => {
      if (problem.type !== 'arithmetic') throw new Error('Expected an arithmetic problem');
      return `${problem.num1}-${problem.num2}`;
    });

    expect(problems).toHaveLength(30);
    expect(new Set(equations).size).toBe(30);
  });

  it('treats swapped addition operands as distinct complete expressions', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      const problems = generateProblems('1-20', 'horizontal-add', 'only');
      const equations = problems.map(problem => {
        if (problem.type !== 'arithmetic') throw new Error('Expected an arithmetic problem');
        return `${problem.num1}+${problem.num2}`;
      });

      expect(new Set(equations).size).toBe(equations.length);
      expect(equations).toEqual(expect.arrayContaining(['5+6', '6+5']));
    } finally {
      random.mockRestore();
    }
  });

  it('treats different subtrahends in one fact family as distinct expressions', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      const problems = generateProblems('1-20', 'horizontal-sub', 'only');
      const equations = problems.map(problem => {
        if (problem.type !== 'arithmetic') throw new Error('Expected an arithmetic problem');
        return `${problem.num1}-${problem.num2}`;
      });

      expect(new Set(equations).size).toBe(equations.length);
      expect(equations).toEqual(expect.arrayContaining(['13-5', '13-8']));
    } finally {
      random.mockRestore();
    }
  });

  it('allows addition and subtraction expressions from the same fact family', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      const problems = generateProblems('1-20', 'horizontal-mixed', 'only');
      const equations = problems.map(problem => {
        if (problem.type !== 'arithmetic') throw new Error('Expected an arithmetic problem');
        return `${problem.num1}${problem.operator}${problem.num2}`;
      });

      expect(new Set(equations).size).toBe(equations.length);
      expect(equations).toEqual(expect.arrayContaining(['3+8', '11-3']));
    } finally {
      random.mockRestore();
    }
  });

  it('should generate a mix of carry and no-carry addition problems', () => {
    let hasCarry = false, hasNoCarry = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('1-20', 'horizontal-add');
      const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
      expect(arithmetic.length).toBe(30);
      hasCarry = arithmetic.some(p => (p.num1 % 10) + (p.num2 % 10) > 9);
      hasNoCarry = arithmetic.some(p => (p.num1 % 10) + (p.num2 % 10) <= 9);
      if (hasCarry && hasNoCarry) break;
    }
    expect(hasCarry).toBe(true);
    expect(hasNoCarry).toBe(true);
  });

  it('should generate mixed carry/borrow for the horizontal-mixed problem type', () => {
    let hasCarry = false, hasBorrow = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('1-20', 'horizontal-mixed');
      const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
      expect(arithmetic.length).toBe(30);
      hasCarry = arithmetic.some(p => p.operator === '+' && (p.num1 % 10) + (p.num2 % 10) > 9);
      hasBorrow = arithmetic.some(p => p.operator === '-' && (p.num1 % 10) < (p.num2 % 10));
      if (hasCarry && hasBorrow) break;
    }
    expect(hasCarry).toBe(true);
    expect(hasBorrow).toBe(true);
  });

  it('should respect regroup settings for horizontal problem types', () => {
    const problems = generateProblems('1-20', 'horizontal-add', 'none');
    const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
    expect(arithmetic.every(p => (p.num1 % 10) + (p.num2 % 10) <= 9)).toBe(true);
  });
});

describe('generateProblems - Practice bands and worksheet density', () => {
  const horizontalCountCases = ([
    ['1-10', 20],
    ['1-20', 30],
    ['1-30', 50],
    ['1-50', 60],
    ['1-100', 60],
  ] as const).flatMap(([range, count]) =>
    (['horizontal-add', 'horizontal-sub', 'horizontal-mixed'] as const)
      .flatMap(mode =>
        (['mixed', 'none', 'only'] as const)
          .map(regroup => [range, mode, regroup, count] as const)
      )
  );

  it.each(horizontalCountCases)(
    'generates the horizontal count for %s %s with %s regrouping',
    (range, mode, regroup, count) => {
      expect(generateProblems(range, mode, regroup)).toHaveLength(count);
    }
  );

  it.each([
    ['1-20', 'horizontal-add', 5, false, 30],
    ['1-30', 'horizontal-add', 5, false, 50],
    ['1-50', 'horizontal-add', 5, false, 60],
    ['1-100', 'horizontal-add', 5, false, 60],
    ['1-10', 'horizontal-chain-mixed', 5, false, 20],
    ['1-20', 'horizontal-chain-mixed', 5, false, 30],
    ['1-30', 'horizontal-chain-mixed', 5, false, 50],
    ['1-50', 'horizontal-chain-mixed', 5, false, 60],
    ['1-100', 'horizontal-chain-mixed', 5, false, 60],
    ['1-20', 'number-bonds', 7, false, 6],
    ['1-20', 'number-bonds', 'mixed', false, 12],
    ['1-20', 'number-bonds', 5, true, 12],
  ] as const)(
    'reports the requested count for %s %s with bond target %s and blank=%s',
    (range, mode, bondNumber, isBlankTemplate, count) => {
      expect(getRequestedProblemCount(range, mode, bondNumber, isBlankTemplate)).toBe(count);
    }
  );

  it.each([
    ['1-10', 2, 10],
    ['1-20', 11, 20],
    ['1-30', 21, 30],
    ['1-50', 31, 50],
    ['1-100', 51, 100],
  ] as const)('keeps addition targets in the %s practice band', (range, min, max) => {
    const problems = generateProblems(range, 'horizontal-add');
    expect(problems.every(problem =>
      problem.type === 'arithmetic' &&
      problem.num1 + problem.num2 >= min &&
      problem.num1 + problem.num2 <= max
    )).toBe(true);
  });

  it('keeps subtraction minuends in the selected practice band', () => {
    const problems = generateProblems('1-50', 'horizontal-sub');
    expect(problems.every(problem =>
      problem.type === 'arithmetic' && problem.num1 >= 31 && problem.num1 <= 50
    )).toBe(true);
  });

  it.each([
    'horizontal-add',
    'horizontal-sub',
    'horizontal-mixed',
    'horizontal-chain-add',
    'horizontal-fill-add',
  ] as const)('normalizes %s away from extended ranges at the public seam', (mode) => {
    const problems = generateProblems('1-200', mode);
    const numbers = problems.flatMap(problem => {
      if (problem.type === 'arithmetic') return [problem.num1, problem.num2];
      if (problem.type === 'arithmetic-chain') return problem.operands;
      if (problem.type === 'horizontal-fill') return [problem.num1, problem.num2, problem.result];
      return [];
    });

    expect(problems).toHaveLength(getRequestedProblemCount('1-100', mode));
    expect(numbers.every(number => number <= 100)).toBe(true);
  });
});
