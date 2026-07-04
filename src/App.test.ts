import { describe, it, expect } from 'vitest';
import { generateProblems, Problem } from './App';

describe('generateProblems - Vertical Arithmetic', () => {
  it('should generate a mix of carry and no-carry addition problems', () => {
    const problems = generateProblems('11-20', 'vertical-add');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '+');
    
    expect(arithmeticProblems.length).toBe(25);
    
    const hasCarry = arithmeticProblems.some(p => (p.num1 % 10) + (p.num2 % 10) > 9);
    const hasNoCarry = arithmeticProblems.some(p => (p.num1 % 10) + (p.num2 % 10) <= 9);
    
    // With 25 problems, it's statistically almost certain to have both unless the range is very restricted
    expect(hasCarry).toBe(true);
    expect(hasNoCarry).toBe(true);
  });

  it('should generate a mix of borrow and no-borrow subtraction problems', () => {
    const problems = generateProblems('11-20', 'vertical-sub');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic' && p.operator === '-');
    
    expect(arithmeticProblems.length).toBe(25);
    
    const hasBorrow = arithmeticProblems.some(p => (p.num1 % 10) < (p.num2 % 10));
    const hasNoBorrow = arithmeticProblems.some(p => (p.num1 % 10) >= (p.num2 % 10));
    
    expect(hasBorrow).toBe(true);
    expect(hasNoBorrow).toBe(true);
  });

  it('should generate mixed carry/borrow in vertical-mixed mode', () => {
    const problems = generateProblems('11-20', 'vertical-mixed');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
    
    expect(arithmeticProblems.length).toBe(25);
    
    const hasCarry = arithmeticProblems.some(p => p.operator === '+' && (p.num1 % 10) + (p.num2 % 10) > 9);
    const hasBorrow = arithmeticProblems.some(p => p.operator === '-' && (p.num1 % 10) < (p.num2 % 10));
    
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
    const problems = generateProblems('11-20', 'horizontal-mixed');
    const arithmeticProblems = problems.filter((p): p is Extract<Problem, { type: 'arithmetic' }> => p.type === 'arithmetic');
    expect(arithmeticProblems.length).toBe(20);
    const hasAdd = arithmeticProblems.some(p => p.operator === '+');
    const hasSub = arithmeticProblems.some(p => p.operator === '-');
    expect(hasAdd).toBe(true);
    expect(hasSub).toBe(true);
  });
});
