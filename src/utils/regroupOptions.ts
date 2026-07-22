import type { LowerOperandDigits, Mode, Range, RegroupOption } from '../types';

export const DEFAULT_REGROUP_OPTION: RegroupOption = 'none';

export const isRegroupOptionAvailable = (
  range: Range,
  mode: Mode,
  option: RegroupOption,
  lowerOperandDigits: LowerOperandDigits,
): boolean => option !== 'only'
  || mode !== 'vertical-add'
  || (range !== '1-20' && (range !== '1-30' || lowerOperandDigits === 'one'));

export const normalizeRegroupOption = (
  range: Range,
  mode: Mode,
  option: RegroupOption,
  lowerOperandDigits: LowerOperandDigits,
): RegroupOption => isRegroupOptionAvailable(range, mode, option, lowerOperandDigits)
  ? option
  : 'mixed';
