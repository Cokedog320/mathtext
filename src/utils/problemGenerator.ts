import { Mode, Range, RegroupOption, Problem, Language, LowerOperandDigits } from '../types';

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const PRACTICE_BANDS: Record<Range, [number, number]> = {
  '1-10': [2, 10],
  '1-20': [11, 20],
  '1-30': [21, 30],
  '1-50': [31, 50],
  '1-100': [51, 100],
};

const HORIZONTAL_PROBLEM_COUNTS: Record<Range, number> = {
  '1-10': 20,
  '1-20': 24,
  '1-30': 60,
  '1-50': 30,
  '1-100': 60,
};

const CHAINED_PROBLEM_COUNT = 20;

export const getRequestedProblemCount = (
  range: Range,
  mode: Mode,
  bondNumber: number | '2-10' = 5,
  isBlankTemplate = false
): number => {
  if (mode === 'number-bonds') {
    return isBlankTemplate || bondNumber === '2-10' ? 9 : bondNumber - 1;
  }
  if (mode.startsWith('horizontal-chain-')) return CHAINED_PROBLEM_COUNT;
  if (mode.startsWith('vertical-')) return 20;
  if (mode.startsWith('horizontal-')) return HORIZONTAL_PROBLEM_COUNTS[range];
  return 20;
};

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
    'horizontal-mixed': '加减混合',
    'horizontal-chain-add': '连续加法',
    'horizontal-chain-sub': '连续减法',
    'horizontal-chain-mixed': '连续加减混合',
  };
  const baseMapEn: Record<string, string> = {
    'vertical-add': 'Addition',
    'vertical-sub': 'Subtraction',
    'vertical-mixed': 'Arithmetic',
    'horizontal-add': 'Addition',
    'horizontal-sub': 'Subtraction',
    'horizontal-mixed': 'Mixed Arithmetic',
    'horizontal-chain-add': 'Chained Addition',
    'horizontal-chain-sub': 'Chained Subtraction',
    'horizontal-chain-mixed': 'Chained Mixed Arithmetic',
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

const takeBalancedCandidates = <T>(
  candidates: T[],
  limit: number,
  groupKey: (candidate: T) => string | number
): T[] => {
  const grouped = new Map<string | number, T[]>();
  for (const candidate of candidates) {
    const key = groupKey(candidate);
    const group = grouped.get(key) ?? [];
    group.push(candidate);
    grouped.set(key, group);
  }

  const queues = shuffle([...grouped.values()]).map(group => shuffle(group));
  const selected: T[] = [];
  while (selected.length < limit) {
    let addedInRound = false;
    for (const queue of queues) {
      const candidate = queue.pop();
      if (candidate === undefined) continue;
      selected.push(candidate);
      addedInRound = true;
      if (selected.length === limit) break;
    }
    if (!addedInRound) break;
  }

  return shuffle(selected);
};

type BalanceKey = string | number | boolean;

const takeBalancedAcrossDimensions = <T>(
  candidates: T[],
  limit: number,
  primaryDimensions: Array<(candidate: T) => BalanceKey>,
  secondaryDimensions: Array<(candidate: T) => BalanceKey> = [],
  priorSelections: T[] = []
): T[] => {
  const dimensions = [...primaryDimensions, ...secondaryDimensions];
  type CandidateGroup = { values: BalanceKey[]; candidates: T[] };
  const groups = new Map<string, CandidateGroup>();
  for (const candidate of candidates) {
    const values = dimensions.map(dimension => dimension(candidate));
    const key = JSON.stringify(values);
    const group = groups.get(key) ?? { values, candidates: [] };
    group.candidates.push(candidate);
    groups.set(key, group);
  }

  const distinctValueCounts = dimensions.map((_, dimensionIndex) => {
    const distinctValues = new Set(
      [
        ...[...groups.values()].map(group => group.values[dimensionIndex]),
        ...priorSelections.map(candidate => dimensions[dimensionIndex](candidate)),
      ]
    ).size;
    return distinctValues;
  });
  const totalLimit = limit + priorSelections.length;
  const idealCounts = distinctValueCounts.map(distinctValues =>
    Math.max(1, totalLimit / distinctValues)
  );
  const primaryCaps = distinctValueCounts
    .slice(0, primaryDimensions.length)
    .map(distinctValues => Math.max(1, Math.ceil(totalLimit / distinctValues)));
  const compareScores = (left: number[], right: number[]): number => {
    for (let index = 0; index < left.length; index++) {
      if (left[index] !== right[index]) return left[index] - right[index];
    }
    return 0;
  };

  const selectAtCap = (capOffset: number): T[] => {
    const workingGroups = [...groups.values()].map(group => ({
      values: group.values,
      candidates: [...group.candidates],
    }));
    const counts = dimensions.map(() => new Map<BalanceKey, number>());
    for (const priorSelection of priorSelections) {
      dimensions.forEach((dimension, index) => {
        const value = dimension(priorSelection);
        counts[index].set(value, (counts[index].get(value) ?? 0) + 1);
      });
    }
    const selected: T[] = [];

    while (selected.length < limit) {
      const eligibleGroups = workingGroups.filter(group =>
        group.candidates.length > 0 &&
        group.values.slice(0, primaryDimensions.length).every((value, index) =>
          (counts[index].get(value) ?? 0) < primaryCaps[index] + capOffset
        )
      );
      if (eligibleGroups.length === 0) break;

      const availability = primaryDimensions.map(() => new Map<BalanceKey, number>());
      for (const group of eligibleGroups) {
        group.values.slice(0, primaryDimensions.length).forEach((value, index) => {
          availability[index].set(value, (availability[index].get(value) ?? 0) + 1);
        });
      }

      let bestScore: number[] | null = null;
      let bestGroups: CandidateGroup[] = [];
      for (const group of eligibleGroups) {
        const valueAvailability = group.values
          .slice(0, primaryDimensions.length)
          .map((value, index) => availability[index].get(value) ?? 0);
        const projectedLoads = group.values.map((value, index) =>
          ((counts[index].get(value) ?? 0) + 1) / idealCounts[index]
        );
        const primaryLoads = projectedLoads.slice(0, primaryDimensions.length);
        const secondaryLoads = projectedLoads.slice(primaryDimensions.length);
        const score = [
          secondaryLoads.length > 0 ? Math.max(...secondaryLoads) : 0,
          secondaryLoads.reduce((sum, load) => sum + load, 0),
          Math.min(...valueAvailability),
          valueAvailability.reduce((sum, value) => sum + value, 0),
          Math.max(...primaryLoads),
          primaryLoads.reduce((sum, load) => sum + load, 0),
        ];
        const comparison = bestScore === null ? -1 : compareScores(score, bestScore);
        if (comparison < 0) {
          bestScore = score;
          bestGroups = [group];
        } else if (comparison === 0) {
          bestGroups.push(group);
        }
      }

      const group = bestGroups[Math.floor(Math.random() * bestGroups.length)];
      const candidateIndex = Math.floor(Math.random() * group.candidates.length);
      const [candidate] = group.candidates.splice(candidateIndex, 1);
      selected.push(candidate);
      group.values.forEach((value, index) => {
        counts[index].set(value, (counts[index].get(value) ?? 0) + 1);
      });
    }

    return selected;
  };

  for (let capOffset = 0; capOffset <= limit; capOffset++) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const selected = selectAtCap(capOffset);
      if (selected.length === limit || capOffset === limit) return shuffle(selected);
    }
  }

  return [];
};

