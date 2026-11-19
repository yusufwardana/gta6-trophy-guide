// Tests for the tracker logic of the GTA VI trophy guide.
// Run: node tests/test-tracker.mjs  (exit 0 = all pass)
// These run BEFORE the app modules exist (TDD): they must fail first,
// then pass once app/store.js, app/filters.js and app/spoiler.js are written.
// The modules are pure logic (no DOM, no localStorage) so Node can test them.
import assert from 'node:assert/strict';
import { createProgress, toggleProgress, serializeProgress, parseProgress, progressCount } from '../app/store.js';
import { filterTrophies } from '../app/filters.js';
import { isSpoilerHidden, maskTrophy } from '../app/spoiler.js';

const sample = [
  { name: 'Vice Got a Price!', grade: 'platinum', kind: 'platinum', hidden: false, missable: false },
  { name: 'Just Like Paradise', grade: 'bronze', kind: 'story', hidden: true, missable: false },
  { name: 'Cunning Stunts', grade: 'silver', kind: 'activity', hidden: false, missable: false },
  { name: 'Positive Mental Attitude', grade: 'bronze', kind: 'activity', hidden: false, missable: true },
  { name: 'Dime on the Dollar', grade: 'bronze', kind: 'crime', hidden: false, missable: false },
  { name: 'Little Boxes', grade: 'bronze', kind: 'collectible', hidden: false, missable: false },
];

let passed = 0;
function check(label, fn) {
  fn();
  passed++;
  console.log('ok -', label);
}

// --- store: progress set ---
check('createProgress starts empty', () => {
  assert.equal(progressCount(createProgress()), 0);
});
check('toggleProgress adds then removes a trophy', () => {
  const p = createProgress();
  toggleProgress(p, 'Cunning Stunts');
  assert.equal(progressCount(p), 1);
  assert.ok(p.has('Cunning Stunts'));
  toggleProgress(p, 'Cunning Stunts');
  assert.equal(progressCount(p), 0);
});
check('toggleProgress ignores unknown names', () => {
  const p = createProgress();
  toggleProgress(p, 'Not A Trophy', sample.map((t) => t.name));
  assert.equal(progressCount(p), 0);
});
check('serializeProgress round-trips through parseProgress', () => {
  const p = createProgress();
  toggleProgress(p, 'Cunning Stunts');
  toggleProgress(p, 'Little Boxes');
  const text = serializeProgress(p);
  const back = parseProgress(text, sample.map((t) => t.name));
  assert.deepEqual([...back].sort(), ['Cunning Stunts', 'Little Boxes']);
});
check('parseProgress drops unknown names and keeps known ones', () => {
  const back = parseProgress('["Cunning Stunts","Nope","Little Boxes"]', sample.map((t) => t.name));
  assert.deepEqual([...back].sort(), ['Cunning Stunts', 'Little Boxes']);
});
check('parseProgress rejects non-array JSON', () => {
  assert.throws(() => parseProgress('{"a":1}', []), /array/);
});
check('parseProgress rejects malformed JSON', () => {
  assert.throws(() => parseProgress('not json', []), /JSON/);
});

// --- filters ---
check('filterTrophies with no filters returns everything', () => {
  assert.equal(filterTrophies(sample, {}).length, 6);
});
check('filterTrophies by grade', () => {
  assert.deepEqual(filterTrophies(sample, { grade: 'silver' }).map((t) => t.name), ['Cunning Stunts']);
});
check('filterTrophies by kind', () => {
  assert.deepEqual(filterTrophies(sample, { kind: 'activity' }).map((t) => t.name),
    ['Cunning Stunts', 'Positive Mental Attitude']);
});
check('filterTrophies missableOnly', () => {
  assert.deepEqual(filterTrophies(sample, { missableOnly: true }).map((t) => t.name),
    ['Positive Mental Attitude']);
});
check('filterTrophies by search text matches name', () => {
  assert.deepEqual(filterTrophies(sample, { search: 'stunt' }).map((t) => t.name), ['Cunning Stunts']);
});
check('filterTrophies earnedOnly uses the progress set', () => {
  const p = createProgress();
  toggleProgress(p, 'Little Boxes');
  assert.deepEqual(filterTrophies(sample, { earnedOnly: true, earned: p }).map((t) => t.name), ['Little Boxes']);
});
check('filterTrophies combines grade + kind', () => {
  assert.deepEqual(filterTrophies(sample, { grade: 'bronze', kind: 'activity' }).map((t) => t.name),
    ['Positive Mental Attitude']);
});

// --- spoiler ---
check('spoiler off: nothing is hidden', () => {
  for (const t of sample) assert.equal(isSpoilerHidden(t, createProgress(), false), false);
});
check('spoiler on: hidden story trophy is hidden until earned', () => {
  const p = createProgress();
  const story = sample[1];
  assert.equal(isSpoilerHidden(story, p, true), true);
  toggleProgress(p, 'Just Like Paradise');
  assert.equal(isSpoilerHidden(story, p, true), false);
});
check('spoiler on: visible trophies are never hidden', () => {
  const p = createProgress();
  assert.equal(isSpoilerHidden(sample[2], p, true), false);
  assert.equal(isSpoilerHidden(sample[3], p, true), false);
});
check('maskTrophy hides name and description but keeps grade', () => {
  const masked = maskTrophy(sample[1]);
  assert.equal(masked.name, 'Hidden trophy');
  assert.match(masked.description, /hidden/i);
  assert.equal(masked.grade, 'bronze');
  assert.equal(masked.kind, 'story');
});

console.log(`\n${passed} tracker tests passed`);
