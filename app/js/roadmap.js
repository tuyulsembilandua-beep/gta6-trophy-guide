// The roadmap to the platinum and the missables page.
// Stages are built from the official descriptions: which story chapters and
// missions, which collectibles and counts, in what order to play them.
import { gradeLabel } from './data.js';

export const ROADMAP_STAGES = [
  {
    title: 'Play the story',
    when: 'First playthrough',
    text: 'Chapters 1–4, the named missions and the finale. The hidden one-off moments listed here happen during the story too — keep a manual save before each named mission and each scene the Missables page lists.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 37, 38, 44, 45, 46, 47, 48, 49, 50, 51],
  },
  {
    title: 'Strangers of Leonida',
    when: 'Alongside the story',
    text: 'Meet the strangers marked around the map and finish their strands. Eight finished strands earn the silver; five of them end in a named finale — Andy, Kenton, Billy, Randy and Tyrone.',
    ids: [22, 23, 24, 25, 26, 27, 29],
  },
  {
    title: 'Explore the state',
    when: 'Free roam, any time',
    text: 'Every area of Leonida, every meditation spot, the collectible card sets, the WAiNK locations, the vehicles you discover — and the ten you register to the Scooter Bros app.',
    ids: [28, 30, 31, 35, 42, 55],
  },
  {
    title: 'Activities & skill',
    when: 'Between missions',
    text: 'Stunts, the shooting range, drone races, races, fishing, the arcade — and the 50 challenges that tie them together. Everything here can be retried, so practise until the golds land.',
    ids: [15, 16, 17, 18, 19, 20, 21, 32],
  },
  {
    title: 'Crime & money',
    when: 'Free roam, any time',
    text: 'Shops, bank vaults, armored trucks, one illegal operation per gang — and the money that follows: launder the marked bills, spend $100,000, buy all eight garages.',
    ids: [33, 34, 36, 39, 40, 41, 43, 52, 53, 54],
  },
  {
    title: 'Cleanup & 100%',
    when: 'Last',
    text: 'When every other box is ticked, the 100% counter tops out — A Long Road pops, and the platinum follows it.',
    ids: [14, 1],
  },
];

export function renderRoadmap(container, trophies, earned) {
  container.innerHTML = '';
  ROADMAP_STAGES.forEach((stage, index) => {
    const stageTrophies = stage.ids.map((id) => trophies.find((t) => t.id === id)).filter(Boolean);
    const done = stageTrophies.filter((t) => earned.has(t.id)).length;
    const card = document.createElement('article');
    card.className = 'stage' + (done === stageTrophies.length ? ' done' : '');
    const items = stageTrophies.map((t) => {
      const isDone = earned.has(t.id);
      return `<li><span class="${isDone ? 'done-mark' : 'todo-mark'}">${isDone ? '✓' : '○'}</span><span><strong>${t.name}</strong> — ${gradeLabel(t.grade)} · ${t.description}</span></li>`;
    }).join('');
    card.innerHTML = `
      <h3><span class="stage-num">${index + 1}</span>${stage.title}</h3>
      <p class="stage-when">${stage.when}</p>
      <p>${stage.text}</p>
      <p class="stage-progress">${done} of ${stageTrophies.length} earned</p>
      <div class="stage-bar"><i style="width:${stageTrophies.length ? Math.round((done / stageTrophies.length) * 100) : 0}%"></i></div>
      <ul class="stage-trophies">${items}</ul>`;
    container.appendChild(card);
  });
}

const MISSABLE_GROUPS = [
  {
    title: 'Named missions — one shot each',
    text: 'The description names a single mission and no replay is named. Finish the mission and the trophy pops; if GTA VI offers no mission replay, there is no second chance. Keep a manual save from before each one.',
    pick: (t) => t.missable && t.kind === 'story' && [8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27].includes(t.id),
  },
  {
    title: 'Hidden one-off moments',
    text: 'Hidden trophies whose descriptions name a single scene, choice or event. The game is a day old and no verified walkthrough exists yet — these are our readings of the official descriptions, flagged so you save before the moment passes.',
    pick: (t) => t.missable && ![8, 9, 10, 11, 12, 13, 22, 23, 24, 26, 27].includes(t.id),
  },
];

export function renderMissables(container, trophies) {
  container.innerHTML = '';
  for (const group of MISSABLE_GROUPS) {
    const items = trophies.filter(group.pick);
    const card = document.createElement('article');
    card.className = 'missable-group';
    const rows = items.map((t) => `<li><span class="m-name">${t.name}</span> <span class="tag grade-${t.grade}">${gradeLabel(t.grade)}</span><span class="m-note">${t.missableNote ?? t.description}</span></li>`).join('');
    card.innerHTML = `<h3>${group.title} (${items.length})</h3><p>${group.text}</p><ul class="missable-list">${rows}</ul>`;
    container.appendChild(card);
  }
}

export function renderSourceList(container, sourcesTable) {
  container.innerHTML = Object.values(sourcesTable).map((source) =>
    `<li><a class="s-name" href="${source.url}" target="_blank" rel="noopener">${source.name}</a><span class="s-covers">${source.covers}</span></li>`,
  ).join('');
}