const generateMakeTen = (
  range: Range,
  regroup: RegroupOption,
  makeTenLeft: string
): Problem[] => {
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

  return takeBalancedCandidates(candidates, 20, candidate => candidate.a)
    .map(({ a, b }, id) => ({ id, type: 'method', num1: a, num2: b, operator: '+', method: 'make-ten' }));
};

const generateBreakTenOrFlatTen = (
  mode: 'break-ten' | 'flat-ten'
): Problem[] => {
  const candidates: { a: number; b: number }[] = [];
  for (let a = 11; a <= 18; a++) {
    for (let b = Math.max(1, a - 9); b <= Math.min(9, a - 1); b++) {
      candidates.push({ a, b });
    }
  }

  return takeBalancedCandidates(candidates, 20, candidate => candidate.a)
    .map(({ a, b }, id) => ({ id, type: 'method', num1: a, num2: b, operator: '-', method: mode }));
};

type ArithmeticOperator = '+' | '-';
type ChainedMode = Extract<Mode, 'horizontal-chain-add' | 'horizontal-chain-sub' | 'horizontal-chain-mixed'>;
type ChainedCandidate = {
  operands: [number, number, number];
  operators: [ArithmeticOperator, ArithmeticOperator];
  intermediateResult: number;
  result: number;
  needsRegroup: boolean;
};

