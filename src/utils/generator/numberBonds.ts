import { Problem } from '../../types';
import { shuffle } from './random';

export const canRegenerateNumberBonds = (
  bondNumber: number | 'mixed',
  isBlankTemplate: boolean,
): boolean => bondNumber === 'mixed' && !isBlankTemplate;

export const generateNumberBonds = (
  bondUseType: 'practice' | 'study',
  bondNumber: number | 'mixed',
  isBlankTemplate: boolean
): Problem[] => {
  const problems: Problem[] = [];
  if (isBlankTemplate) {
    return Array.from({ length: 12 }, (_, id) => ({
      id,
      type: 'bond' as const,
      top: '',
      left: '',
      right: '',
      isBlank: true,
    }));
  }

  if (bondNumber === 'mixed' && !isBlankTemplate) {
    const includesTwo = Math.random() < 0.1;
    const standardTargets = [3, 4, 5, 6, 7, 8, 9, 10];
    const extraTargets = shuffle(standardTargets).slice(0, includesTwo ? 3 : 4);
    const targets = shuffle([
      ...standardTargets,
      ...extraTargets,
      ...(includesTwo ? [2] : []),
    ]);

    for (const [id, n] of targets.entries()) {
      const k = Math.floor(Math.random() * (n - 1)) + 1;
      const leftVal = k;
      const rightVal = n - k;
      let left: number | string = leftVal;
      let right: number | string = rightVal;
      if (bondUseType === 'practice') {
        const isLeftKnown = Math.random() > 0.5;
        left = isLeftKnown ? leftVal : '';
        right = isLeftKnown ? '' : rightVal;
      }
      problems.push({ id, type: 'bond', top: n, left, right });
    }
    return problems;
  }

  const targetNumber = bondNumber;
  if (typeof targetNumber !== 'number') return problems;
  const leftKnownByPair = new Map<number, boolean>();

  for (let k = 1; k < targetNumber; k++) {
    const leftVal = k;
    const rightVal = targetNumber - k;
    let left: number | string = leftVal;
    let right: number | string = rightVal;
    if (bondUseType === 'practice') {
      const pairKey = Math.min(leftVal, rightVal);
      const isLeftKnown = leftKnownByPair.get(pairKey) ?? Math.random() > 0.5;
      leftKnownByPair.set(pairKey, isLeftKnown);
      left = isLeftKnown ? leftVal : '';
      right = isLeftKnown ? '' : rightVal;
    }
    problems.push({
      id: k - 1,
      type: 'bond',
      top: targetNumber,
      left,
      right,
    });
  }
  return problems;
};
