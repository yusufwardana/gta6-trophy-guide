// Spoiler setting: hidden (story) trophies stay masked until earned.
// A trophy counts as spoiler-hidden when the setting is on, the trophy is
// flagged hidden in the data, and the player has not earned it yet.
// Visible trophies are never hidden by this setting.
export function isSpoilerHidden(trophy, earned, spoilerOn) {
  if (!spoilerOn) return false;
  if (!trophy.hidden) return false;
  return !(earned instanceof Set && earned.has(trophy.name));
}

// The masked view of a hidden trophy: name and description replaced, grade
// and kind kept so the list still reads as a real list with a hole in it.
export function maskTrophy(trophy) {
  return {
    ...trophy,
    name: 'Hidden trophy',
    description: 'Story trophy — hidden until you earn it. Turn spoilers off to reveal it.',
    guide: '',
    sources: [],
  };
}
