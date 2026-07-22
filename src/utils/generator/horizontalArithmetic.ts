import { Problem, Range, RegroupOption } from '../../types';
import {
  ArithmeticCandidate,
  buildArithmeticCandidates,
  HorizontalArithmeticMode,
} from './arithmeticCandidates';
import { shuffle } from './random';
import {
  HORIZONTAL_PROBLEM_COUNTS,
  MAX_VALUE_ONE_OPERAND_PROBLEMS,
} from './worksheetRules';

const MAX_WITHIN_TEN_BOUNDARY_TARGET_PROBLEMS = 3;

export const generateHorizontalArithmetic = (
  range: Range,
  mode: HorizontalArithmeticMode,
  regroup: RegroupOption
): Problem[] => {
  const maxProblems = HORIZONTAL_PROBLEM_COUNTS[range];
  const includeAdd = mode.includes('-add') || mode.includes('-mixed');
  const includeSub = mode.includes('-sub') || mode.includes('-mixed');
  const ignoresRegroup = range === '1-10';
  const rareFactProbability = 0.35;
  const allowOnePlusOne = !ignoresRegroup || Math.random() < rareFactProbability;
  const allowOnePlusTwo = !ignoresRegroup || Math.random() < rareFactProbability;
  const allowTwoMinusOne = !ignoresRegroup || Math.random() < rareFactProbability;
  const candidates = buildArithmeticCandidates(range, mode, regroup, false);

  const chosen: ArithmeticCandidate[] = [];
  const used = new Set<string>();
  const targetCounts = new Map<number, number>();
  const candidateKey = (candidate: ArithmeticCandidate): string =>
    `${candidate.num1}${candidate.operator}${candidate.num2}`;
  const targetFor = (candidate: ArithmeticCandidate): number =>
    candidate.operator === '+' ? candidate.num1 + candidate.num2 : candidate.num1;
  const hasWithinTenTargetCapacity = (candidate: ArithmeticCandidate): boolean => {
    if (!ignoresRegroup) return true;
    const target = targetFor(candidate);
    return target !== 10 ||
      (targetCounts.get(target) ?? 0) < MAX_WITHIN_TEN_BOUNDARY_TARGET_PROBLEMS;
  };
  const hasForbiddenUnitOperation = (candidate: ArithmeticCandidate): boolean => {
    if (ignoresRegroup) return false;
    return candidate.operator === '+'
      ? candidate.num1 === 1 || candidate.num2 === 1
      : candidate.num2 === 1;
  };
  const allowsRareFact = (candidate: ArithmeticCandidate): boolean => {
    if (!ignoresRegroup) return true;
    if (candidate.operator === '+') {
      if (candidate.num1 === 1 && candidate.num2 === 1) return allowOnePlusOne;
      if (candidate.num1 + candidate.num2 === 3) return allowOnePlusTwo;
      return true;
    }
    return candidate.num1 !== 2 || candidate.num2 !== 1 || allowTwoMinusOne;
  };
  let addOneSelections = 0;
  let subtractOneSelections = 0;

  for (let index = 0; index < maxProblems; index++) {
    const desiredOperator: '+' | '-' = includeAdd && includeSub
      ? (index % 2 === 0 ? '+' : '-')
      : (includeAdd ? '+' : '-');
    const desiredRegroup = ignoresRegroup
      ? undefined
      : regroup === 'mixed' ? Math.floor(index / 2) % 2 === 0 : regroup === 'only';
    const filters = [
      (candidate: ArithmeticCandidate) => candidate.operator === desiredOperator &&
        (desiredRegroup === undefined || candidate.needsRegroup === desiredRegroup),
      (candidate: ArithmeticCandidate) => candidate.operator === desiredOperator,
    ];

    let selectionPool: ArithmeticCandidate[] = [];
    for (const filter of filters) {
      const unused = candidates.filter(candidate =>
        filter(candidate) &&
        !hasForbiddenUnitOperation(candidate) &&
        allowsRareFact(candidate) &&
        !used.has(candidateKey(candidate)) &&
        hasWithinTenTargetCapacity(candidate) &&
        !(
          ignoresRegroup &&
          (
              (candidate.operator === '+' &&
              (candidate.num1 === 1 || candidate.num2 === 1) &&
              addOneSelections >= MAX_VALUE_ONE_OPERAND_PROBLEMS) ||
            (candidate.operator === '-' &&
              candidate.num2 === 1 &&
              subtractOneSelections >= MAX_VALUE_ONE_OPERAND_PROBLEMS)
          )
        )
      );
      if (unused.length === 0) continue;

      const leastUsed = ignoresRegroup
        ? Math.min(...unused.map(candidate => {
            const target = targetFor(candidate);
            return targetCounts.get(target) ?? 0;
          }))
        : 0;
      const balanced = ignoresRegroup
        ? unused.filter(candidate => {
            const target = targetFor(candidate);
            return (targetCounts.get(target) ?? 0) === leastUsed;
          })
        : unused;
      const preferred = balanced.filter(candidate =>
        candidate.num2 !== 1 && (candidate.operator === '-' || candidate.num1 !== 1)
      );
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
    if (ignoresRegroup && selected.operator === '-' && selected.num2 === 1) {
      subtractOneSelections += 1;
    }
    if (ignoresRegroup) {
      const target = targetFor(selected);
      targetCounts.set(target, (targetCounts.get(target) ?? 0) + 1);
    }
  }

  return shuffle(chosen).map((candidate, id) => ({
    id,
    type: 'arithmetic',
    num1: candidate.num1,
    num2: candidate.num2,
    operator: candidate.operator,
  }));
};
