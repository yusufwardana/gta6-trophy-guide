// Tests for app/data/trophies.json: the official 55-trophy list.
// Run: node tests/test-data.mjs  (exit 0 = all pass)
// The official names/descriptions/grades below are the kit starter's list,
// cross-checked in this session against the published lists on
// sixshore.com, ofzenandcomputing.com and all.gg (19 Nov 2026):
// 55 trophies, 1 platinum / 2 gold / 6 silver / 46 bronze, 28 hidden.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const doc = JSON.parse(readFileSync(new URL('../app/data/trophies.json', import.meta.url), 'utf-8'));
const trophies = doc.trophies;
assert.ok(Array.isArray(trophies), 'trophies must be an array');

const OFFICIAL = [
  ['Vice Got a Price!', 'Congratulations! You\'re a Leonida Legend.', 'platinum'],
  ['Just Like Paradise', 'Complete Gone Fishing.', 'bronze'],
  ['Paradise Lost', 'Complete Chapter 1.', 'bronze'],
  ['T**s Ass Drug Money', 'Complete Chapter 2.', 'bronze'],
  ['Vice City, Baby!', 'Complete Chapter 3.', 'bronze'],
  ['Top Of The World, Ma', 'Complete Chapter 4.', 'bronze'],
  ['You Gotta Know When to Get Off', 'Complete the final mission.', 'gold'],
  ['Trust', 'Complete Breakfast Run.', 'bronze'],
  ['Break the Bank', 'Complete The Cartel Heist.', 'bronze'],
  ['Family Matters', 'Complete Child\'s Play.', 'bronze'],
  ['DWNFALL', 'Complete Headliners.', 'bronze'],
  ['Hi-Jacked', 'Complete VCIA Takedown.', 'bronze'],
  ['Snow Storm', 'Complete Operation Savage Glory.', 'bronze'],
  ['A Long Road', 'Attain 100% Completion.', 'gold'],
  ['Cunning Stunts', 'Complete 250 Stunts.', 'silver'],
  ['Master of None', 'Try each type of activity once.', 'bronze'],
  ['The Shootist', 'Earn a gold medal in all Shooting Range challenges.', 'silver'],
  ['Top Fun', 'Win a Top Fun Drone Race at every location.', 'bronze'],
  ['Earn Cash, Not Kudos', 'Win 20 different races.', 'bronze'],
  ['Baited My Tackle', 'Beat Cal in a fishing challenge.', 'bronze'],
  ['Stick Fiddler', 'Complete an arcade game.', 'bronze'],
  ['Road to Rehabilitation', 'Complete the final mission for Andy.', 'bronze'],
  ['This Was No Boat Accident', 'Complete the final mission for Kenton.', 'bronze'],
  ['The Lone Rider', 'Complete the final mission for Billy.', 'bronze'],
  ['Strangers & Freaks', 'Complete 8 mission strands for strangers across the state of Leonida.', 'silver'],
  ['Supply & Demand', 'Complete the final mission for Randy.', 'bronze'],
  ['Spin On This!', 'Complete the final mission for Tyrone.', 'bronze'],
  ['Positive Mental Attitude', 'Meditate at every spot across Leonida.', 'bronze'],
  ['Fair Game', 'Hunt a unique animal for Bret.', 'bronze'],
  ['Don\'t Touch My Deck', 'Complete 3 Collectible Card sets.', 'silver'],
  ['You WAiNKer!', 'WAiNK It at 100 locations.', 'silver'],
  ['One Last Thing', 'Complete 50 Challenges.', 'bronze'],
  ['Hot Together', 'Lose a 4 star Wanted Level with your partner and escape the heat.', 'bronze'],
  ['Retail Therapy', 'Rob 3 shops back-to-back with your partner without losing your Wanted Level.', 'bronze'],
  ['Whip It Good', 'Discover 100 vehicles.', 'bronze'],
  ['Gunslinger', 'Take down 5 enemies in a single use of Combat Focus.', 'bronze'],
  ['Catch Me If You Can', 'Make an unscheduled departure at VCIA.', 'bronze'],
  ['Challenging Tank', 'Kinda hot in these Rhinos.', 'bronze'],
  ['Sneakthief', 'Rob a jewelry store without being detected.', 'bronze'],
  ['Maximum Withdrawal', 'Rob 5 Bank Vaults and escape.', 'silver'],
  ['A Classic Blitz Play', 'Rob an Armored Truck and escape.', 'bronze'],
  ['The Goodtime State', 'Explore all of Leonida.', 'bronze'],
  ['Pest Control', 'Rob an Illegal Operation belonging to each gang.', 'bronze'],
  ['In The Beginning…', 'Enjoy a cocktail with a view on Ocean Beach.', 'bronze'],
  ['Capital Offense', 'Smash your way out of a vehicle showroom in classic style.', 'bronze'],
  ['Let’s Go Bowling', 'Follow-through at the Kolt & Associates\' bowling alley.', 'bronze'],
  ['Personal Best', 'A partnership with mass appeal.', 'bronze'],
  ['Actions Speak Louder', 'Choices made (for better or worse).', 'bronze'],
  ['Bad Luck, I Guess', 'Second time\'s the charm.', 'bronze'],
  ['The Truth Is Out There', 'What the hell just happened?', 'bronze'],
  ['Ten Pin', 'Bowl \'em over with a melee drive-by.', 'bronze'],
  ['Dime on the Dollar', 'Earn $250,000 laundering Marked Bills through your contacts.', 'bronze'],
  ['Treat Yo Self', 'Spend $100,000 across all shops.', 'bronze'],
  ['Little Boxes', 'Purchase all garage properties.', 'bronze'],
  ['On the Spot', 'Register 10 vehicles to the Scooter Bros app.', 'bronze'],
];

