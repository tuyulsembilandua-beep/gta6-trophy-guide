// Filtering, searching and the spoiler rule for the tracker list.
import { FILTER_KINDS } from './data.js';

// A story trophy that is hidden on PlayStation stays hidden here too —
// its name and description are replaced — until the player earns it.
export function isSpoilerHidden(trophy, spoilersHidden, earned) {
  return spoilersHidden && trophy.hidden && trophy.kind === 'story' && !earned.has(trophy.id);
}

export function trophyMatches(trophy, filters, earned) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind === 'missable') {
    if (!trophy.missable) return false;
  } else {
    const kinds = FILTER_KINDS[filters.kind];
    if (kinds && !kinds.includes(trophy.kind)) return false;
  }
  if (filters.query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    const words = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.every((word) => haystack.includes(word))) return false;
  }
  return true;
}

export function countByGrade(trophies, earned) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (earned.has(trophy.id)) counts[trophy.grade] += 1;
  }
  return counts;
}

export function totalsByGrade(trophies) {
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) totals[trophy.grade] += 1;
  return totals;
}
