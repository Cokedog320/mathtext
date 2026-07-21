import { Range, RegroupOption, HorizontalFillProblem } from '../../types';
import { additionRequiresRegroup, subtractionRequiresRegroup } from './regroup';
import { PRACTICE_BANDS } from './worksheetRules';

export type FillCandidate = Omit<HorizontalFillProblem, 'id'> & {
  key: string;
};

export const buildFillCandidates = (
  range: Range,
  op: '+' | '-',
  regroup: RegroupOption
): FillCandidate[] => {
  const [minTarget, maxTarget] = PRACTICE_BANDS[range];
  const candidates: FillCandidate[] = [];
  const ignoresRegroup = range === '1-10';

  if (op === '+') {
    for (let target = minTarget; target <= maxTarget; target++) {
      for (let num1 = 1; num1 < target; num1++) {
        const num2 = target - num1;
        if (num1 < 1 || num2 < 1) continue;

        const needsRegroup = additionRequiresRegroup(num1, num2);
        if (!ignoresRegroup && regroup === 'none' && needsRegroup) continue;
        if (!ignoresRegroup && regroup === 'only' && !needsRegroup) continue;

        // Create blankPosition 1 (□ + num2 = target)
        candidates.push({
          type: 'horizontal-fill',
          num1,
          num2,
          result: target,
          operator: '+',
          blankPosition: 1,
          key: `${num1}-+-${num2}-1`,
        });

        // Create blankPosition 2 (num1 + □ = target)
        candidates.push({
          type: 'horizontal-fill',
          num1,
          num2,
          result: target,
          operator: '+',
          blankPosition: 2,
          key: `${num1}-+-${num2}-2`,
        });
      }
    }
  } else if (op === '-') {
    for (let num1 = minTarget; num1 <= maxTarget; num1++) {
      for (let num2 = 1; num2 < num1; num2++) {
        const result = num1 - num2;
        if (num1 < 1 || num2 < 1 || result < 1) continue;

        const needsRegroup = subtractionRequiresRegroup(num1, num2);
        if (!ignoresRegroup && regroup === 'none' && needsRegroup) continue;
        if (!ignoresRegroup && regroup === 'only' && !needsRegroup) continue;

        // Create blankPosition 1 (□ - num2 = result)
        candidates.push({
          type: 'horizontal-fill',
          num1,
          num2,
          result,
          operator: '-',
          blankPosition: 1,
          key: `${num1}---${num2}-1`,
        });

        // Create blankPosition 2 (num1 - □ = result)
        candidates.push({
          type: 'horizontal-fill',
          num1,
          num2,
          result,
          operator: '-',
          blankPosition: 2,
          key: `${num1}---${num2}-2`,
        });
      }
    }
  }

  return candidates;
};