const calculate = (left: number, operator: ArithmeticOperator, right: number): number =>
  operator === '+' ? left + right : left - right;

const additionRequiresRegroup = (left: number, right: number): boolean => {
  let remainingLeft = left;
  let remainingRight = right;
  while (remainingLeft > 0 || remainingRight > 0) {
    if ((remainingLeft % 10) + (remainingRight % 10) >= 10) return true;
    remainingLeft = Math.floor(remainingLeft / 10);
    remainingRight = Math.floor(remainingRight / 10);
  }
  return false;
};

const subtractionRequiresRegroup = (left: number, right: number): boolean => {
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

const matchesRegroup = (needsRegroup: boolean, regroup: RegroupOption): boolean =>
  regroup === 'mixed' || (regroup === 'only' ? needsRegroup : !needsRegroup);

const buildChainedCandidates = (
  range: Range,
  mode: ChainedMode,
  regroup: RegroupOption
): ChainedCandidate[] => {
  const [minTarget, maxTarget] = PRACTICE_BANDS[range];
  const operatorPairs: Record<ChainedMode, [ArithmeticOperator, ArithmeticOperator]> = {
    'horizontal-chain-add': ['+', '+'],
    'horizontal-chain-sub': ['-', '-'],
    'horizontal-chain-mixed': ['+', '-'],
  };
  const addThenSubtract = operatorPairs['horizontal-chain-mixed'];
  const subtractThenAdd: [ArithmeticOperator, ArithmeticOperator] = ['-', '+'];
  const retainedPerBalanceGroup = range === '1-10' ? Number.POSITIVE_INFINITY : 5;
  type CandidateReservoir = { seen: number; candidates: ChainedCandidate[] };
  const reservoirs = new Map<number, CandidateReservoir>();
  const append = (
    first: number,
    second: number,
    third: number,
    operators: [ArithmeticOperator, ArithmeticOperator]
  ) => {
    const intermediateResult = calculate(first, operators[0], second);
    const result = calculate(intermediateResult, operators[1], third);
    const needsRegroup =
      requiresRegroup(first, operators[0], second) ||
      requiresRegroup(intermediateResult, operators[1], third);
    if (!matchesRegroup(needsRegroup, regroup)) return;

    const pattern = operators[0] === '+' ? 0 : 1;
    const key = (((pattern * 2 + Number(needsRegroup)) * 101 + first) * 101) + result;
    const reservoir = reservoirs.get(key) ?? { seen: 0, candidates: [] };
    reservoir.seen += 1;
    const retainedIndex = reservoir.candidates.length < retainedPerBalanceGroup
      ? reservoir.candidates.length
      : Math.floor(Math.random() * reservoir.seen);
    if (retainedIndex >= retainedPerBalanceGroup) return;

    const candidate: ChainedCandidate = {
      operands: [first, second, third],
      operators,
      intermediateResult,
      result,
      needsRegroup,
    };
    if (reservoir.candidates.length < retainedPerBalanceGroup) {
      reservoir.candidates.push(candidate);
    } else {
      reservoir.candidates[retainedIndex] = candidate;
    }
    reservoirs.set(key, reservoir);
  };

  if (mode === 'horizontal-chain-add') {
    for (let target = minTarget; target <= maxTarget; target++) {
      for (let first = 1; first <= target - 2; first++) {
        for (let second = 1; second <= target - first - 1; second++) {
          append(first, second, target - first - second, operatorPairs[mode]);
        }
      }
    }
  } else if (mode === 'horizontal-chain-sub') {
    for (let first = minTarget; first <= maxTarget; first++) {
      for (let second = 1; second <= first - 2; second++) {
        const intermediate = first - second;
        for (let third = 1; third < intermediate; third++) {
          append(first, second, third, operatorPairs[mode]);
        }
      }
    }
  } else {
    for (let intermediate = minTarget; intermediate <= maxTarget; intermediate++) {
      for (let first = 1; first < intermediate; first++) {
        const second = intermediate - first;
        for (let third = 1; third < intermediate; third++) {
          append(first, second, third, addThenSubtract);
        }
      }
    }
    for (let first = minTarget; first <= maxTarget; first++) {
      for (let second = 1; second < first; second++) {
        const intermediate = first - second;
        for (let third = 1; intermediate + third <= maxTarget; third++) {
          append(first, second, third, subtractThenAdd);
        }
      }
    }
  }

  return [...reservoirs.values()].flatMap(reservoir => reservoir.candidates);
};

const selectWithinTenChainedCandidates = (
  candidates: ChainedCandidate[],
  limit: number
): ChainedCandidate[] => {
  const usesOne = (candidate: ChainedCandidate): boolean =>
    candidate.operands[1] === 1 || candidate.operands[2] === 1;
  const operatorKey = (candidate: ChainedCandidate): string => candidate.operators.join('');
  const operatorKinds = [...new Set(candidates.map(operatorKey))];
  const operatorTarget = limit / operatorKinds.length;
  const primaryDistributionCap = 10;
  const laterOperandCap = 9;
  const increment = <K>(counts: Map<K, number>, key: K): void => {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };
  const compareScores = (left: number[], right: number[]): number => {
    for (let index = 0; index < left.length; index++) {
      if (left[index] !== right[index]) return left[index] - right[index];
    }
    return 0;
  };

  for (let attempt = 0; attempt < 200; attempt++) {
    const ordered = shuffle(candidates);
    const selected: ChainedCandidate[] = [];
    const starts = new Map<number, number>();
    const results = new Map<number, number>();
    const seconds = new Map<number, number>();
    const thirds = new Map<number, number>();
    const operators = new Map<string, number>();
    let oneProblems = 0;

    while (selected.length < limit) {
      const slotsRemaining = limit - selected.length;
      const oneProblemsNeeded = 2 - oneProblems;
      let bestScore: number[] | null = null;
      let bestCandidates: ChainedCandidate[] = [];

      for (const candidate of ordered) {
        if (selected.includes(candidate)) continue;
        const [first, second, third] = candidate.operands;
        const kind = operatorKey(candidate);
        const oneProblem = usesOne(candidate);
        const startCap = first === 10 ? 3 : primaryDistributionCap;
        const resultCap = candidate.result === 10 ? 3 : primaryDistributionCap;

        if (oneProblem && oneProblems >= 2) continue;
        if (!oneProblem && slotsRemaining === oneProblemsNeeded) continue;
        if ((operators.get(kind) ?? 0) >= operatorTarget) continue;
        if ((starts.get(first) ?? 0) >= startCap) continue;
        if ((results.get(candidate.result) ?? 0) >= resultCap) continue;
        if ((seconds.get(second) ?? 0) >= laterOperandCap) continue;
        if ((thirds.get(third) ?? 0) >= laterOperandCap) continue;

        const score = [
          ((operators.get(kind) ?? 0) + 1) / operatorTarget,
          ((oneProblem ? oneProblems : selected.length - oneProblems) + 1) /
            (oneProblem ? 2 : limit - 2),
          Math.max(
            ((starts.get(first) ?? 0) + 1) / 4,
            ((results.get(candidate.result) ?? 0) + 1) / 4
          ),
          ((starts.get(first) ?? 0) + 1) / 4 +
            ((results.get(candidate.result) ?? 0) + 1) / 4,
          Math.max(
            ((seconds.get(second) ?? 0) + 1) / laterOperandCap,
            ((thirds.get(third) ?? 0) + 1) / laterOperandCap
          ),
          (starts.get(first) ?? 0) +
            (results.get(candidate.result) ?? 0) +
            (seconds.get(second) ?? 0) +
            (thirds.get(third) ?? 0),
        ];
        const comparison = bestScore === null ? -1 : compareScores(score, bestScore);
        if (comparison < 0) {
          bestScore = score;
          bestCandidates = [candidate];
        } else if (comparison === 0) {
          bestCandidates.push(candidate);
        }
      }

      if (bestCandidates.length === 0) break;
      const candidate = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
      const [first, second, third] = candidate.operands;
      selected.push(candidate);
      increment(starts, first);
      increment(results, candidate.result);
      increment(seconds, second);
      increment(thirds, third);
      increment(operators, operatorKey(candidate));
      if (usesOne(candidate)) oneProblems += 1;
    }

    if (selected.length === limit && oneProblems === 2) {
      return shuffle(selected);
    }
  }

  return [];
};

const selectChainedCandidates = (
  candidates: ChainedCandidate[],
  limit: number,
  regroup: RegroupOption
): ChainedCandidate[] => {
  const usesOne = (candidate: ChainedCandidate): boolean =>
    candidate.operands[1] === 1 || candidate.operands[2] === 1;
  const usesSimplePattern = (candidate: ChainedCandidate): boolean =>
    [1, 10].includes(candidate.operands[1]) && [1, 10].includes(candidate.operands[2]);
  const operatorKey = (candidate: ChainedCandidate): string => candidate.operators.join('');
  const operatorKinds = [...new Set(candidates.map(operatorKey))];
  const operatorTargets = new Map(
    operatorKinds.map(kind => [kind, limit / operatorKinds.length])
  );
  const primaryCapacity = (group: ChainedCandidate[]): number => Math.min(
    new Set(group.map(candidate => candidate.operands[0])).size * 3,
    new Set(group.map(candidate => candidate.result)).size * 3
  );
  const regroupingCandidates = candidates.filter(candidate => candidate.needsRegroup);
  const nonRegroupingCandidates = candidates.filter(candidate => !candidate.needsRegroup);
  const regroupingTarget = regroup === 'mixed'
    ? Math.max(
        limit - primaryCapacity(nonRegroupingCandidates),
        Math.min(limit / 2, primaryCapacity(regroupingCandidates))
      )
    : regroup === 'only' ? limit : 0;
  const regroupTargets = new Map<boolean, number>([
    [true, regroupingTarget],
    [false, limit - regroupingTarget],
  ]);
  const increment = <K>(counts: Map<K, number>, key: K): void => {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };
  const compareScores = (left: number[], right: number[]): number => {
    for (let index = 0; index < left.length; index++) {
      if (left[index] !== right[index]) return left[index] - right[index];
    }
    return 0;
  };

  const isWithinTen = candidates.every(candidate =>
    candidate.operands[0] <= 10 && candidate.result <= 10
  );
  if (isWithinTen) {
    return selectWithinTenChainedCandidates(candidates, limit);
  }

  const primaryCaps = [3, 4];

  for (const primaryCap of primaryCaps) {
    for (let attempt = 0; attempt < 10; attempt++) {
      const shuffled = shuffle(candidates);
      const offset = shuffled.length === 0 ? 0 : (attempt * 97) % shuffled.length;
      const ordered = [...shuffled.slice(offset), ...shuffled.slice(0, offset)];
      const selected: ChainedCandidate[] = [];
      const starts = new Map<number, number>();
      const results = new Map<number, number>();
      const seconds = new Map<number, number>();
      const thirds = new Map<number, number>();
      const operators = new Map<string, number>();
      const regroupKinds = new Map<boolean, number>();
      const oneKinds = new Map<boolean, number>();
      let simplePatterns = 0;

      while (selected.length < limit) {
        let bestScore: number[] | null = null;
        let bestCandidates: ChainedCandidate[] = [];
        for (const candidate of ordered) {
          if (selected.includes(candidate)) continue;
          const [first, second, third] = candidate.operands;
          const kind = operatorKey(candidate);
          const oneKind = usesOne(candidate);
          const simplePattern = usesSimplePattern(candidate);
          const operatorTarget = operatorTargets.get(kind) ?? 0;
          const regroupTarget = regroupTargets.get(candidate.needsRegroup) ?? 0;
          const oneTarget = oneKind ? 2 : limit - 2;
          if ((starts.get(first) ?? 0) >= primaryCap) continue;
          if ((results.get(candidate.result) ?? 0) >= primaryCap) continue;
          if ((seconds.get(second) ?? 0) >= 4) continue;
          if ((thirds.get(third) ?? 0) >= 4) continue;
          if ((operators.get(kind) ?? 0) >= operatorTarget) continue;
          if ((regroupKinds.get(candidate.needsRegroup) ?? 0) >= regroupTarget) continue;
          if ((oneKinds.get(oneKind) ?? 0) >= oneTarget) continue;
          if (simplePattern && simplePatterns >= 3) continue;

          const quotaLoads = [
            ((operators.get(kind) ?? 0) + 1) / operatorTarget,
            ((regroupKinds.get(candidate.needsRegroup) ?? 0) + 1) / regroupTarget,
            ((oneKinds.get(oneKind) ?? 0) + 1) / oneTarget,
          ];
          const distributionLoads = [
            ((starts.get(first) ?? 0) + 1) / primaryCap,
            ((results.get(candidate.result) ?? 0) + 1) / primaryCap,
            ((seconds.get(second) ?? 0) + 1) / 4,
            ((thirds.get(third) ?? 0) + 1) / 4,
          ];
          const score = [
            Math.max(...quotaLoads),
            quotaLoads.reduce((sum, load) => sum + load, 0),
            Math.max(...distributionLoads),
            distributionLoads.reduce((sum, load) => sum + load, 0),
          ];
          const comparison = bestScore === null ? -1 : compareScores(score, bestScore);
          if (comparison < 0) {
            bestScore = score;
            bestCandidates = [candidate];
          } else if (comparison === 0) {
            bestCandidates.push(candidate);
          }
        }
        if (bestCandidates.length === 0) break;
        const candidate = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
        const [first, second, third] = candidate.operands;
        const kind = operatorKey(candidate);
        const oneKind = usesOne(candidate);
        const simplePattern = usesSimplePattern(candidate);
        selected.push(candidate);
        increment(starts, first);
        increment(results, candidate.result);
        increment(seconds, second);
        increment(thirds, third);
        increment(operators, kind);
        increment(regroupKinds, candidate.needsRegroup);
        increment(oneKinds, oneKind);
        if (simplePattern) simplePatterns += 1;
      }
      if (selected.length === limit) return shuffle(selected);
    }
  }

  return [];
};

const generateChainedArithmetic = (
  range: Range,
  mode: ChainedMode,
  regroup: RegroupOption
): Problem[] => {
  const effectiveRegroup = range === '1-10'
    ? 'mixed'
    : regroup;
  const candidates = buildChainedCandidates(range, mode, effectiveRegroup);
  const selected = selectChainedCandidates(candidates, CHAINED_PROBLEM_COUNT, effectiveRegroup);

  return shuffle(selected).map((candidate, id) => ({
    id,
    type: 'arithmetic-chain',
    operands: candidate.operands,
    operators: candidate.operators,
  }));
};

const generateArithmetic = (
  range: Range,
  mode: Mode,
  regroup: RegroupOption,
  lowerOperandDigits: LowerOperandDigits
): Problem[] => {
  const isVertical = ['vertical-add', 'vertical-sub', 'vertical-mixed'].includes(mode);
  const maxProblems = isVertical ? 20 : HORIZONTAL_PROBLEM_COUNTS[range];
  const [minTarget, maxTarget] = PRACTICE_BANDS[range];

  const includeAdd = mode.includes('-add') || mode.includes('-mixed');
  const includeSub = mode.includes('-sub') || mode.includes('-mixed');
  const ignoresRegroup = range === '1-10' && !isVertical;
  const rareFactProbability = 0.35;
  const allowOnePlusOne = !ignoresRegroup || Math.random() < rareFactProbability;
  const allowOnePlusTwo = !ignoresRegroup || Math.random() < rareFactProbability;
  const allowTwoMinusOne = !ignoresRegroup || Math.random() < rareFactProbability;

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
        const isCarry = additionRequiresRegroup(num1, num2);
        if (!ignoresRegroup && regroup === 'none' && isCarry) continue;
        if (!ignoresRegroup && regroup === 'only' && !isCarry) continue;
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
        const isBorrow = subtractionRequiresRegroup(M, num2);
        if (!ignoresRegroup && regroup === 'none' && isBorrow) continue;
        if (!ignoresRegroup && regroup === 'only' && !isBorrow) continue;
        candidates.push({
          num1: M, num2, operator: '-', needsRegroup: isBorrow,
          lowerDigits: num2 < 10 ? 'one' : 'two',
        });
      }
    }
  }

  const operatorCycleSize = includeAdd && includeSub ? 2 : 1;
  const mixedDigitSlots = Math.ceil(maxProblems / operatorCycleSize);
  const mixedTwoDigitSlots = (() => {
    if (!isVertical || lowerOperandDigits !== 'mixed') return 0;
    const distinctTops = (digits: Candidate['lowerDigits']) => new Set(
      candidates
        .filter(candidate => candidate.lowerDigits === digits)
        .map(candidate => `${candidate.operator}|${candidate.num1}`)
    ).size;
    const oneDigitTops = distinctTops('one');
    const twoDigitTops = distinctTops('two');
    if (oneDigitTops === 0) return mixedDigitSlots;
    if (twoDigitTops === 0) return 0;
    return Math.max(
      1,
      Math.min(
        mixedDigitSlots - 1,
        Math.round(mixedDigitSlots * twoDigitTops / (oneDigitTops + twoDigitTops))
      )
    );
  })();
  const desiredMixedDigits = (index: number): Candidate['lowerDigits'] =>
    Math.floor((Math.floor(index / operatorCycleSize) + 1) * mixedTwoDigitSlots / mixedDigitSlots) >
      Math.floor(Math.floor(index / operatorCycleSize) * mixedTwoDigitSlots / mixedDigitSlots)
      ? 'two'
      : 'one';

  const chosen: Candidate[] = [];
  const used = new Set<string>();
  const topOperandCounts = new Map<number, number>();
  const targetCounts = new Map<number, number>();
  const reservedTopSelections = new Map<string, number>();
  if (isVertical && lowerOperandDigits === 'mixed') {
    for (const digits of ['one', 'two'] as const) {
      const tops = new Set(
        candidates
          .filter(candidate => candidate.lowerDigits === digits)
          .map(candidate => candidate.num1)
      );
      if (tops.size !== 1) continue;
      const [top] = tops;
      const reserved = Array.from(
        { length: maxProblems },
        (_, index) => desiredMixedDigits(index)
      ).filter(value => value === digits).length;
      topOperandCounts.set(top, (topOperandCounts.get(top) ?? 0) + reserved);
      reservedTopSelections.set(`${top}|${digits}`, reserved);
    }
  }
  const candidateKey = (candidate: Candidate): string => {
    if (!isVertical) {
      if (ignoresRegroup && candidate.operator === '+') {
        return `${candidate.num1}+${candidate.num2}`;
      }
      const whole = candidate.operator === '+' ? candidate.num1 + candidate.num2 : candidate.num1;
      const parts = candidate.operator === '+'
        ? [candidate.num1, candidate.num2]
        : [candidate.num2, candidate.num1 - candidate.num2];
      return `${whole}|${parts.sort((a, b) => a - b).join('|')}`;
    }
    return `${candidate.num1}${candidate.operator}${candidate.num2}`;
  };
  const allowsRareFact = (candidate: Candidate): boolean => {
    if (!ignoresRegroup) return true;
    if (candidate.operator === '+') {
      if (candidate.num1 === 1 && candidate.num2 === 1) return allowOnePlusOne;
      if (candidate.num1 + candidate.num2 === 3) return allowOnePlusTwo;
      return true;
    }
    return candidate.num1 !== 2 || candidate.num2 !== 1 || allowTwoMinusOne;
  };
  let addOneSelections = 0;
  for (let i = 0; i < maxProblems; i++) {
    const desiredOperator: '+' | '-' | undefined = includeAdd && includeSub
      ? (i % 2 === 0 ? '+' : '-')
      : (includeAdd ? '+' : '-');
    const desiredDigits: 'one' | 'two' | undefined = !isVertical
      ? undefined
      : lowerOperandDigits === 'mixed'
        ? desiredMixedDigits(i)
        : lowerOperandDigits;
    const desiredRegroup = ignoresRegroup
      ? undefined
      : regroup === 'mixed' ? Math.floor(i / 2) % 2 === 0 : regroup === 'only';

    const filters = [
      (c: Candidate) => c.operator === desiredOperator &&
        (!desiredDigits || c.lowerDigits === desiredDigits) &&
        (desiredRegroup === undefined || c.needsRegroup === desiredRegroup),
      (c: Candidate) => c.operator === desiredOperator && (!desiredDigits || c.lowerDigits === desiredDigits),
      ...(lowerOperandDigits === 'mixed'
        ? [
            (c: Candidate) => c.operator === desiredOperator && c.needsRegroup === desiredRegroup,
            (c: Candidate) => c.operator === desiredOperator,
          ]
        : []),
    ];
    let selectionPool: Candidate[] = [];
    for (const filter of filters) {
      const unused = candidates.filter(c =>
        filter(c) &&
        allowsRareFact(c) &&
        !used.has(candidateKey(c)) &&
        !(
          ignoresRegroup &&
          c.operator === '+' &&
          (c.num1 === 1 || c.num2 === 1) &&
          addOneSelections >= 2
        )
      );
      if (unused.length === 0) continue;

      const leastUsed = isVertical
        ? Math.min(...unused.map(candidate => topOperandCounts.get(candidate.num1) ?? 0))
        : ignoresRegroup
          ? Math.min(...unused.map(candidate => {
              const target = candidate.operator === '+'
                ? candidate.num1 + candidate.num2
                : candidate.num1;
              return targetCounts.get(target) ?? 0;
            }))
          : 0;
      const balanced = isVertical
        ? unused.filter(candidate => (topOperandCounts.get(candidate.num1) ?? 0) === leastUsed)
        : ignoresRegroup
          ? unused.filter(candidate => {
              const target = candidate.operator === '+'
                ? candidate.num1 + candidate.num2
                : candidate.num1;
              return (targetCounts.get(target) ?? 0) === leastUsed;
            })
          : unused;
      const preferred = balanced.filter(c => c.num2 !== 1 && (c.operator === '-' || c.num1 !== 1));
      selectionPool = preferred.length > 0 ? preferred : balanced;
      break;
    }
    if (selectionPool.length === 0) break;

    const selected = selectionPool[Math.floor(Math.random() * selectionPool.length)];
    used.add(candidateKey(selected));
    chosen.push(selected);
    if (
      ignoresRegroup &&
      selected.operator === '+' &&
      (selected.num1 === 1 || selected.num2 === 1)
    ) {
      addOneSelections += 1;
    }
    const reservationKey = `${selected.num1}|${selected.lowerDigits}`;
    const reserved = reservedTopSelections.get(reservationKey) ?? 0;
    if (reserved > 0) {
      reservedTopSelections.set(reservationKey, reserved - 1);
    } else {
      topOperandCounts.set(selected.num1, (topOperandCounts.get(selected.num1) ?? 0) + 1);
    }
    if (ignoresRegroup) {
      const target = selected.operator === '+'
        ? selected.num1 + selected.num2
        : selected.num1;
      targetCounts.set(target, (targetCounts.get(target) ?? 0) + 1);
    }
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
  'horizontal-chain-add': (range, regroup) => generateChainedArithmetic(range, 'horizontal-chain-add', regroup),
  'horizontal-chain-sub': (range, regroup) => generateChainedArithmetic(range, 'horizontal-chain-sub', regroup),
  'horizontal-chain-mixed': (range, regroup) => generateChainedArithmetic(range, 'horizontal-chain-mixed', regroup),
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
