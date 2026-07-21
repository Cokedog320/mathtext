import { Problem } from '../../types';
import { takeBalancedCandidates } from './balanceCandidates';

export const generateMakeTen = (makeTenLeft: string): Problem[] => {
  const candidates: { a: number; b: number }[] = [];
  const aValues: number[] = [];
  if (makeTenLeft === 'mixed') {
    for (let val = 5; val <= 9; val++) {
      aValues.push(val);
    }
  } else {
    aValues.push(parseInt(makeTenLeft, 10));
  }

  for (const a of aValues) {
    const minB = Math.max(2, 11 - a);
    const maxB = Math.min(9, 19 - a);
    for (let b = minB; b <= maxB; b++) {
      candidates.push({ a, b });
    }
  }

  return takeBalancedCandidates(candidates, 20, candidate => candidate.a)
    .map(({ a, b }, id) => ({ id, type: 'method', num1: a, num2: b, operator: '+', method: 'make-ten' }));
};

export const generateBreakTenOrFlatTen = (
  mode: 'break-ten' | 'flat-ten'
): Problem[] => {
  const candidates: { a: number; b: number }[] = [];
  for (let a = 11; a <= 18; a++) {
    for (let b = Math.max(1, a - 9); b <= Math.min(9, a - 1); b++) {
      candidates.push({ a, b });
    }
  }

  return takeBalancedCandidates(candidates, 20, candidate => candidate.a)
    .map(({ a, b }, id) => ({ id, type: 'method', num1: a, num2: b, operator: '-', method: mode }));
};
