import { Mode, Range, RegroupOption } from '../../types';
import { additionRequiresRegroup, subtractionRequiresRegroup } from './regroup';
import { PRACTICE_BANDS } from './worksheetRules';

export type ArithmeticMode = Extract<Mode,
  | 'vertical-add'
  | 'vertical-sub'
  | 'vertical-mixed'
  | 'horizontal-add'
  | 'horizontal-sub'
  | 'horizontal-mixed'
>;

export type HorizontalArithmeticMode = Extract<ArithmeticMode,
  'horizontal-add' | 'horizontal-sub' | 'horizontal-mixed'
>;

export type VerticalArithmeticMode = Extract<ArithmeticMode,
  'vertical-add' | 'vertical-sub' | 'vertical-mixed'
>;

export type ArithmeticCandidate = {
  num1: number;
  num2: number;
  operator: '+' | '-';
  lowerDigits: 'one' | 'two';
  needsRegroup: boolean;
};

export const buildArithmeticCandidates = (
  range: Range,
  mode: ArithmeticMode,
  regroup: RegroupOption,
  isVertical: boolean
): ArithmeticCandidate[] => {
  const [minTarget, maxTarget] = PRACTICE_BANDS[range];
  const includeAdd = mode.includes('-add') || mode.includes('-mixed');
  const includeSub = mode.includes('-sub') || mode.includes('-mixed');
  const ignoresRegroup = range === '1-10' && !isVertical;
  const candidates: ArithmeticCandidate[] = [];

  if (includeAdd) {
    for (let target = minTarget; target <= maxTarget; target++) {
      for (let num1 = 1; num1 < target; num1++) {
        const num2 = target - num1;
        if (isVertical && (num1 < 10 || num1 > 99)) continue;
        const needsRegroup = additionRequiresRegroup(num1, num2);
        if (!ignoresRegroup && regroup === 'none' && needsRegroup) continue;
        if (!ignoresRegroup && regroup === 'only' && !needsRegroup) continue;
        candidates.push({
          num1,
          num2,
          operator: '+',
          needsRegroup,
          lowerDigits: num2 < 10 ? 'one' : 'two',
        });
      }
    }
  }

  if (includeSub) {
    for (let num1 = minTarget; num1 <= maxTarget; num1++) {
      for (let num2 = 1; num2 < num1; num2++) {
        if (isVertical && (num1 < 10 || num1 > 99)) continue;
        const needsRegroup = subtractionRequiresRegroup(num1, num2);
        if (!ignoresRegroup && regroup === 'none' && needsRegroup) continue;
        if (!ignoresRegroup && regroup === 'only' && !needsRegroup) continue;
        candidates.push({
          num1,
          num2,
          operator: '-',
          needsRegroup,
          lowerDigits: num2 < 10 ? 'one' : 'two',
        });
      }
    }
  }

  return candidates;
};