// Story trophies (chapter + named-mission completions): the 12 hidden story
// trophies per the published lists (Six Shore story section, Of Zen hidden list).
const STORY_NAMES = new Set([
  'Just Like Paradise', 'Paradise Lost', 'T**s Ass Drug Money', 'Vice City, Baby!',
  'Top Of The World, Ma', 'You Gotta Know When to Get Off', 'Trust', 'Break the Bank',
  'Family Matters', 'DWNFALL', 'Hi-Jacked', 'Snow Storm',
]);

// The 16 hidden side trophies (Six Shore hidden-side section, Of Zen hidden list).
const HIDDEN_SIDE_NAMES = new Set([
  'Road to Rehabilitation', 'This Was No Boat Accident', 'The Lone Rider',
  'Supply & Demand', 'Spin On This!', 'Fair Game', 'Catch Me If You Can',
  'Challenging Tank', 'In The Beginning…', 'Capital Offense', 'Let’s Go Bowling',
  'Personal Best', 'Actions Speak Louder', 'Bad Luck, I Guess',
  'The Truth Is Out There', 'Ten Pin',
]);

let passed = 0;
function check(label, fn) {
  fn();
  passed++;
  console.log('ok -', label);
}

check('55 trophies', () => assert.equal(trophies.length, 55));
check('every official name, description and grade matches exactly', () => {
  const byName = new Map(trophies.map((t) => [t.name, t]));
  for (const [name, description, grade] of OFFICIAL) {
    const t = byName.get(name);
    assert.ok(t, `missing trophy: ${name}`);
    assert.equal(t.description, description, `description mismatch: ${name}`);
    assert.equal(t.grade, grade, `grade mismatch: ${name}`);
  }
});
check('grade split is 1 platinum, 2 gold, 6 silver, 46 bronze', () => {
  const counts = {};
  for (const t of trophies) counts[t.grade] = (counts[t.grade] || 0) + 1;
  assert.deepEqual(counts, { platinum: 1, gold: 2, silver: 6, bronze: 46 });
});
check('28 hidden trophies: 12 story + 16 hidden side', () => {
  const hidden = trophies.filter((t) => t.hidden);
  assert.equal(hidden.length, 28);
  for (const t of trophies) {
    const expectHidden = STORY_NAMES.has(t.name) || HIDDEN_SIDE_NAMES.has(t.name);
    assert.equal(t.hidden, expectHidden, `hidden flag wrong: ${t.name}`);
  }
});
check('story kind matches the 12 story trophies', () => {
  for (const t of trophies) {
    assert.equal(t.kind === 'story', STORY_NAMES.has(t.name), `kind wrong: ${t.name}`);
  }
});
check('every trophy has a non-blank own-words guide of at least 40 characters', () => {
  for (const t of trophies) {
    assert.equal(typeof t.guide, 'string', `guide missing: ${t.name}`);
    assert.ok(t.guide.trim().length >= 40, `guide too short: ${t.name}`);
    assert.notEqual(t.guide.trim(), t.description.trim(), `guide repeats description: ${t.name}`);
  }
});
check('every trophy cites at least one named source with an https link', () => {
  for (const t of trophies) {
    assert.ok(Array.isArray(t.sources) && t.sources.length >= 1, `no sources: ${t.name}`);
    for (const s of t.sources) {
      assert.ok(typeof s.name === 'string' && s.name.length > 0, `source name missing: ${t.name}`);
      assert.ok(typeof s.url === 'string' && s.url.startsWith('https://'), `source url bad: ${t.name}`);
    }
  }
});
check('exactly one missable trophy: Positive Mental Attitude', () => {
  const missable = trophies.filter((t) => t.missable);
  assert.deepEqual(missable.map((t) => t.name), ['Positive Mental Attitude']);
  assert.ok(missable[0].missableNote && missable[0].missableNote.length > 20);
});
check('every trophy has a valid kind', () => {
  const kinds = new Set(['platinum', 'story', 'activity', 'crime', 'collectible', 'exploration', 'side']);
  for (const t of trophies) assert.ok(kinds.has(t.kind), `bad kind ${t.kind}: ${t.name}`);
});
check('names are unique', () => {
  assert.equal(new Set(trophies.map((t) => t.name)).size, 55);
});

console.log(`\n${passed} data tests passed`);
