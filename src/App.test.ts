import { describe, it, expect } from 'vitest';
import { generateProblems } from './App';

describe('generateProblems - Vertical Arithmetic', () => {
  it('should generate a mix of carry and no-carry addition problems', () => {
    const problems = generateProblems('11-20', 'vertical-add');
    const arithmeticProblems = problems.filter(p => p.type === 'arithmetic' && p.operator === '+');
    
    expect(arithmeticProblems.length).toBe(25);
    
    const hasCarry = arithmeticProblems.some(p => (p.num1 % 10) + (p.num2 % 10) > 9);
    const hasNoCarry = arithmeticProblems.some(p => (p.num1 % 10) + (p.num2 % 10) <= 9);
    
    // With 25 problems, it's statistically almost certain to have both unless the range is very restricted
    expect(hasCarry).toBe(true);
    expect(hasNoCarry).toBe(true);
  });

  it('should generate a mix of borrow and no-borrow subtraction problems', () => {
    const problems = generateProblems('11-20', 'vertical-sub');
    const arithmeticProblems = problems.filter(p => p.type === 'arithmetic' && p.operator === '-');
    
    expect(arithmeticProblems.length).toBe(25);
    
    const hasBorrow = arithmeticProblems.some(p => (p.num1 % 10) < (p.num2 % 10));
    const hasNoBorrow = arithmeticProblems.some(p => (p.num1 % 10) >= (p.num2 % 10));
    
    expect(hasBorrow).toBe(true);
    expect(hasNoBorrow).toBe(true);
  });

  it('should generate mixed carry/borrow in vertical-mixed mode', () => {
    const problems = generateProblems('11-20', 'vertical-mixed');
    const arithmeticProblems = problems.filter(p => p.type === 'arithmetic');
    
    expect(arithmeticProblems.length).toBe(25);
    
    const hasCarry = arithmeticProblems.some(p => p.operator === '+' && (p.num1 % 10) + (p.num2 % 10) > 9);
    const hasBorrow = arithmeticProblems.some(p => p.operator === '-' && (p.num1 % 10) < (p.num2 % 10));
    
    expect(hasCarry).toBe(true);
    expect(hasBorrow).toBe(true);
  });
});
