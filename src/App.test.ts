import { describe, it, expect, vi } from 'vitest';
import { generateProblems } from './utils/problemGenerator';
import { Problem } from './types';

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



