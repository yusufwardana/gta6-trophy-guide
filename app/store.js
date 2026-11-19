// Progress store: the earned-trophy set and its export/import format.
// Pure logic (no DOM, no localStorage) so Node tests can drive it.
// The browser wrapper in app.js owns localStorage; this module owns the rules.
export const STORAGE_KEY = 'gta6-trophy-guide-progress-v1';

// A fresh, empty earned set.
export function createProgress() {
  return new Set();
}

export function progressCount(earned) {
  return earned.size;
}

// Toggle one trophy in the set. Unknown names are ignored: the set only
// ever holds names from the official 55, so a typo or stale import entry
// can never invent a trophy.
export function toggleProgress(earned, name, knownNames) {
  if (typeof name !== 'string' || name.length === 0) return earned;
  if (knownNames && !knownNames.includes(name)) return earned;
  if (earned.has(name)) earned.delete(name);
  else earned.add(name);
  return earned;
}

// Export format: a JSON array of earned trophy names, sorted, so two
// exports of the same progress are byte-identical.
export function serializeProgress(earned) {
  return JSON.stringify([...earned].sort());
}

// Parse an import file. Returns a Set of known names only; unknown names
// are dropped silently. Throws on malformed JSON or a non-array payload.
export function parseProgress(text, knownNames) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Import is not valid JSON');
  }
  if (!Array.isArray(parsed)) throw new Error('Import must be a JSON array of trophy names');
  const known = new Set(knownNames ?? []);
  const out = new Set();
  for (const name of parsed) {
    if (typeof name !== 'string') continue;
    if (known.size > 0 && !known.has(name)) continue;
    out.add(name);
  }
  return out;
}
