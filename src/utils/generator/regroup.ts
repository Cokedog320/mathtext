import { RegroupOption } from '../../types';

export type ArithmeticOperator = '+' | '-';

export const additionRequiresRegroup = (left: number, right: number): boolean => {
  let remainingLeft = left;
  let remainingRight = right;
  while (remainingLeft > 0 || remainingRight > 0) {
    if ((remainingLeft % 10) + (remainingRight % 10) >= 10) return true;
    remainingLeft = Math.floor(remainingLeft / 10);
    remainingRight = Math.floor(remainingRight / 10);
  }
  return false;
};

export const subtractionRequiresRegroup = (left: number, right: number): boolean => {
  let remainingLeft = left;
  let remainingRight = right;
  while (remainingLeft > 0 || remainingRight > 0) {
    if ((remainingLeft % 10) < (remainingRight % 10)) return true;
    remainingLeft = Math.floor(remainingLeft / 10);
    remainingRight = Math.floor(remainingRight / 10);
  }
  return false;
};

export const requiresRegroup = (
  left: number,
  operator: ArithmeticOperator,
  right: number
): boolean => operator === '+'
  ? additionRequiresRegroup(left, right)
  : subtractionRequiresRegroup(left, right);

export const matchesRegroup = (needsRegroup: boolean, regroup: RegroupOption): boolean =>
  regroup === 'mixed' || (regroup === 'only' ? needsRegroup : !needsRegroup);
