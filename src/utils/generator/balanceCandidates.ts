import { shuffle } from './random';

export const takeBalancedCandidates = <T>(
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
