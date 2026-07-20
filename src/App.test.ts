import { describe, it, expect, vi } from 'vitest';
import { generateProblems, getRequestedProblemCount, requiresRegroup } from './utils/problemGenerator';
import type { Problem } from './types';

type GeneratedChainProblem = Extract<Problem, { type: 'arithmetic-chain' }>;

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

  it('should generate mixed carry/borrow in vertical-mixed mode', () => {
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

describe('generateProblems - Make-Ten Method', () => {
  it('returns every unique problem for a specified left addend', () => {
    const problems9 = generateProblems('1-20', 'make-ten', 'mixed', '9');
    expect(problems9.length).toBe(8);
    const allNine = problems9.every(p => p.type === 'method' && p.num1 === 9);
    expect(allNine).toBe(true);
    expect(new Set(problems9.map(p => p.type === 'method' ? `${p.num1}+${p.num2}` : '')).size).toBe(8);

    const problems5 = generateProblems('1-20', 'make-ten', 'mixed', '5');
    expect(problems5.length).toBe(4);
    const allFive = problems5.every(p => p.type === 'method' && p.num1 === 5);
    expect(allFive).toBe(true);
    expect(new Set(problems5.map(p => p.type === 'method' ? `${p.num1}+${p.num2}` : '')).size).toBe(4);
  });

  it('should generate mixed left addends in the range 5-9 when makeTenLeft is mixed', () => {
    const problemsMixed = generateProblems('1-20', 'make-ten', 'mixed', 'mixed');
    expect(problemsMixed.length).toBe(20);
    
    const leftAddends = new Set(problemsMixed.map(p => p.type === 'method' ? p.num1 : null));
    leftAddends.delete(null);
    expect(leftAddends.size).toBe(5);
    
    for (const val of leftAddends) {
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(9);
    }
  });

  it('balances mixed make-ten problems across left addends without exact repeats', () => {
    const problems = generateProblems('1-20', 'make-ten', 'mixed', 'mixed');
    expect(problems.length).toBe(20);

    const frequencies: { [key: number]: number } = {};
    const equations = new Set<string>();
    for (const p of problems) {
      if (p.type === 'method') {
        frequencies[p.num1] = (frequencies[p.num1] || 0) + 1;
        equations.add(`${p.num1}+${p.num2}`);
      }
    }

    expect(frequencies).toEqual({ 5: 4, 6: 4, 7: 4, 8: 4, 9: 4 });
    expect(equations.size).toBe(20);
  });
});

describe('generateProblems - Horizontal Arithmetic', () => {
  it('should generate 24 problems in horizontal-add mode within 20', () => {
    const problems = generateProblems('1-20', 'horizontal-add');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
    expect(arithmeticProblems.length).toBe(24);
    expect(arithmeticProblems.every(p => p.operator === '+')).toBe(true);
  });

  it('should generate 24 problems in horizontal-sub mode within 20', () => {
    const problems = generateProblems('1-20', 'horizontal-sub');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
    expect(arithmeticProblems.length).toBe(24);
    expect(arithmeticProblems.every(p => p.operator === '-')).toBe(true);
  });

  it('should generate 24 problems in horizontal-mixed mode within 20', () => {
    let hasAdd = false, hasSub = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('1-20', 'horizontal-mixed');
      const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
      expect(arithmeticProblems.length).toBe(24);
      hasAdd = arithmeticProblems.some(p => p.operator === '+');
      hasSub = arithmeticProblems.some(p => p.operator === '-');
      if (hasAdd && hasSub) break;
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });
});

describe('generateProblems - Chained Arithmetic', () => {
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

    expect(problems).toHaveLength(20);
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

    expect(problems).toHaveLength(20);
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

    expect(problems).toHaveLength(20);
    expect(problems.filter(problem => problem.operators.join('') === '+-')).toHaveLength(10);
    expect(problems.filter(problem => problem.operators.join('') === '-+')).toHaveLength(10);
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

    expect(withoutRegroup).toHaveLength(20);
    expect(withoutRegroup.every(problem => regroupSteps(problem).every(value => !value))).toBe(true);
    expect(withRegroup).toHaveLength(20);
    expect(withRegroup.every(problem => regroupSteps(problem).some(Boolean))).toBe(true);
  });

  it.each([
    'horizontal-chain-add',
    'horizontal-chain-sub',
    'horizontal-chain-mixed',
  ] as const)('respects all-place regroup settings within 100 for %s', mode => {
    const withoutRegroup = generateProblems('1-100', mode, 'none') as GeneratedChainProblem[];
    const withRegroup = generateProblems('1-100', mode, 'only') as GeneratedChainProblem[];

    expect(withoutRegroup).toHaveLength(20);
    expect(withoutRegroup.every(problem => regroupSteps(problem).every(value => !value))).toBe(true);
    expect(withRegroup).toHaveLength(20);
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
      expect(problems.filter(problem => regroupSteps(problem).some(Boolean))).toHaveLength(10);
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
          let state = seed;
          random.mockImplementation(seed === 0
            ? () => 0
            : () => {
                state = (state * 1664525 + 1013904223) >>> 0;
                return state / 0x100000000;
              }
          );
          const problems = generateProblems(range, mode, 'none') as GeneratedChainProblem[];
          const maximumFrequency = (values: number[]) => {
            const counts = new Map<number, number>();
            for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
            return Math.max(...counts.values());
          };

          expect(maximumFrequency(problems.map(problem => problem.operands[1]))).toBeLessThanOrEqual(4);
          expect(maximumFrequency(problems.map(problem => problem.operands[2]))).toBeLessThanOrEqual(4);
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
        let state = seed;
        random.mockImplementation(seed === 0
          ? () => 0
          : () => {
              state = (state * 1664525 + 1013904223) >>> 0;
              return state / 0x100000000;
            }
        );
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

        expect(problems.filter(problem => regroupSteps(problem).some(Boolean))).toHaveLength(10);
        expect(maximumFrequency(problems.map(problem => problem.operands[1]))).toBeLessThanOrEqual(4);
        expect(maximumFrequency(problems.map(problem => problem.operands[2]))).toBeLessThanOrEqual(4);
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
    'limits one-valued later operands to two problems for %s with %s regrouping',
    (mode, regroup) => {
      const random = vi.spyOn(Math, 'random');

      try {
        for (const seed of [0, 1, 2]) {
          let state = seed;
          random.mockImplementation(seed === 0
            ? () => 0
            : () => {
                state = (state * 1664525 + 1013904223) >>> 0;
                return state / 0x100000000;
              }
          );
          const problems = generateProblems('1-20', mode, regroup) as GeneratedChainProblem[];
          const oneOperandProblems = problems.filter(problem =>
            problem.operands[1] === 1 || problem.operands[2] === 1
          );

          expect(problems).toHaveLength(20);
          expect(oneOperandProblems).toHaveLength(2);
        }
      } finally {
        random.mockRestore();
      }
    }
  );
});

describe('generateProblems - Horizontal Arithmetic Details', () => {
  it('does not repeat addition facts with the operands swapped', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      const problems = generateProblems('1-50', 'horizontal-add', 'only');
      const additionFacts = problems.map(problem => {
        if (problem.type !== 'arithmetic') throw new Error('Expected an arithmetic problem');
        return [problem.num1, problem.num2].sort((a, b) => a - b).join('+');
      });

      expect(new Set(additionFacts).size).toBe(additionFacts.length);
    } finally {
      random.mockRestore();
    }
  });

  it('does not repeat subtraction facts with the missing part swapped', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      const problems = generateProblems('1-50', 'horizontal-sub', 'only');
      const subtractionFacts = problems.map(problem => {
        if (problem.type !== 'arithmetic') throw new Error('Expected an arithmetic problem');
        const difference = problem.num1 - problem.num2;
        return `${problem.num1}|${[problem.num2, difference].sort((a, b) => a - b).join('|')}`;
      });

      expect(new Set(subtractionFacts).size).toBe(subtractionFacts.length);
    } finally {
      random.mockRestore();
    }
  });

  it('does not repeat the same fact across addition and subtraction', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      const problems = generateProblems('1-50', 'horizontal-mixed', 'only');
      const arithmeticFacts = problems.map(problem => {
        if (problem.type !== 'arithmetic') throw new Error('Expected an arithmetic problem');
        const whole = problem.operator === '+' ? problem.num1 + problem.num2 : problem.num1;
        const parts = problem.operator === '+'
          ? [problem.num1, problem.num2]
          : [problem.num2, problem.num1 - problem.num2];
        return `${whole}|${parts.sort((a, b) => a - b).join('|')}`;
      });

      expect(new Set(arithmeticFacts).size).toBe(arithmeticFacts.length);
    } finally {
      random.mockRestore();
    }
  });

  it('should generate a mix of carry and no-carry addition problems', () => {
    let hasCarry = false, hasNoCarry = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('1-20', 'horizontal-add');
      const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
      expect(arithmetic.length).toBe(24);
      hasCarry = arithmetic.some(p => (p.num1 % 10) + (p.num2 % 10) > 9);
      hasNoCarry = arithmetic.some(p => (p.num1 % 10) + (p.num2 % 10) <= 9);
      if (hasCarry && hasNoCarry) break;
    }
    expect(hasCarry).toBe(true);
    expect(hasNoCarry).toBe(true);
  });

  it('should generate mixed carry/borrow in horizontal-mixed mode', () => {
    let hasCarry = false, hasBorrow = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('1-20', 'horizontal-mixed');
      const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
      expect(arithmetic.length).toBe(24);
      hasCarry = arithmetic.some(p => p.operator === '+' && (p.num1 % 10) + (p.num2 % 10) > 9);
      hasBorrow = arithmetic.some(p => p.operator === '-' && (p.num1 % 10) < (p.num2 % 10));
      if (hasCarry && hasBorrow) break;
    }
    expect(hasCarry).toBe(true);
    expect(hasBorrow).toBe(true);
  });

  it('should respect regroup settings in horizontal mode', () => {
    const problems = generateProblems('1-20', 'horizontal-add', 'none');
    const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
    expect(arithmetic.every(p => (p.num1 % 10) + (p.num2 % 10) <= 9)).toBe(true);
  });
});

