export function mergeIntervals(intervals) {
  if (!intervals.length) return [];

  const sorted = [...intervals].sort((a, b) => a.bt - b.bt);
  const merged = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = sorted[i];

    if (curr.bt <= prev.et + 1) {
      prev.et = Math.max(prev.et, curr.et);
    } else {
      merged.push(curr);
    }
  }
  return merged;
}
