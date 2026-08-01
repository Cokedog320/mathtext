import { Mode, Range } from '../../types';

export const PRACTICE_BANDS: Record<Range, [number, number]> = {
  '1-10': [2, 10],
  '1-20': [11, 20],
  '1-30': [21, 30],
  '1-50': [31, 50],
  '1-100': [51, 100],
  '1-200': [100, 200],
  '1-500': [100, 500],
};

export const HORIZONTAL_PROBLEM_COUNTS: Record<Range, number> = {
  '1-10': 20,
  '1-20': 30,
  '1-30': 50,
  '1-50': 60,
  '1-100': 60,
  '1-200': 60,
  '1-500': 60,
};

export const MAX_VALUE_ONE_OPERAND_PROBLEMS = 1;

export type ExtendedVerticalRange = Extract<Range, '1-200' | '1-500'>;

export const isExtendedVerticalRange = (range: Range): range is ExtendedVerticalRange =>
  range === '1-200' || range === '1-500';

export const normalizeRangeForMode = (range: Range, mode: Mode): Range =>
  mode.startsWith('vertical-') || !isExtendedVerticalRange(range) ? range : '1-100';

export const getRequestedProblemCount = (
  range: Range,
  mode: Mode,
  bondNumber: number | 'mixed' = 5,
  isBlankTemplate = false
): number => {
  if (mode === 'number-bonds') {
    return isBlankTemplate || bondNumber === 'mixed' ? 12 : bondNumber - 1;
  }
  if (mode.startsWith('horizontal-chain-')) return HORIZONTAL_PROBLEM_COUNTS[range];
  if (mode.startsWith('vertical-')) return 20;
  if (mode.startsWith('horizontal-')) return HORIZONTAL_PROBLEM_COUNTS[range];
  return 20;
};
