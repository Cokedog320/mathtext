import { Problem } from '../../types';

export const generateNumberBonds = (
  bondUseType: 'practice' | 'study',
  bondNumber: number | '2-10',
  isBlankTemplate: boolean
): Problem[] => {
  const problems: Problem[] = [];
  if (bondNumber === '2-10' && !isBlankTemplate) {
    for (let n = 2; n <= 10; n++) {
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
      problems.push({ id: n - 2, type: 'bond', top: n, left, right });
    }
    return problems;
  }

  const targetNumber = (isBlankTemplate || bondNumber === '2-10') ? 10 : bondNumber;
  for (let k = 1; k < targetNumber; k++) {
    const leftVal = k;
    const rightVal = targetNumber - k;
    let left: number | string = leftVal;
    let right: number | string = rightVal;
    if (bondUseType === 'practice') {
      const isLeftKnown = Math.random() > 0.5;
      left = isLeftKnown ? leftVal : '';
      right = isLeftKnown ? '' : rightVal;
    }
    problems.push({
      id: k - 1,
      type: 'bond',
      top: isBlankTemplate ? '' : targetNumber,
      left: isBlankTemplate ? '' : left,
      right: isBlankTemplate ? '' : right,
      isBlank: isBlankTemplate
    });
  }
  return problems;
};
