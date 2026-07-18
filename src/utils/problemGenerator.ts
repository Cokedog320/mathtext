import { Mode, Range, RegroupOption, Problem, Language, LowerOperandDigits } from '../types';

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
  regroup: RegroupOption,
  lowerOperandDigits: LowerOperandDigits
): Problem[] => {
  const isVertical = ['vertical-add', 'vertical-sub', 'vertical-mixed'].includes(mode);
  const horizontalCounts: Record<Range, number> = {
    '1-10': 20, '1-20': 40, '1-30': 60, '1-50': 60, '1-100': 60,
  };
  const maxProblems = isVertical ? 20 : horizontalCounts[range];
  const practiceBands: Record<Range, [number, number]> = {
    '1-10': [2, 10], '1-20': [11, 20], '1-30': [21, 30],
    '1-50': [31, 50], '1-100': [51, 100],
  };
  const [minTarget, maxTarget] = practiceBands[range];

  const includeAdd = mode.includes('-add') || mode.includes('-mixed');
  const includeSub = mode.includes('-sub') || mode.includes('-mixed');

  type Candidate = {
    num1: number;
    num2: number;
    operator: '+' | '-';
    lowerDigits: 'one' | 'two';
    needsRegroup: boolean;
  };
  const candidates: Candidate[] = [];

  if (includeAdd) {
    for (let S = minTarget; S <= maxTarget; S++) {
      for (let num1 = 1; num1 < S; num1++) {
        const num2 = S - num1;
        if (isVertical && (num1 < 10 || num1 > 99)) continue;
        const isCarry = (num1 % 10) + (num2 % 10) >= 10;
        if (regroup === 'none' && isCarry) continue;
        if (regroup === 'only' && !isCarry) continue;
        candidates.push({
          num1, num2, operator: '+', needsRegroup: isCarry,
          lowerDigits: num2 < 10 ? 'one' : 'two',
        });
      }
    }
  }

  if (includeSub) {
    for (let M = minTarget; M <= maxTarget; M++) {
      for (let num2 = 1; num2 < M; num2++) {
        if (isVertical && (M < 10 || M > 99)) continue;
        const isBorrow = (M % 10) < (num2 % 10);
        if (regroup === 'none' && isBorrow) continue;
        if (regroup === 'only' && !isBorrow) continue;
        candidates.push({
          num1: M, num2, operator: '-', needsRegroup: isBorrow,
          lowerDigits: num2 < 10 ? 'one' : 'two',
        });
      }
    }
  }

  const chosen: Candidate[] = [];
  const used = new Set<string>();
  for (let i = 0; i < maxProblems; i++) {
    const desiredOperator: '+' | '-' | undefined = includeAdd && includeSub
      ? (i % 2 === 0 ? '+' : '-')
      : (includeAdd ? '+' : '-');
    const desiredDigits: 'one' | 'two' | undefined = !isVertical
      ? undefined
      : lowerOperandDigits === 'mixed'
        ? (Math.floor(i / (includeAdd && includeSub ? 2 : 1)) % 2 === 0 ? 'one' : 'two')
        : lowerOperandDigits;
    const desiredRegroup = regroup === 'mixed' ? Math.floor(i / 2) % 2 === 0 : regroup === 'only';

    const filters = [
      (c: Candidate) => c.operator === desiredOperator && (!desiredDigits || c.lowerDigits === desiredDigits) && c.needsRegroup === desiredRegroup,
      (c: Candidate) => c.operator === desiredOperator && (!desiredDigits || c.lowerDigits === desiredDigits),
      ...(lowerOperandDigits === 'mixed'
        ? [
            (c: Candidate) => c.operator === desiredOperator && c.needsRegroup === desiredRegroup,
            (c: Candidate) => c.operator === desiredOperator,
          ]
        : []),
    ];
    let pool: Candidate[] = [];
    for (const filter of filters) {
      pool = candidates.filter(filter);
      if (pool.length > 0) break;
    }
    if (pool.length === 0) break;

    const unused = pool.filter(c => !used.has(`${c.num1}${c.operator}${c.num2}`));
    const preferred = unused.filter(c => c.num2 !== 1 && (c.operator === '-' || c.num1 !== 1));
    const selectionPool = preferred.length > 0 ? preferred : (unused.length > 0 ? unused : pool);
    const selected = selectionPool[Math.floor(Math.random() * selectionPool.length)];
    used.add(`${selected.num1}${selected.operator}${selected.num2}`);
    chosen.push(selected);
  }

  return shuffle(chosen).map((candidate, id) => ({
    id, type: 'arithmetic', num1: candidate.num1, num2: candidate.num2, operator: candidate.operator,
  }));
};

// Strategy Registry Table
const GENERATOR_STRATEGIES: Record<Mode, (
  range: Range,
  regroup: RegroupOption,
  makeTenLeft: string,
  bondUseType: 'practice' | 'study',
  bondNumber: number | '2-10',
  isBlankTemplate: boolean,
  lowerOperandDigits: LowerOperandDigits
) => Problem[]> = {
  'number-bonds': (range, regroup, makeTenLeft, bondUseType, bondNumber, isBlankTemplate) =>
    generateNumberBonds(range, regroup, makeTenLeft, bondUseType, bondNumber, isBlankTemplate),
  'make-ten': (range, regroup, makeTenLeft) =>
    generateMakeTen(range, regroup, makeTenLeft),
  'break-ten': () => generateBreakTenOrFlatTen('break-ten'),
  'flat-ten': () => generateBreakTenOrFlatTen('flat-ten'),
  'vertical-add': (range, regroup, _mtl, _but, _bn, _ibt, lowerDigits) => generateArithmetic(range, 'vertical-add', regroup, lowerDigits),
  'vertical-sub': (range, regroup, _mtl, _but, _bn, _ibt, lowerDigits) => generateArithmetic(range, 'vertical-sub', regroup, lowerDigits),
  'vertical-mixed': (range, regroup, _mtl, _but, _bn, _ibt, lowerDigits) => generateArithmetic(range, 'vertical-mixed', regroup, lowerDigits),
  'horizontal-add': (range, regroup) => generateArithmetic(range, 'horizontal-add', regroup, 'mixed'),
  'horizontal-sub': (range, regroup) => generateArithmetic(range, 'horizontal-sub', regroup, 'mixed'),
  'horizontal-mixed': (range, regroup) => generateArithmetic(range, 'horizontal-mixed', regroup, 'mixed'),
};

export const generateProblems = (
  range: Range, 
  mode: Mode, 
  regroup: RegroupOption = 'mixed',
  makeTenLeft: string = 'mixed',
  bondUseType: 'practice' | 'study' = 'practice',
  bondNumber: number | '2-10' = 5,
  isBlankTemplate: boolean = false,
  lowerOperandDigits: LowerOperandDigits = 'mixed'
): Problem[] => {
  const strategy = GENERATOR_STRATEGIES[mode];
  return strategy ? strategy(range, regroup, makeTenLeft, bondUseType, bondNumber, isBlankTemplate, lowerOperandDigits) : [];
};
