import { describe, expect, it } from "vitest";
import { generateProblems } from "./problemGenerator";

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
