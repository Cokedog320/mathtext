export const seededRandom = (seed: number): (() => number) => {
  if (seed === 0) return () => 0;

  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};
