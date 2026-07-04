import { describe, it, expect } from 'vitest';
import { generateProblems, Problem } from './App';

describe('generateProblems - Vertical Arithmetic', () => {
  it('should generate a mix of carry and no-carry addition problems', () => {
    let hasCarry = false, hasNoCarry = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('11-20', 'vertical-add');
      const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
      expect(arithmeticProblems.length).toBe(25);
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
      const problems = generateProblems('11-20', 'vertical-sub');
      const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '-');
      expect(arithmeticProblems.length).toBe(25);
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
      const problems = generateProblems('11-20', 'vertical-mixed');
      const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
      expect(arithmeticProblems.length).toBe(25);
      hasCarry = arithmeticProblems.some(p => p.operator === '+' && (p.num1 % 10) + (p.num2 % 10) > 9);
      hasBorrow = arithmeticProblems.some(p => p.operator === '-' && (p.num1 % 10) < (p.num2 % 10));
      if (hasCarry && hasBorrow) break;
    }
    expect(hasCarry).toBe(true);
    expect(hasBorrow).toBe(true);
  });

  it('should generate ONLY carry addition problems when regroup is only', () => {
    const problems = generateProblems('11-20', 'vertical-add', 'only');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
    
    expect(arithmeticProblems.length).toBe(25);
    
    const allHaveCarry = arithmeticProblems.every(p => (p.num1 % 10) + (p.num2 % 10) > 9);
    expect(allHaveCarry).toBe(true);
  });

  it('should generate ONLY no-carry addition problems when regroup is none', () => {
    const problems = generateProblems('11-20', 'vertical-add', 'none');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
    
    expect(arithmeticProblems.length).toBe(25);
    
    const allHaveNoCarry = arithmeticProblems.every(p => (p.num1 % 10) + (p.num2 % 10) <= 9);
    expect(allHaveNoCarry).toBe(true);
  });

  it('should generate ONLY borrow subtraction problems when regroup is only', () => {
    const problems = generateProblems('11-20', 'vertical-sub', 'only');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '-');
    
    expect(arithmeticProblems.length).toBe(25);
    
    const allHaveBorrow = arithmeticProblems.every(p => (p.num1 % 10) < (p.num2 % 10));
    expect(allHaveBorrow).toBe(true);
  });

  it('should generate ONLY no-borrow subtraction problems when regroup is none', () => {
    const problems = generateProblems('11-20', 'vertical-sub', 'none');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '-');
    
    expect(arithmeticProblems.length).toBe(25);
    
    const allHaveNoBorrow = arithmeticProblems.every(p => (p.num1 % 10) >= (p.num2 % 10));
    expect(allHaveNoBorrow).toBe(true);
  });
});

describe('generateProblems - Make-Ten Method', () => {
  it('should generate problems with specified left addend when provided', () => {
    const problems9 = generateProblems('11-20', 'make-ten', 'mixed', '9');
    expect(problems9.length).toBe(20);
    const allNine = problems9.every(p => p.type === 'method' && p.num1 === 9);
    expect(allNine).toBe(true);

    const problems5 = generateProblems('11-20', 'make-ten', 'mixed', '5');
    expect(problems5.length).toBe(20);
    const allFive = problems5.every(p => p.type === 'method' && p.num1 === 5);
    expect(allFive).toBe(true);
  });

  it('should generate mixed left addends in the range 5-9 when makeTenLeft is mixed', () => {
    const problemsMixed = generateProblems('11-20', 'make-ten', 'mixed', 'mixed');
    expect(problemsMixed.length).toBe(20);
    
    const leftAddends = new Set(problemsMixed.map(p => p.type === 'method' ? p.num1 : null));
    leftAddends.delete(null);
    expect(leftAddends.size).toBeGreaterThan(1);
    
    for (const val of leftAddends) {
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(9);
    }
  });

  it('should generate a perfectly uniform distribution of make-ten problems when candidates are limited', () => {
    const problems9 = generateProblems('11-20', 'make-ten', 'mixed', '9');
    expect(problems9.length).toBe(20);
    
    const frequencies: { [key: number]: number } = {};
    for (const p of problems9) {
      if (p.type === 'method') {
        frequencies[p.num2] = (frequencies[p.num2] || 0) + 1;
      }
    }
    
    expect(Object.keys(frequencies).length).toBe(8);
    for (const b in frequencies) {
      expect(frequencies[b]).toBeGreaterThanOrEqual(2);
      expect(frequencies[b]).toBeLessThanOrEqual(3);
    }
  });
});

