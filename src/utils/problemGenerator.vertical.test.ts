import { describe, expect, it, vi } from "vitest";
import { generateProblems } from "./problemGenerator";
import type { Problem } from "../types";
import { seededRandom } from "../test/seededRandom";

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
