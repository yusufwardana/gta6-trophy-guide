// Leonida Legend — DOM wiring for the GTA VI trophy guide and tracker.
// Data (names, descriptions, guides, source links) lives in
// data/trophies.json; logic lives in store.js, filters.js and spoiler.js.
// This file only connects the two to the page. Source links are built at
// runtime from the data, so no outside address is written in this file.
import { STORAGE_KEY, createProgress, toggleProgress, serializeProgress, parseProgress, progressCount } from './store.js';
import { filterTrophies } from './filters.js';
import { isSpoilerHidden, maskTrophy } from './spoiler.js';

const listEl = document.getElementById('trophy-list');
const emptyEl = document.getElementById('empty');
const statusEl = document.getElementById('status');
const progressEl = document.getElementById('progress');
const progressBarEl = document.getElementById('progress-bar');
const progressFillEl = document.getElementById('progress-fill');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const missableOnlyEl = document.getElementById('missable-only');
const earnedOnlyEl = document.getElementById('earned-only');
const spoilerEl = document.getElementById('spoiler');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const knownNames = trophies.map((t) => t.name);

let earned = createProgress();
try {
  earned = parseProgress(localStorage.getItem(STORAGE_KEY) ?? '[]', knownNames);
} catch {
  earned = createProgress();
}

function save() {
  localStorage.setItem(STORAGE_KEY, serializeProgress(earned));
}

function updateProgress() {
  const done = progressCount(earned);
  const total = trophies.length;
  const pct = Math.round((done / total) * 100);
  progressEl.textContent = `${done} of ${total} earned · ${pct}%`;
  progressBarEl.setAttribute('aria-valuenow', String(done));
  progressFillEl.style.width = `${pct}%`;
}

function sourceLinks(trophy) {
  const p = document.createElement('p');
  p.className = 'trophy-sources';
  p.append('Sources: ');
  trophy.sources.forEach((source, i) => {
    if (i > 0) p.append(' · ');
    const a = document.createElement('a');
    a.href = source.url;
    a.textContent = source.name;
    a.rel = 'noopener';
    p.append(a);
  });
  return p;
}

function trophyCard(trophy) {
  const hidden = isSpoilerHidden(trophy, earned, spoilerEl.checked);
  const shown = hidden ? maskTrophy(trophy) : trophy;
  const article = document.createElement('article');
  article.className = 'trophy' + (earned.has(trophy.name) ? ' earned' : '');
  article.dataset.trophyName = trophy.name;

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('change', () => {
    toggleProgress(earned, trophy.name, knownNames);
    save();
    render();
  });
  const name = document.createElement('h3');
  name.className = 'trophy-name';
  name.textContent = shown.name;
  head.append(box, name);
  for (const [text, cls] of [[shown.grade, `badge ${shown.grade}`], [shown.kind, 'badge kind']]) {
    const badge = document.createElement('span');
    badge.className = cls;
    badge.textContent = text;
    head.append(badge);
  }
  if (trophy.missable) {
    const badge = document.createElement('span');
    badge.className = 'badge missable';
    badge.textContent = 'Possibly missable';
    head.append(badge);
  }
  article.append(head);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = `“${shown.description}” — official description`;
  article.append(desc);

  if (!hidden) {
    const guide = document.createElement('p');
    guide.className = 'trophy-guide';
    const label = document.createElement('strong');
    label.textContent = 'How to get it: ';
    guide.append(label, trophy.guide);
    article.append(guide);
    if (trophy.missable && trophy.missableNote) {
      const note = document.createElement('p');
      note.className = 'missable-note';
      note.textContent = trophy.missableNote;
      article.append(note);
    }
    article.append(sourceLinks(trophy));
  }
  return article;
}

function render() {
  const shown = filterTrophies(trophies, {
    grade: gradeEl.value,
    kind: kindEl.value,
    search: searchEl.value,
    missableOnly: missableOnlyEl.checked,
    earnedOnly: earnedOnlyEl.checked,
    earned,
  });
  listEl.replaceChildren(...shown.map(trophyCard));
  emptyEl.hidden = shown.length > 0;
  statusEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies.`;
  updateProgress();
}

function showView(name) {
  for (const view of ['guide', 'roadmap', 'sources']) {
    document.getElementById(`view-${view}`).hidden = view !== name;
    const tab = document.getElementById(`tab-${view}`);
    tab.classList.toggle('active', view === name);
    if (view === name) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
}

function renderSources() {
  const seen = new Map();
  for (const t of trophies) {
    for (const s of t.sources) seen.set(s.url, s.name);
  }
  const ul = document.getElementById('source-list');
  ul.replaceChildren();
  for (const [url, name] of seen) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.textContent = name;
    a.rel = 'noopener';
    li.append(a);
    ul.append(li);
  }
}

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([serializeProgress(earned)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    earned = parseProgress(await file.text(), knownNames);
    save();
    render();
  } catch {
    alert('That file is not a valid progress export (a JSON array of trophy names).');
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies? This cannot be undone.')) return;
  earned = createProgress();
  save();
  render();
});
for (const el of [searchEl, gradeEl, kindEl, missableOnlyEl, earnedOnlyEl, spoilerEl]) {
  el.addEventListener('change', render);
  el.addEventListener('input', render);
}
document.getElementById('tab-guide').addEventListener('click', () => showView('guide'));
document.getElementById('tab-roadmap').addEventListener('click', () => showView('roadmap'));
document.getElementById('tab-sources').addEventListener('click', () => showView('sources'));

renderSources();
render();
