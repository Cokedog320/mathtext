import { describe, expect, it, vi } from "vitest";
import {
  canRegenerateNumberBonds,
  generateProblems,
} from "./problemGenerator";

describe('generateProblems - Number Bonds (Single Number)', () => {
  it('regenerates only mixed-target pages', () => {
    for (let target = 2; target <= 10; target++) {
      expect(canRegenerateNumberBonds(target, false)).toBe(false);
    }

    expect(canRegenerateNumberBonds('mixed', false)).toBe(true);
    expect(canRegenerateNumberBonds('mixed', true)).toBe(false);
  });

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

  it('asks for each missing part once across mirrored fixed-target problems', () => {
    let callCount = 0;
    const random = vi.spyOn(Math, 'random').mockImplementation(() =>
      callCount++ % 2 === 0 ? 0.25 : 0.75);

    try {
      for (const target of [3, 5]) {
        const problems = generateProblems('1-20', 'number-bonds', 'mixed', 'mixed', 'practice', target);
        const missingParts = problems.map(problem => {
          if (problem.type !== 'bond' || typeof problem.top !== 'number') return NaN;
          const knownPart = problem.left === '' ? problem.right : problem.left;
          return problem.top - Number(knownPart);
        });

        expect(missingParts.sort((a, b) => a - b)).toEqual(
          Array.from({ length: target - 1 }, (_, index) => index + 1),
        );
      }
    } finally {
      random.mockRestore();
    }
  });

  it('should generate a twelve-problem blank template when isBlankTemplate is true', () => {
    const problems = generateProblems('1-20', 'number-bonds', 'mixed', 'mixed', 'practice', 5, true);
    expect(problems.length).toBe(12);
    for (const p of problems) {
      if (p.type === 'bond') {
        expect(p.top).toBe('');
        expect(p.left).toBe('');
        expect(p.right).toBe('');
        expect(p.isBlank).toBe(true);
      }
    }
  });

  it('generates twelve mixed-target problems without forcing the 1 + 1 decomposition', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.1);

    try {
      const problems = generateProblems('1-20', 'number-bonds', 'mixed', 'mixed', 'practice', 'mixed');

      expect(problems).toHaveLength(12);
      expect(problems.every(problem =>
        problem.type === 'bond'
        && typeof problem.top === 'number'
        && problem.top >= 3
        && problem.top <= 10
      )).toBe(true);

      const targetCounts = problems.reduce<Map<number, number>>((counts, problem) => {
        if (problem.type === 'bond' && typeof problem.top === 'number') {
          counts.set(problem.top, (counts.get(problem.top) ?? 0) + 1);
        }
        return counts;
      }, new Map());

      expect([...targetCounts.keys()].sort((a, b) => a - b)).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
      expect([...targetCounts.values()].every(count => count <= 2)).toBe(true);
    } finally {
      random.mockRestore();
    }
  });

  it('includes exactly one target number 2 when the mixed worksheet selects it', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0);

    try {
      const problems = generateProblems('1-20', 'number-bonds', 'mixed', 'mixed', 'practice', 'mixed');
      const targetTwos = problems.filter(problem => problem.type === 'bond' && problem.top === 2);

      expect(problems).toHaveLength(12);
      expect(targetTwos).toHaveLength(1);
    } finally {
      random.mockRestore();
    }
  });
});
