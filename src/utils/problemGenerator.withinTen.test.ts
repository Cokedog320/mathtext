import { describe, expect, it, vi } from "vitest";
import { generateProblems } from "./problemGenerator";
import type { Problem } from "../types";

type GeneratedChainProblem = Extract<Problem, { type: "arithmetic-chain" }>;

describe('generateProblems - 1-10 Range', () => {
  it('should only generate addition problems with sums up to 10', () => {
    const problems = generateProblems('1-10', 'horizontal-add', 'mixed');
    expect(problems.length).toBe(20);
    expect(problems.every(p => {
      if (p.type !== 'arithmetic') return false;
      return p.num1 + p.num2 <= 10;
    })).toBe(true);
  });

  it('should only generate subtraction problems with minuend up to 10', () => {
    const problems = generateProblems('1-10', 'horizontal-sub', 'mixed');
    expect(problems.length).toBe(20);
    expect(problems.every(p => {
      if (p.type !== 'arithmetic') return false;
      return p.num1 <= 10;
    })).toBe(true);
  });

  it('limits add-one facts to at most one distinct horizontal addition problem', () => {
    const problems = generateProblems('1-10', 'horizontal-add', 'mixed')
      .filter((problem): problem is Extract<Problem, { type: 'arithmetic' }> =>
        problem.type === 'arithmetic'
      );
    const equations = problems.map(problem => `${problem.num1}+${problem.num2}`);
    const addOneProblems = problems.filter(problem =>
      problem.num1 === 1 || problem.num2 === 1
    );

    expect(problems).toHaveLength(20);
    expect(new Set(equations).size).toBe(20);
    expect(addOneProblems.length).toBeLessThanOrEqual(1);
  });

  it('limits subtract-one facts to at most one distinct horizontal subtraction problem', () => {
    const problems = generateProblems('1-10', 'horizontal-sub', 'mixed')
      .filter((problem): problem is Extract<Problem, { type: 'arithmetic' }> =>
        problem.type === 'arithmetic'
      );
    const equations = problems.map(problem => `${problem.num1}-${problem.num2}`);
    const subtractOneProblems = problems.filter(problem => problem.num2 === 1);

    expect(problems).toHaveLength(20);
    expect(new Set(equations).size).toBe(20);
    expect(subtractOneProblems.length).toBeLessThanOrEqual(1);
  });

  it('does not force the smallest add-one and subtract-one facts into every worksheet', () => {
    const random = vi.spyOn(Math, 'random');
    const includesRareFacts = () => {
      const additions = generateProblems('1-10', 'horizontal-add')
        .filter((problem): problem is Extract<Problem, { type: 'arithmetic' }> =>
          problem.type === 'arithmetic'
        );
      const subtractions = generateProblems('1-10', 'horizontal-sub')
        .filter((problem): problem is Extract<Problem, { type: 'arithmetic' }> =>
          problem.type === 'arithmetic'
        );

      return {
        onePlusOne: additions.some(problem => problem.num1 === 1 && problem.num2 === 1),
        onePlusTwo: additions.some(problem =>
          (problem.num1 === 1 && problem.num2 === 2) ||
          (problem.num1 === 2 && problem.num2 === 1)
        ),
        twoMinusOne: subtractions.some(problem => problem.num1 === 2 && problem.num2 === 1),
      };
    };

    try {
      random.mockReturnValue(0);
      expect(includesRareFacts()).toEqual({
        onePlusOne: true,
        onePlusTwo: false,
        twoMinusOne: true,
      });

      random.mockReturnValue(0.99);
      expect(includesRareFacts()).toEqual({
        onePlusOne: false,
        onePlusTwo: false,
        twoMinusOne: false,
      });
    } finally {
      random.mockRestore();
    }
  });

  it('limits one-valued later addends to at most one chained addition problem', () => {
    const problems = generateProblems(
      '1-10',
      'horizontal-chain-add',
      'mixed'
    ) as GeneratedChainProblem[];
    const addOneProblems = problems.filter(problem =>
      problem.operands[1] === 1 || problem.operands[2] === 1
    );

    expect(problems).toHaveLength(20);
    expect(addOneProblems.length).toBeLessThanOrEqual(1);
  });

  it('limits one-valued subtrahends to at most one chained subtraction problem', () => {
    const problems = generateProblems(
      '1-10',
      'horizontal-chain-sub',
      'mixed'
    ) as GeneratedChainProblem[];
    const subtractOneProblems = problems.filter(problem =>
      problem.operands[1] === 1 || problem.operands[2] === 1
    );

    expect(problems).toHaveLength(20);
    expect(subtractOneProblems.length).toBeLessThanOrEqual(1);
  });

  it.each(['none', 'only', 'mixed'] as const)(
    'ignores the %s regroup setting for addition and limits sums of 10',
    regroup => {
      const problems = generateProblems('1-10', 'horizontal-add', regroup)
        .filter((problem): problem is Extract<Problem, { type: 'arithmetic' }> =>
          problem.type === 'arithmetic'
        );
      const sums = problems.map(problem => problem.num1 + problem.num2);

      expect(problems).toHaveLength(20);
      expect(sums.every(sum => sum <= 10)).toBe(true);
      expect(sums.some(sum => sum === 10)).toBe(true);
      expect(sums.some(sum => sum < 10)).toBe(true);
      expect(sums.filter(sum => sum === 10).length).toBeLessThanOrEqual(3);
    }
  );

  it.each(['none', 'only', 'mixed'] as const)(
    'ignores the %s regroup setting for chained addition and limits results of 10',
    regroup => {
      const problems = generateProblems(
        '1-10',
        'horizontal-chain-add',
        regroup
      ) as GeneratedChainProblem[];
      const results = problems.map(problem =>
        problem.operands[0] + problem.operands[1] + problem.operands[2]
      );

      expect(problems).toHaveLength(20);
      expect(results.every(result => result <= 10)).toBe(true);
      expect(results.some(result => result === 10)).toBe(true);
      expect(results.some(result => result < 10)).toBe(true);
      expect(results.filter(result => result === 10).length).toBeLessThanOrEqual(3);
    }
  );

  it.each(([
    'horizontal-sub',
    'horizontal-mixed',
  ] as const).flatMap(mode => (['none', 'only', 'mixed'] as const)
    .map(regroup => [mode, regroup] as const)))(
    'ignores regrouping for %s with %s and limits boundary targets of 10',
    (mode, regroup) => {
      const problems = generateProblems('1-10', mode, regroup)
        .filter((problem): problem is Extract<Problem, { type: 'arithmetic' }> =>
          problem.type === 'arithmetic'
        );
      const targets = problems.map(problem =>
        problem.operator === '+' ? problem.num1 + problem.num2 : problem.num1
      );

      expect(problems).toHaveLength(20);
      expect(problems.every(problem =>
        problem.operator === '+'
          ? problem.num1 + problem.num2 <= 10
          : problem.num1 <= 10 && problem.num1 - problem.num2 > 0
      )).toBe(true);
      expect(targets.some(target => target === 10)).toBe(true);
      expect(targets.some(target => target < 10)).toBe(true);
      expect(targets.filter(target => target === 10).length).toBeLessThanOrEqual(3);
      if (mode === 'horizontal-mixed') {
        expect(problems.filter(problem => problem.operator === '+')).toHaveLength(10);
        expect(problems.filter(problem => problem.operator === '-')).toHaveLength(10);
      }
    }
  );

  it.each(([
    'horizontal-chain-sub',
    'horizontal-chain-mixed',
  ] as const).flatMap(mode => (['none', 'only', 'mixed'] as const)
    .map(regroup => [mode, regroup] as const)))(
    'ignores regrouping for %s with %s while keeping values within 10',
    (mode, regroup) => {
      const problems = generateProblems('1-10', mode, regroup) as GeneratedChainProblem[];
      const boundaryValues: number[] = [];

      expect(problems).toHaveLength(20);
      expect(problems.every(problem => {
        const [first, second, third] = problem.operands;
        const intermediate = problem.operators[0] === '+' ? first + second : first - second;
        const result = problem.operators[1] === '+' ? intermediate + third : intermediate - third;
        boundaryValues.push(mode === 'horizontal-chain-sub' ? first : result);
        return intermediate > 0 && intermediate <= 10 && result > 0 && result <= 10;
      })).toBe(true);
      expect(boundaryValues.some(value => value === 10)).toBe(true);
      expect(boundaryValues.some(value => value < 10)).toBe(true);
      expect(boundaryValues.filter(value => value === 10).length).toBeLessThanOrEqual(3);
      if (mode === 'horizontal-chain-mixed') {
        expect(problems.filter(problem => problem.operators.join('') === '+-')).toHaveLength(10);
        expect(problems.filter(problem => problem.operators.join('') === '-+')).toHaveLength(10);
      }
    }
  );
});
