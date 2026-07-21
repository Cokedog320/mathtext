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
    selectedCandidates = pool.slice(0, requestedCount);
  } else if (mode === 'horizontal-fill-sub') {
    const pool = shuffle(buildFillCandidates(range, '-', regroup), randomFn);
    availableCount = pool.length;
    selectedCandidates = pool.slice(0, requestedCount);
  } else {
    // horizontal-fill-mixed
    const addPool = shuffle(buildFillCandidates(range, '+', regroup), randomFn);
    const subPool = shuffle(buildFillCandidates(range, '-', regroup), randomFn);
    availableCount = addPool.length + subPool.length;

    const targetAdd = Math.ceil(requestedCount / 2);
    const targetSub = Math.floor(requestedCount / 2);

    const takenAdd = addPool.slice(0, targetAdd);
    const takenSub = subPool.slice(0, targetSub);

    let combined = [...takenAdd, ...takenSub];

    // If one pool had fewer candidates than requested target, fill deficit from remaining of the other pool
    if (combined.length < requestedCount) {
      const remainingAdd = addPool.slice(takenAdd.length);
      const remainingSub = subPool.slice(takenSub.length);
      const remainingCombined = shuffle([...remainingAdd, ...remainingSub], randomFn);

      const deficit = requestedCount - combined.length;
      combined = [...combined, ...remainingCombined.slice(0, deficit)];
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
