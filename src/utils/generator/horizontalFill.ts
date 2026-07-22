import { Mode, Range, RegroupOption, HorizontalFillProblem } from '../../types';
import { buildFillCandidates, FillCandidate } from './fillCandidates';
import { shuffle } from './random';

export type FillMode = Extract<Mode, 'horizontal-fill-add' | 'horizontal-fill-sub' | 'horizontal-fill-mixed'>;

export type FillGenerationResult = {
  problems: HorizontalFillProblem[];
  requestedCount: number;
  availableCount: number;
  truncated: boolean;
};

const isLowPriorityCandidate = (candidate: FillCandidate): boolean =>
  (candidate.operator === '+' && candidate.num1 === 1 && candidate.num2 === 1)
  || (candidate.operator === '-' && candidate.num1 === 2 && candidate.num2 === 1);

const selectCandidates = (
  pool: FillCandidate[],
  requestedCount: number,
  randomFn?: () => number,
): FillCandidate[] => {
  const selected = pool.slice(0, requestedCount);
  const remaining = pool.slice(requestedCount);
  const random = randomFn ?? Math.random;

  for (let index = 0; index < selected.length; index++) {
    if (!isLowPriorityCandidate(selected[index]) || random() < 0.25) continue;

    const replacementIndex = remaining.findIndex(candidate => !isLowPriorityCandidate(candidate));
    if (replacementIndex < 0) continue;
    selected[index] = remaining.splice(replacementIndex, 1)[0];
  }

  return selected;
};

export const generateHorizontalFillProblems = (
  range: Range,
  mode: FillMode,
  regroup: RegroupOption,
  requestedCount: number,
  randomFn?: () => number
): FillGenerationResult => {
  let selectedCandidates: FillCandidate[] = [];
  let availableCount = 0;

  if (mode === 'horizontal-fill-add') {
    const pool = shuffle(buildFillCandidates(range, '+', regroup), randomFn);
    availableCount = pool.length;
    selectedCandidates = selectCandidates(pool, requestedCount, randomFn);
  } else if (mode === 'horizontal-fill-sub') {
    const pool = shuffle(buildFillCandidates(range, '-', regroup), randomFn);
    availableCount = pool.length;
    selectedCandidates = selectCandidates(pool, requestedCount, randomFn);
  } else {
    // horizontal-fill-mixed
    const addPool = shuffle(buildFillCandidates(range, '+', regroup), randomFn);
    const subPool = shuffle(buildFillCandidates(range, '-', regroup), randomFn);
    availableCount = addPool.length + subPool.length;

    const targetAdd = Math.ceil(requestedCount / 2);
    const targetSub = Math.floor(requestedCount / 2);

    const takenAdd = selectCandidates(addPool, targetAdd, randomFn);
    const takenSub = selectCandidates(subPool, targetSub, randomFn);

    let combined = [...takenAdd, ...takenSub];

    // If one pool had fewer candidates than requested target, fill deficit from remaining of the other pool
    if (combined.length < requestedCount) {
      const remainingAdd = addPool.filter(candidate => !takenAdd.includes(candidate));
      const remainingSub = subPool.filter(candidate => !takenSub.includes(candidate));
      const remainingCombined = shuffle([...remainingAdd, ...remainingSub], randomFn);

      const deficit = requestedCount - combined.length;
      combined = [
        ...combined,
        ...selectCandidates(remainingCombined, deficit, randomFn),
      ];
    }

    selectedCandidates = shuffle(combined, randomFn);
  }

  const problems: HorizontalFillProblem[] = selectedCandidates.map((c, idx) => ({
    id: idx + 1,
    type: 'horizontal-fill',
    num1: c.num1,
    num2: c.num2,
    result: c.result,
    operator: c.operator,
    blankPosition: c.blankPosition,
  }));

  return {
    problems,
    requestedCount,
    availableCount,
    truncated: problems.length < requestedCount,
  };
};
