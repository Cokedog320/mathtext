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
  const rangeMap: Record<Range, {zh: string, en: string}> = {
    '1-10': {zh: '10以内', en: 'Within 10'},
    '1-20': {zh: '20以内', en: 'Within 20'},
    '1-30': {zh: '30以内', en: 'Within 30'},
    '1-50': {zh: '50以内', en: 'Within 50'},
    '1-100': {zh: '100以内', en: 'Within 100'}
  };
  const rZh = rangeMap[range].zh;
  const rEn = rangeMap[range].en;

  let regroupZh = '';
  let regroupEn = '';
  if (range !== '1-10') {
    if (regroup === 'none') {
      regroupZh = mode.includes('-add') ? '不进位' : (mode.includes('-sub') ? '不退位' : '无进退位');
      regroupEn = mode.includes('-add') ? 'No Carry' : (mode.includes('-sub') ? 'No Borrow' : 'No Regroup');
    } else if (regroup === 'only') {
      regroupZh = mode.includes('-add') ? '进位' : (mode.includes('-sub') ? '退位' : '进退位');
      regroupEn = mode.includes('-add') ? 'Carrying' : (mode.includes('-sub') ? 'Borrowing' : 'Regrouping');
    }
  }

  const baseMapZh: Record<string, string> = {
    'vertical-add': '加法',
    'vertical-sub': '减法',
    'vertical-mixed': '加减法',
    'horizontal-add': '加法',
    'horizontal-sub': '减法',
    'horizontal-mixed': '加减混合'
  };
  const baseMapEn: Record<string, string> = {
    'vertical-add': 'Addition',
    'vertical-sub': 'Subtraction',
    'vertical-mixed': 'Arithmetic',
    'horizontal-add': 'Addition',
    'horizontal-sub': 'Subtraction',
    'horizontal-mixed': 'Mixed Arithmetic'
  };

  const isArithmetic = Object.keys(baseMapZh).includes(mode);
  if (isArithmetic) {
    if (language === 'zh') {
      return `${rZh}${regroupZh}${baseMapZh[mode]}`;
    } else {
      return regroupEn ? `${regroupEn} ${baseMapEn[mode]} ${rEn}` : `${baseMapEn[mode]} ${rEn}`;
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

  let minTarget = 11, maxTarget = 20;
  if (range === '1-10') { minTarget = 2; maxTarget = 10; }
  else if (range === '1-20') { minTarget = 11; maxTarget = 20; }
  else if (range === '1-30') { minTarget = 11; maxTarget = 30; }
  else if (range === '1-50') { minTarget = 11; maxTarget = 50; }
  else if (range === '1-100') { minTarget = 11; maxTarget = 100; }

  const includeAdd = mode.includes('-add') || mode.includes('-mixed');
  const includeSub = mode.includes('-sub') || mode.includes('-mixed');

  const addGroups: Record<number, {num1: number; num2: number; operator: '+'}[]> = {};
  const subGroups: Record<number, {num1: number; num2: number; operator: '-'}[]> = {};

  if (includeAdd) {
    for (let S = minTarget; S <= maxTarget; S++) {
      const pairs = [];
      for (let num1 = 1; num1 < S; num1++) {
        const num2 = S - num1;
        const isCarry = (num1 % 10) + (num2 % 10) >= 10;
        if (regroup === 'none' && isCarry) continue;
        if (regroup === 'only' && !isCarry) continue;
        pairs.push({ num1, num2, operator: '+' as const });
      }
      if (pairs.length > 0) {
        addGroups[S] = shuffle(pairs);
      }
    }
  }

  if (includeSub) {
    for (let M = minTarget; M <= maxTarget; M++) {
      const pairs = [];
      for (let num2 = 1; num2 < M; num2++) {
        const isBorrow = (M % 10) < (num2 % 10);
        if (regroup === 'none' && isBorrow) continue;
        if (regroup === 'only' && !isBorrow) continue;
        pairs.push({ num1: M, num2, operator: '-' as const });
      }
      if (pairs.length > 0) {
        subGroups[M] = shuffle(pairs);
      }
    }
  }

  let addOneCount = 0;
  let subOneCount = 0;

  for (let i = 0; i < maxProblems; i++) {
    const addAvailable = Object.keys(addGroups).filter(k => addGroups[Number(k)].length > 0);
    const subAvailable = Object.keys(subGroups).filter(k => subGroups[Number(k)].length > 0);

    if (addAvailable.length === 0 && subAvailable.length === 0) break;

    let pickAdd = false;
    if (addAvailable.length > 0 && subAvailable.length > 0) {
      pickAdd = (i % 2 === 0);
    } else if (addAvailable.length > 0) {
      pickAdd = true;
    } else {
      pickAdd = false;
    }

    if (pickAdd) {
      const target = Number(addAvailable[Math.floor(Math.random() * addAvailable.length)]);
      const group = addGroups[target];
      
      let pairIndex = group.findIndex(p => p.num1 !== 1 && p.num2 !== 1);
      if (addOneCount >= 1 && pairIndex !== -1) {
        // filter +1 out
      } else {
        pairIndex = 0;
      }
      
      const pair = group.splice(pairIndex, 1)[0];
      if (pair.num1 === 1 || pair.num2 === 1) addOneCount++;
      problems.push({ id: i, type: 'arithmetic', num1: pair.num1, num2: pair.num2, operator: '+' });
    } else {
      const target = Number(subAvailable[Math.floor(Math.random() * subAvailable.length)]);
      const group = subGroups[target];
      
      let pairIndex = group.findIndex(p => p.num2 !== 1);
      if (subOneCount >= 1 && pairIndex !== -1) {
        // filter -1 out
      } else {
        pairIndex = 0;
      }
      
      const pair = group.splice(pairIndex, 1)[0];
      if (pair.num2 === 1) subOneCount++;
      problems.push({ id: i, type: 'arithmetic', num1: pair.num1, num2: pair.num2, operator: '-' });
    }
  }

  return shuffle(problems).map((p, i) => ({ ...p, id: i }));
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