describe('generateProblems - Horizontal Arithmetic', () => {
  it('should generate 20 problems in horizontal-add mode', () => {
    const problems = generateProblems('11-20', 'horizontal-add');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
    expect(arithmeticProblems.length).toBe(20);
    expect(arithmeticProblems.every(p => p.operator === '+')).toBe(true);
  });

  it('should generate 20 problems in horizontal-sub mode', () => {
    const problems = generateProblems('11-20', 'horizontal-sub');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
    expect(arithmeticProblems.length).toBe(20);
    expect(arithmeticProblems.every(p => p.operator === '-')).toBe(true);
  });

  it('should generate 20 problems in horizontal-mixed mode', () => {
    let hasAdd = false, hasSub = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('11-20', 'horizontal-mixed');
      const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
      expect(arithmeticProblems.length).toBe(20);
      hasAdd = arithmeticProblems.some(p => p.operator === '+');
      hasSub = arithmeticProblems.some(p => p.operator === '-');
      if (hasAdd && hasSub) break;
    }
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });
});

describe('generateProblems - Horizontal Arithmetic Details', () => {
  it('should generate a mix of carry and no-carry addition problems', () => {
    let hasCarry = false, hasNoCarry = false;
    for (let i = 0; i < 10; i++) {
      const problems = generateProblems('11-20', 'horizontal-add');
      const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
      expect(arithmetic.length).toBe(20);
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
      const problems = generateProblems('11-20', 'horizontal-mixed');
      const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
      expect(arithmetic.length).toBe(20);
      hasCarry = arithmetic.some(p => p.operator === '+' && (p.num1 % 10) + (p.num2 % 10) > 9);
      hasBorrow = arithmetic.some(p => p.operator === '-' && (p.num1 % 10) < (p.num2 % 10));
      if (hasCarry && hasBorrow) break;
    }
    expect(hasCarry).toBe(true);
    expect(hasBorrow).toBe(true);
  });

  it('should respect regroup settings in horizontal mode', () => {
    const problems = generateProblems('11-20', 'horizontal-add', 'none');
    const arithmetic = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
    expect(arithmetic.every(p => (p.num1 % 10) + (p.num2 % 10) <= 9)).toBe(true);
  });
});

describe('generateProblems - Break-Ten and Flat-Ten Methods', () => {
  it('should generate problems satisfying break-ten properties', () => {
    const problems = generateProblems('11-20', 'break-ten');
    expect(problems.length).toBe(20);
    expect(problems.every(p => {
      if (p.type !== 'method') return false;
      return p.num1 >= 11 && p.num1 <= 19 && p.num2 >= 1 && p.num2 <= 9 && (p.num1 - p.num2) < 10 && (p.num1 - p.num2) > 0;
    })).toBe(true);
  });

  it('should generate problems satisfying flat-ten properties', () => {
    const problems = generateProblems('11-20', 'flat-ten');
    expect(problems.length).toBe(20);
    expect(problems.every(p => {
      if (p.type !== 'method') return false;
      return p.num1 >= 11 && p.num1 <= 19 && p.num2 >= 1 && p.num2 <= 9 && (p.num1 - p.num2) < 10 && (p.num1 - p.num2) > 0;
    })).toBe(true);
  });
});

describe('generateProblems - Number Bonds', () => {
  it('should generate 12 number bond problems within selected range bounds', () => {
    const problems = generateProblems('11-20', 'number-bonds');
    expect(problems.length).toBe(12);
    expect(problems.every(p => {
      if (p.type !== 'bond') return false;
      const validTop = p.top >= 11 && p.top <= 20;
      const oneSideMissing = (p.left === '' && typeof p.right === 'number') || (p.right === '' && typeof p.left === 'number');
      return validTop && oneSideMissing;
    })).toBe(true);
  });
});



