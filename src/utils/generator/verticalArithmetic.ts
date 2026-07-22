import { LowerOperandDigits, Problem, Range, RegroupOption } from '../../types';
import {
  ArithmeticCandidate,
  buildArithmeticCandidates,
  VerticalArithmeticMode,
} from './arithmeticCandidates';
import { shuffle } from './random';

export const generateVerticalArithmetic = (
  range: Range,
  mode: VerticalArithmeticMode,
  regroup: RegroupOption,
  lowerOperandDigits: LowerOperandDigits
): Problem[] => {
  const maxProblems = 20;
  const includeAdd = mode.includes('-add') || mode.includes('-mixed');
  const includeSub = mode.includes('-sub') || mode.includes('-mixed');
  const candidates = buildArithmeticCandidates(range, mode, regroup, true);
  const operatorCycleSize = includeAdd && includeSub ? 2 : 1;
  const mixedDigitSlots = Math.ceil(maxProblems / operatorCycleSize);
  const mixedTwoDigitSlots = (() => {
    if (lowerOperandDigits !== 'mixed') return 0;
    const distinctTops = (digits: ArithmeticCandidate['lowerDigits']) => new Set(
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
  const desiredMixedDigits = (index: number): ArithmeticCandidate['lowerDigits'] =>
    Math.floor((Math.floor(index / operatorCycleSize) + 1) * mixedTwoDigitSlots / mixedDigitSlots) >
      Math.floor(Math.floor(index / operatorCycleSize) * mixedTwoDigitSlots / mixedDigitSlots)
      ? 'two'
      : 'one';

  const chosen: ArithmeticCandidate[] = [];
  const used = new Set<string>();
  const topOperandCounts = new Map<number, number>();
  const reservedTopSelections = new Map<string, number>();
  if (lowerOperandDigits === 'mixed') {
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
  const candidateKey = (candidate: ArithmeticCandidate): string =>
    `${candidate.num1}${candidate.operator}${candidate.num2}`;

  for (let index = 0; index < maxProblems; index++) {
    const desiredOperator: '+' | '-' = includeAdd && includeSub
      ? (index % 2 === 0 ? '+' : '-')
      : (includeAdd ? '+' : '-');
    const desiredDigits = lowerOperandDigits === 'mixed'
      ? desiredMixedDigits(index)
      : lowerOperandDigits;
    const desiredRegroup = regroup === 'mixed'
      ? Math.floor(index / 2) % 2 === 0
      : regroup === 'only';
    const filters = [
      (candidate: ArithmeticCandidate) => candidate.operator === desiredOperator &&
        candidate.lowerDigits === desiredDigits &&
        candidate.needsRegroup === desiredRegroup,
      (candidate: ArithmeticCandidate) => candidate.operator === desiredOperator &&
        candidate.lowerDigits === desiredDigits,
      ...(lowerOperandDigits === 'mixed'
        ? [
            (candidate: ArithmeticCandidate) => candidate.operator === desiredOperator &&
              candidate.needsRegroup === desiredRegroup,
            (candidate: ArithmeticCandidate) => candidate.operator === desiredOperator,
          ]
        : []),
      ...(includeAdd && includeSub
        ? [
            (candidate: ArithmeticCandidate) => candidate.operator !== desiredOperator &&
              candidate.lowerDigits === desiredDigits &&
              candidate.needsRegroup === desiredRegroup,
            (candidate: ArithmeticCandidate) => candidate.operator !== desiredOperator &&
              candidate.lowerDigits === desiredDigits,
            ...(lowerOperandDigits === 'mixed'
              ? [
                  (candidate: ArithmeticCandidate) => candidate.operator !== desiredOperator &&
                    candidate.needsRegroup === desiredRegroup,
                  (candidate: ArithmeticCandidate) => candidate.operator !== desiredOperator,
                ]
              : []),
          ]
        : []),
    ];

    let selectionPool: ArithmeticCandidate[] = [];
    for (const filter of filters) {
      const unused = candidates.filter(candidate =>
        filter(candidate) && !used.has(candidateKey(candidate))
      );
      if (unused.length === 0) continue;

      const leastUsed = Math.min(
        ...unused.map(candidate => topOperandCounts.get(candidate.num1) ?? 0)
      );
      const balanced = unused.filter(candidate =>
        (topOperandCounts.get(candidate.num1) ?? 0) === leastUsed
      );
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
    const reservationKey = `${selected.num1}|${selected.lowerDigits}`;
    const reserved = reservedTopSelections.get(reservationKey) ?? 0;
    if (reserved > 0) {
      reservedTopSelections.set(reservationKey, reserved - 1);
    } else {
      topOperandCounts.set(selected.num1, (topOperandCounts.get(selected.num1) ?? 0) + 1);
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
