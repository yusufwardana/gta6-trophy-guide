// Trophy list filters: pure functions over the trophy array.
// Every filter composes; an empty options object returns the list as-is.
export function filterTrophies(trophies, options = {}) {
  const { grade, kind, search, earnedOnly, missableOnly, earned } = options;
  const needle = typeof search === 'string' ? search.trim().toLowerCase() : '';
  return trophies.filter((t) => {
    if (grade && grade !== 'all' && t.grade !== grade) return false;
    if (kind && kind !== 'all' && t.kind !== kind) return false;
    if (missableOnly && !t.missable) return false;
    if (earnedOnly && !(earned instanceof Set && earned.has(t.name))) return false;
    if (needle) {
      const hay = `${t.name} ${t.description} ${t.guide ?? ''}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

// Grade counts for the filter labels, e.g. "Bronze (46)".
export function gradeCounts(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    if (Object.hasOwn(counts, t.grade)) counts[t.grade]++;
  }
  return counts;
}

// Kind counts for the kind filter labels.
export function kindCounts(trophies) {
  const counts = {};
  for (const t of trophies) counts[t.kind] = (counts[t.kind] || 0) + 1;
  return counts;
}
