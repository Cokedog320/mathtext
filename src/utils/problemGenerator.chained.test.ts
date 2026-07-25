import { describe, expect, it, vi } from "vitest";
import { generateProblems, requiresRegroup } from "./problemGenerator";
import type { Problem, Range } from "../types";
import { seededRandom } from "../test/seededRandom";

type GeneratedChainProblem = Extract<Problem, { type: "arithmetic-chain" }>;
const chainProblemCounts: Record<Range, number> = {
  '1-10': 20,
  '1-20': 30,
  '1-30': 50,
  '1-50': 60,
  '1-100': 60,
};
const chainLaterOperandCaps: Record<Range, number> = {
  '1-10': 9,
  '1-20': 6,
  '1-30': 6,
  '1-50': 4,
  '1-100': 4,
};

describe('generateProblems - Chained Arithmetic', () => {
  it.each((Object.keys(chainProblemCounts) as Range[]).flatMap(range => ([
    'horizontal-chain-add',
    'horizontal-chain-sub',
    'horizontal-chain-mixed',
  ] as const).map(mode => [range, mode] as const))) (
    'uses the shared horizontal count for %s %s',
    (range, mode) => {
      const problems = generateProblems(range, mode) as GeneratedChainProblem[];
      expect(problems).toHaveLength(chainProblemCounts[range]);
    }
  );

  const stepRegroups = (left: number, operator: '+' | '-', right: number) => {
    let remainingLeft = left;
    let remainingRight = right;
    while (remainingLeft > 0 || remainingRight > 0) {
      const regroups = operator === '+'
        ? (remainingLeft % 10) + (remainingRight % 10) >= 10
        : (remainingLeft % 10) < (remainingRight % 10);
      if (regroups) return true;
      remainingLeft = Math.floor(remainingLeft / 10);
      remainingRight = Math.floor(remainingRight / 10);
    }
    return false;
  };

  const regroupSteps = (problem: GeneratedChainProblem) => {
    const [first, second, third] = problem.operands;
    const [firstOperator, secondOperator] = problem.operators;
    const intermediate = firstOperator === '+' ? first + second : first - second;
    return [
      stepRegroups(first, firstOperator, second),
      stepRegroups(intermediate, secondOperator, third),
    ];
  };

  it('detects carrying into and borrowing from the hundreds place', () => {
    expect(requiresRegroup(90, '+', 10)).toBe(true);
    expect(requiresRegroup(80, '+', 10)).toBe(false);
    expect(requiresRegroup(100, '-', 10)).toBe(true);
    expect(requiresRegroup(90, '-', 10)).toBe(false);
  });

  it('generates 20 unique two-step addition problems in the selected practice band', () => {
    const problems = generateProblems('1-20', 'horizontal-chain-add') as GeneratedChainProblem[];
    const equations = problems.map(problem =>
      `${problem.operands[0]}${problem.operators[0]}${problem.operands[1]}${problem.operators[1]}${problem.operands[2]}`
    );

    expect(problems).toHaveLength(chainProblemCounts['1-20']);
    expect(problems.every(problem => problem.type === 'arithmetic-chain')).toBe(true);
    expect(problems.every(problem => problem.operators[0] === '+' && problem.operators[1] === '+')).toBe(true);
    expect(problems.every(problem => {
      const total = problem.operands[0] + problem.operands[1] + problem.operands[2];
      return total >= 11 && total <= 20;
    })).toBe(true);
    expect(new Set(equations).size).toBe(equations.length);
  });

  it('generates 20 unique two-step subtraction problems with positive process values', () => {
    const problems = generateProblems('1-20', 'horizontal-chain-sub') as GeneratedChainProblem[];
    const equations = problems.map(problem =>
      `${problem.operands[0]}${problem.operators[0]}${problem.operands[1]}${problem.operators[1]}${problem.operands[2]}`
    );

    expect(problems).toHaveLength(chainProblemCounts['1-20']);
    expect(problems.every(problem => problem.operators[0] === '-' && problem.operators[1] === '-')).toBe(true);
    expect(problems.every(problem => problem.operands[0] >= 11 && problem.operands[0] <= 20)).toBe(true);
    expect(problems.every(problem => {
      const intermediate = problem.operands[0] - problem.operands[1];
      return intermediate > 0 && intermediate - problem.operands[2] > 0;
    })).toBe(true);
    expect(new Set(equations).size).toBe(equations.length);
  });

  it('balances two-step mixed arithmetic while keeping every process value in range', () => {
    const problems = generateProblems('1-20', 'horizontal-chain-mixed') as GeneratedChainProblem[];
    const equations = problems.map(problem =>
      `${problem.operands[0]}${problem.operators[0]}${problem.operands[1]}${problem.operators[1]}${problem.operands[2]}`
    );

    expect(problems).toHaveLength(chainProblemCounts['1-20']);
    expect(problems.filter(problem => problem.operators.join('') === '+-')).toHaveLength(chainProblemCounts['1-20'] / 2);
    expect(problems.filter(problem => problem.operators.join('') === '-+')).toHaveLength(chainProblemCounts['1-20'] / 2);
    expect(problems.every(problem => {
      const [first, second, third] = problem.operands;
      const intermediate = problem.operators[0] === '+' ? first + second : first - second;
      const result = problem.operators[1] === '+' ? intermediate + third : intermediate - third;
      return intermediate > 0 && intermediate <= 20 && result > 0 && result <= 20;
    })).toBe(true);
    expect(new Set(equations).size).toBe(equations.length);
  });

  it.each([
    'horizontal-chain-add',
    'horizontal-chain-sub',
    'horizontal-chain-mixed',
  ] as const)('respects regroup settings for %s', mode => {
    const withoutRegroup = generateProblems('1-20', mode, 'none') as Extract<Problem, { type: 'arithmetic-chain' }>[];
    const withRegroup = generateProblems('1-20', mode, 'only') as Extract<Problem, { type: 'arithmetic-chain' }>[];

    expect(withoutRegroup).toHaveLength(chainProblemCounts['1-20']);
    expect(withoutRegroup.every(problem => regroupSteps(problem).every(value => !value))).toBe(true);
    expect(withRegroup).toHaveLength(chainProblemCounts['1-20']);
    expect(withRegroup.every(problem => regroupSteps(problem).some(Boolean))).toBe(true);
  });

  it.each([
    'horizontal-chain-add',
    'horizontal-chain-sub',
    'horizontal-chain-mixed',
  ] as const)('respects all-place regroup settings within 100 for %s', mode => {
    const withoutRegroup = generateProblems('1-100', mode, 'none') as GeneratedChainProblem[];
    const withRegroup = generateProblems('1-100', mode, 'only') as GeneratedChainProblem[];

    expect(withoutRegroup).toHaveLength(chainProblemCounts['1-100']);
    expect(withoutRegroup.every(problem => regroupSteps(problem).every(value => !value))).toBe(true);
    expect(withRegroup).toHaveLength(chainProblemCounts['1-100']);
    expect(withRegroup.every(problem => regroupSteps(problem).some(Boolean))).toBe(true);
  });

  it.each(([
    '1-20',
    '1-50',
    '1-100',
  ] as const).flatMap(range => ([
    'horizontal-chain-add',
    'horizontal-chain-sub',
    'horizontal-chain-mixed',
  ] as const).map(mode => [range, mode] as const)))(
    'balances regrouping and non-regrouping problems for %s %s',
    (range, mode) => {
      const problems = generateProblems(range, mode) as GeneratedChainProblem[];
      expect(problems.filter(problem => regroupSteps(problem).some(Boolean))).toHaveLength(chainProblemCounts[range] / 2);
    }
  );

  it.each(([
    '1-10',
    '1-100',
  ] as const).flatMap(range => ([
    'horizontal-chain-add',
    'horizontal-chain-sub',
    'horizontal-chain-mixed',
  ] as const).map(mode => [range, mode] as const)))(
    'avoids concentrated starts and answers for %s %s',
    (range, mode) => {
      const problems = generateProblems(range, mode) as GeneratedChainProblem[];
      const starts = new Map<number, number>();
      const results = new Map<number, number>();
      const regroupKinds = new Set<boolean>();

      for (const problem of problems) {
        const [first, second, third] = problem.operands;
        const intermediate = problem.operators[0] === '+' ? first + second : first - second;
        const result = problem.operators[1] === '+' ? intermediate + third : intermediate - third;
        starts.set(first, (starts.get(first) ?? 0) + 1);
        results.set(result, (results.get(result) ?? 0) + 1);
        regroupKinds.add(regroupSteps(problem).some(Boolean));
      }

      const maximumFrequency = range === '1-10' ? 5 : 3;
      expect(Math.max(...starts.values())).toBeLessThanOrEqual(maximumFrequency);
      expect(Math.max(...results.values())).toBeLessThanOrEqual(maximumFrequency);
      expect(regroupKinds).toEqual(new Set([false, true]));
    }
  );

  it.each(([
    '1-20',
    '1-30',
    '1-50',
    '1-100',
  ] as const).flatMap(range => ([
    'horizontal-chain-add',
    'horizontal-chain-sub',
  ] as const).map(mode => [range, mode] as const)))(
    'avoids concentrated later operands for %s %s without regrouping',
    (range, mode) => {
      const random = vi.spyOn(Math, 'random');

      try {
        for (const seed of [0, 1, 2, 3, 4]) {
          random.mockImplementation(seededRandom(seed));
          const problems = generateProblems(range, mode, 'none') as GeneratedChainProblem[];
          const maximumFrequency = (values: number[]) => {
            const counts = new Map<number, number>();
            for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
            return Math.max(...counts.values());
          };

          expect(maximumFrequency(problems.map(problem => problem.operands[1]))).toBeLessThanOrEqual(chainLaterOperandCaps[range]);
          expect(maximumFrequency(problems.map(problem => problem.operands[2]))).toBeLessThanOrEqual(chainLaterOperandCaps[range]);
          const simpleOperandPatterns = problems.filter(problem =>
            [1, 10].includes(problem.operands[1]) && [1, 10].includes(problem.operands[2])
          );
          expect(simpleOperandPatterns.length).toBeLessThanOrEqual(3);
        }
      } finally {
        random.mockRestore();
      }
    }
  );

  it('avoids concentrated later operands for chained addition with mixed regrouping', () => {
    const random = vi.spyOn(Math, 'random');

    try {
      for (const seed of [0, 1, 2, 3, 4]) {
        random.mockImplementation(seededRandom(seed));
        const problems = generateProblems(
          '1-20',
          'horizontal-chain-add',
          'mixed'
        ) as GeneratedChainProblem[];
        const maximumFrequency = (values: number[]) => {
          const counts = new Map<number, number>();
          for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
          return Math.max(...counts.values());
        };
        const simpleOperandPatterns = problems.filter(problem =>
          [1, 10].includes(problem.operands[1]) && [1, 10].includes(problem.operands[2])
        );

        expect(problems.filter(problem => regroupSteps(problem).some(Boolean))).toHaveLength(chainProblemCounts['1-20'] / 2);
        expect(maximumFrequency(problems.map(problem => problem.operands[1]))).toBeLessThanOrEqual(chainLaterOperandCaps['1-20']);
        expect(maximumFrequency(problems.map(problem => problem.operands[2]))).toBeLessThanOrEqual(chainLaterOperandCaps['1-20']);
        expect(simpleOperandPatterns.length).toBeLessThanOrEqual(3);
      }
    } finally {
      random.mockRestore();
    }
  });

  it.each(([
    'horizontal-chain-add',
    'horizontal-chain-sub',
    'horizontal-chain-mixed',
  ] as const).flatMap(mode => ([
    'none',
    'only',
    'mixed',
  ] as const).map(regroup => [mode, regroup] as const)))(
    'excludes one-valued later operands for %s with %s regrouping',
    (mode, regroup) => {
      const random = vi.spyOn(Math, 'random');

      try {
        for (const seed of [0, 1, 2]) {
          random.mockImplementation(seededRandom(seed));
          const problems = generateProblems('1-20', mode, regroup) as GeneratedChainProblem[];
          const oneOperandProblems = problems.filter(problem =>
            problem.operands[1] === 1 || problem.operands[2] === 1
          );

          expect(problems).toHaveLength(chainProblemCounts['1-20']);
          expect(oneOperandProblems).toHaveLength(0);
        }
      } finally {
        random.mockRestore();
      }
    }
  );
});
