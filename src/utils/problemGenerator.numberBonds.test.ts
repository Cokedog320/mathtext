import { describe, expect, it } from "vitest";
import { generateProblems } from "./problemGenerator";

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
