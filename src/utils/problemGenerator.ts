import { Mode, Range, RegroupOption, Problem, Language } from '../types';

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const getPrintTitle = (mode: Mode, range: Range, regroup: RegroupOption, language: Language, t: any): string => {
  if (range === '20-regroup') {
    if (mode.includes('-add')) {
      return language === 'zh' ? '20以内进位加法' : 'Carrying Addition within 20';
    }
    if (mode.includes('-sub')) {
      return language === 'zh' ? '20以内退位减法' : 'Borrowing Subtraction within 20';
    }
    if (mode.includes('-mixed')) {
      return language === 'zh' ? '20以内加减法 (进退位)' : 'Regrouping Arithmetic within 20';
    }
  }
  if (range === '1-10') {
    if (mode.includes('-add')) {
      return language === 'zh' ? '10以内加法' : 'Addition within 10';
    }
    if (mode.includes('-sub')) {
      return language === 'zh' ? '10以内减法' : 'Subtraction within 10';
    }
    if (mode.includes('-mixed')) {
      return language === 'zh' ? '10以内加减混合' : 'Mixed Arithmetic within 10';
    }
  }
  return t.printTitles[mode];
};

const generateNumberBonds = (
  range: Range,
  regroup: RegroupOption,
  makeTenLeft: string,
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

const generateMakeTen = (
  range: Range,
  regroup: RegroupOption,
  makeTenLeft: string
): Problem[] => {
  const problems: Problem[] = [];
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

  const shuffled = shuffle(candidates);
  if (shuffled.length === 0) return [];
  let index = 0;
  while (problems.length < 20) {
    if (index >= shuffled.length) {
      shuffle(shuffled);
      index = 0;
    }
    const { a, b } = shuffled[index++];
    problems.push({ id: problems.length, type: 'method', num1: a, num2: b, operator: '+', method: 'make-ten' });
  }
  return problems;
};

const generateBreakTenOrFlatTen = (
  mode: 'break-ten' | 'flat-ten'
): Problem[] => {
  const problems: Problem[] = [];
  const candidates: { a: number; b: number }[] = [];
  for (let a = 11; a <= 18; a++) {
    for (let b = Math.max(1, a - 9); b <= Math.min(9, a - 1); b++) {
      candidates.push({ a, b });
    }
  }

  const shuffled = shuffle(candidates);
  if (shuffled.length === 0) return [];
  let index = 0;
  while (problems.length < 20) {
    if (index >= shuffled.length) {
      shuffle(shuffled);
      index = 0;
    }
    const { a, b } = shuffled[index++];
    problems.push({ id: problems.length, type: 'method', num1: a, num2: b, operator: '-', method: mode });
  }
  return problems;
};

const generateArithmetic = (
  range: Range,
  mode: Mode,
  regroup: RegroupOption
): Problem[] => {
  const problems: Problem[] = [];
  const isVertical = ['vertical-add', 'vertical-sub', 'vertical-mixed'].includes(mode);
  const maxProblems = isVertical ? 25 : 20;

  if (range === '20-regroup') {
    const groupSize = Math.floor(maxProblems / 5);
    const groups: Record<number, { num1: number; num2: number }[]> = {
      5: [], 6: [], 7: [], 8: [], 9: []
    };
    
    for (let num1 = 5; num1 <= 9; num1++) {
      for (let num2 = 1; num2 <= 9; num2++) {
        const sum = num1 + num2;
        if (sum >= 11 && sum <= 18) {
          groups[num1].push({ num1, num2 });
        }
      }
    }
    
    const selectedPairs: { num1: number; num2: number }[] = [];
    for (const d of [5, 6, 7, 8, 9]) {
      const shuffledGroup = shuffle(groups[d]);
      for (let i = 0; i < groupSize; i++) {
        selectedPairs.push(shuffledGroup[i % shuffledGroup.length]);
      }
    }
    
    const mixedPairs = shuffle(selectedPairs);
    for (let i = 0; i < mixedPairs.length; i++) {
      let { num1, num2 } = mixedPairs[i];
      if (Math.random() > 0.5) {
        const temp = num1;
        num1 = num2;
        num2 = temp;
      }
      
      let op: '+' | '-' = '+';
      if (mode.includes('-add')) {
        op = '+';
      } else if (mode.includes('-sub')) {
        op = '-';
      } else {
        op = Math.random() > 0.5 ? '+' : '-';
      }
      
      if (op === '+') {
        problems.push({ id: i, type: 'arithmetic', num1, num2, operator: '+' });
      } else {
        const sum = num1 + num2;
        problems.push({ id: i, type: 'arithmetic', num1: sum, num2: num2, operator: '-' });
      }
    }
    return problems;
  }

  let min = 11, max = 20;
  if (range === '1-10') { min = 1; max = 10; }
  else if (range === '21-30') { min = 21; max = 30; }
  else if (range === '10-50') { min = 10; max = 50; }
  else if (range === '10-100') { min = 10; max = 100; }

  let addOneCount = 0;
  let subOneCount = 0;

  const candidates: { num1: number; num2: number; operator: '+' | '-' }[] = [];
  const includeAdd = mode.includes('-add') || mode.includes('-mixed');
  const includeSub = mode.includes('-sub') || mode.includes('-mixed');

  if (includeAdd) {
    for (let num1 = 1; num1 <= max - 1; num1++) {
      for (let num2 = 1; num2 <= max - num1; num2++) {
        if (num1 + num2 < min) continue;
        const isCarry = (num1 % 10) + (num2 % 10) > 9;
        if (regroup === 'none' && isCarry) continue;
        if (regroup === 'only' && !isCarry) continue;
        candidates.push({ num1, num2, operator: '+' });
      }
    }
  }

  if (includeSub) {
    for (let num1 = min; num1 <= max; num1++) {
      for (let num2 = 1; num2 < num1; num2++) {
        const isBorrow = (num1 % 10) < (num2 % 10);
        if (regroup === 'none' && isBorrow) continue;
        if (regroup === 'only' && !isBorrow) continue;
        candidates.push({ num1, num2, operator: '-' });
      }
    }
  }

  const shuffled = shuffle(candidates);
  if (shuffled.length === 0) return [];
  let index = 0;
  let reshuffles = 0;
  while (problems.length < maxProblems && reshuffles < 10) {
    if (index >= shuffled.length) {
      shuffle(shuffled);
      index = 0;
      reshuffles++;
    }
    const { num1, num2, operator } = shuffled[index++];
    const isAddOne = operator === '+' && (num1 === 1 || num2 === 1);
    const isSubOne = operator === '-' && num2 === 1;
    if (isAddOne && addOneCount >= 1) continue;
    if (isSubOne && subOneCount >= 1) continue;
    problems.push({ id: problems.length, type: 'arithmetic', num1, num2, operator });
    if (isAddOne) addOneCount++;
    if (isSubOne) subOneCount++;
  }
  return problems;
};

// Strategy Registry Table
const GENERATOR_STRATEGIES: Record<Mode, (
  range: Range,
  regroup: RegroupOption,
  makeTenLeft: string,
  bondUseType: 'practice' | 'study',
  bondNumber: number | '2-10',
  isBlankTemplate: boolean
) => Problem[]> = {
  'number-bonds': (range, regroup, makeTenLeft, bondUseType, bondNumber, isBlankTemplate) =>
    generateNumberBonds(range, regroup, makeTenLeft, bondUseType, bondNumber, isBlankTemplate),
  'make-ten': (range, regroup, makeTenLeft) =>
    generateMakeTen(range, regroup, makeTenLeft),
  'break-ten': () => generateBreakTenOrFlatTen('break-ten'),
  'flat-ten': () => generateBreakTenOrFlatTen('flat-ten'),
  'vertical-add': (range, regroup) => generateArithmetic(range, 'vertical-add', regroup),
  'vertical-sub': (range, regroup) => generateArithmetic(range, 'vertical-sub', regroup),
  'vertical-mixed': (range, regroup) => generateArithmetic(range, 'vertical-mixed', regroup),
  'horizontal-add': (range, regroup) => generateArithmetic(range, 'horizontal-add', regroup),
  'horizontal-sub': (range, regroup) => generateArithmetic(range, 'horizontal-sub', regroup),
  'horizontal-mixed': (range, regroup) => generateArithmetic(range, 'horizontal-mixed', regroup),
};

export const generateProblems = (
  range: Range, 
  mode: Mode, 
  regroup: RegroupOption = 'mixed',
  makeTenLeft: string = 'mixed',
  bondUseType: 'practice' | 'study' = 'practice',
  bondNumber: number | '2-10' = 5,
  isBlankTemplate: boolean = false
): Problem[] => {
  const strategy = GENERATOR_STRATEGIES[mode];
  return strategy ? strategy(range, regroup, makeTenLeft, bondUseType, bondNumber, isBlankTemplate) : [];
};
