import { Mode, Problem, Range, RegroupOption } from '../../types';
import { shuffle } from './random';
import { ArithmeticOperator, matchesRegroup, requiresRegroup } from './regroup';
import { CHAINED_PROBLEM_COUNT, PRACTICE_BANDS } from './worksheetRules';

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

export const generateChainedArithmetic = (
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
