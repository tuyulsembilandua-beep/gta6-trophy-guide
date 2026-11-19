// Loading the trophy list: one local fetch of app/data/trophies.json, nothing else.
export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  const data = await response.json();
  return data;
}

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side',
  collectible: 'Collectible',
  activity: 'Activity',
  crime: 'Crime & money',
  exploration: 'Exploration',
  platinum: 'Platinum',
  completion: '100% completion',
};

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

// The filter chips map to kinds; "side" covers stranger strands and exploration.
export const FILTER_KINDS = {
  all: null,
  story: ['story'],
  missable: null, // handled by the missable flag, not by kind
  collectible: ['collectible'],
  activity: ['activity'],
  crime: ['crime'],
  side: ['side', 'exploration', 'completion'],
};

export function trophyById(trophies, id) {
  return trophies.find((trophy) => trophy.id === id);
}