describe('generateProblems - Practice bands and worksheet density', () => {
  const horizontalCountCases = ([
    ['1-10', 20],
    ['1-20', 24],
    ['1-30', 60],
    ['1-50', 30],
    ['1-100', 60],
  ] as const).flatMap(([range, count]) =>
    (['horizontal-add', 'horizontal-sub', 'horizontal-mixed'] as const)
      .map(mode => [range, mode, count] as const)
  );

  it.each(horizontalCountCases)('generates the horizontal count for %s %s', (range, mode, count) => {
    expect(generateProblems(range, mode)).toHaveLength(count);
  });

  it.each([
    ['1-20', 'horizontal-add', 5, false, 24],
    ['1-50', 'horizontal-add', 5, false, 30],
    ['1-100', 'horizontal-add', 5, false, 60],
    ['1-100', 'horizontal-chain-mixed', 5, false, 20],
    ['1-20', 'number-bonds', 7, false, 6],
    ['1-20', 'number-bonds', '2-10', false, 9],
    ['1-20', 'number-bonds', 5, true, 9],
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
        let state = seed;
        random.mockImplementation(seed === 0
          ? () => 0
          : () => {
              state = (state * 1664525 + 1013904223) >>> 0;
              return state / 0x100000000;
            }
        );
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

describe('generateProblems - Break-Ten and Flat-Ten Methods', () => {
  it('should generate problems satisfying break-ten properties', () => {
    const problems = generateProblems('1-20', 'break-ten');
    expect(problems.length).toBe(20);
    expect(problems.every(p => {
      if (p.type !== 'method') return false;
      return p.num1 >= 11 && p.num1 <= 19 && p.num2 >= 1 && p.num2 <= 9 && (p.num1 - p.num2) < 10 && (p.num1 - p.num2) > 0;
    })).toBe(true);
    const equations = problems.map(p => p.type === 'method' ? `${p.num1}-${p.num2}` : '');
    expect(new Set(equations).size).toBe(20);
    const minuendCounts = problems.reduce<Record<number, number>>((counts, p) => {
      if (p.type === 'method') counts[p.num1] = (counts[p.num1] ?? 0) + 1;
      return counts;
    }, {});
    expect(Math.max(...Object.values(minuendCounts))).toBeLessThanOrEqual(3);
  });

  it('should generate problems satisfying flat-ten properties', () => {
    const problems = generateProblems('1-20', 'flat-ten');
    expect(problems.length).toBe(20);
    expect(problems.every(p => {
      if (p.type !== 'method') return false;
      return p.num1 >= 11 && p.num1 <= 19 && p.num2 >= 1 && p.num2 <= 9 && (p.num1 - p.num2) < 10 && (p.num1 - p.num2) > 0;
    })).toBe(true);
    const equations = problems.map(p => p.type === 'method' ? `${p.num1}-${p.num2}` : '');
    expect(new Set(equations).size).toBe(20);
    const minuendCounts = problems.reduce<Record<number, number>>((counts, p) => {
      if (p.type === 'method') counts[p.num1] = (counts[p.num1] ?? 0) + 1;
      return counts;
    }, {});
    expect(Math.max(...Object.values(minuendCounts))).toBeLessThanOrEqual(3);
  });
});


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

  it('limits add-one facts to at most two distinct horizontal addition problems', () => {
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
    expect(addOneProblems.length).toBeLessThanOrEqual(2);
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
        onePlusTwo: true,
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

  it('limits one-valued later addends to two chained addition problems', () => {
    const problems = generateProblems(
      '1-10',
      'horizontal-chain-add',
      'mixed'
    ) as GeneratedChainProblem[];
    const addOneProblems = problems.filter(problem =>
      problem.operands[1] === 1 || problem.operands[2] === 1
    );

    expect(problems).toHaveLength(20);
    expect(addOneProblems).toHaveLength(2);
  });

  it('limits one-valued subtrahends to two chained subtraction problems', () => {
    const problems = generateProblems(
      '1-10',
      'horizontal-chain-sub',
      'mixed'
    ) as GeneratedChainProblem[];
    const subtractOneProblems = problems.filter(problem =>
      problem.operands[1] === 1 || problem.operands[2] === 1
    );

    expect(problems).toHaveLength(20);
    expect(subtractOneProblems).toHaveLength(2);
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

describe('generateProblems - Number Bonds (Single Number)', () => {
  it('should generate exactly N-1 problems for target number N', () => {
    for (let n = 2; n <= 10; n++) {
      const problems = generateProblems('1-20', 'number-bonds', 'mixed', 'mixed', 'practice', n);
      expect(problems.length).toBe(n - 1);
      expect(problems.every(p => p.type === 'bond' && p.top === n)).toBe(true);
    }
  });

  it('should exclude zero splits', () => {
    const problems = generateProblems('1-20', 'number-bonds', 'mixed', 'mixed', 'study', 10);
    for (const p of problems) {
      if (p.type === 'bond') {
        expect(p.left).not.toBe(0);
        expect(p.right).not.toBe(0);
        expect(p.left).not.toBe(10);
        expect(p.right).not.toBe(10);
      }
    }
  });

  it('should show all numbers in study mode', () => {
    const problems = generateProblems('1-20', 'number-bonds', 'mixed', 'mixed', 'study', 5);
    for (const p of problems) {
      if (p.type === 'bond') {
        expect(typeof p.left).toBe('number');
        expect(typeof p.right).toBe('number');
        expect((p.left as number) + (p.right as number)).toBe(5);
      }
    }
  });

  it('should hide exactly one part in practice mode', () => {
    const problems = generateProblems('1-20', 'number-bonds', 'mixed', 'mixed', 'practice', 5);
    for (const p of problems) {
      if (p.type === 'bond') {
        const leftIsHidden = p.left === '';
        const rightIsHidden = p.right === '';
        expect(leftIsHidden || rightIsHidden).toBe(true);
        expect(leftIsHidden && rightIsHidden).toBe(false);
      }
    }
  });

  it('should generate completely blank template of size 9 when isBlankTemplate is true', () => {
    const problems = generateProblems('1-20', 'number-bonds', 'mixed', 'mixed', 'practice', 5, true);
    expect(problems.length).toBe(9);
    for (const p of problems) {
      if (p.type === 'bond') {
        expect(p.top).toBe('');
        expect(p.left).toBe('');
        expect(p.right).toBe('');
        expect(p.isBlank).toBe(true);
      }
    }
  });

  it('should generate exactly one problem for each number in 2-10 range when bondNumber is 2-10', () => {
    const problems = generateProblems('1-20', 'number-bonds', 'mixed', 'mixed', 'practice', '2-10');
    expect(problems.length).toBe(9);
    const tops = problems.map(p => p.type === 'bond' ? p.top : 0).sort((a, b) => (a as number) - (b as number));
    expect(tops).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});



