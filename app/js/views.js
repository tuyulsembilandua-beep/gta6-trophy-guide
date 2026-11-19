// The tracker list and the guide detail pane.
import { KIND_LABELS, gradeLabel } from './data.js';
import { isSpoilerHidden } from './filters.js';

function tagList(trophy) {
  const tags = [`<span class="tag grade-${trophy.grade}">${gradeLabel(trophy.grade)}</span>`];
  // The kind tag is skipped when it would only repeat the grade (the platinum).
  if ((KIND_LABELS[trophy.kind] ?? '').toLowerCase() !== trophy.grade) {
    tags.push(`<span class="tag">${KIND_LABELS[trophy.kind] ?? trophy.kind}</span>`);
  }
  if (trophy.hidden) tags.push('<span class="tag hidden-flag">Hidden</span>');
  if (trophy.missable) tags.push('<span class="tag missable">Missable</span>');
  if (trophy.target) {
    tags.push(`<span class="tag target">PSN target: ${trophy.target.toLocaleString('en-US')}${trophy.targetLabel ? ' ' + trophy.targetLabel : ''}</span>`);
  }
  return tags.join('');
}

function visibleName(trophy, state) {
  return isSpoilerHidden(trophy, state.spoilersHidden, state.earned)
    ? 'Hidden trophy'
    : trophy.name;
}

function visibleDescription(trophy, state) {
  return isSpoilerHidden(trophy, state.spoilersHidden, state.earned)
    ? 'Hidden on PlayStation until earned — turn spoilers off, or earn it, to see it.'
    : trophy.description;
}

export function renderTrophyList(listEl, statusEl, trophies, state, filters, onToggle, onSelect) {
  const shown = trophies.filter((trophy) => {
    if (filters.kind === 'missable') return trophy.missable;
    return true;
  });
  listEl.innerHTML = '';
  if (shown.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-list';
    empty.textContent = 'No trophies match these filters — clear the search or pick another kind.';
    listEl.appendChild(empty);
  }
  for (const trophy of shown) {
    const earned = state.earned.has(trophy.id);
    const row = document.createElement('li');
    row.className = 'trophy-row' + (earned ? ' earned' : '') + (state.selectedId === trophy.id ? ' selected' : '');
    row.dataset.id = String(trophy.id);

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = earned;
    check.setAttribute('aria-label', `Earned: ${visibleName(trophy, state)}`);
    check.addEventListener('click', (event) => {
      event.stopPropagation();
      onToggle(trophy.id, check.checked);
    });

    const medal = document.createElement('span');
    medal.className = `medal ${trophy.grade}`;
    medal.title = gradeLabel(trophy.grade);

    const body = document.createElement('div');
    body.className = 'trophy-body';
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = visibleName(trophy, state);
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = visibleDescription(trophy, state);
    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    tags.innerHTML = tagList(trophy);
    body.append(name, desc, tags);

    row.append(check, medal, body);
    row.addEventListener('click', () => onSelect(trophy.id));
    listEl.appendChild(row);
  }
  const earnedCount = state.earned.size;
  statusEl.textContent = `Showing ${shown.length} of 55 trophies · ${earnedCount} earned · ${55 - earnedCount} to go. Click a trophy to read its guide.`;
}

function sourceListHtml(trophy, sourcesTable) {
  const items = (trophy.sources ?? []).map((key) => {
    const source = sourcesTable[key];
    if (!source) return '';
    return `<li><a href="${source.url}" target="_blank" rel="noopener">${source.name}</a> <span class="covers">— ${source.covers}</span></li>`;
  }).join('');
  return `<div class="detail-sources"><span class="label">Sources — where each fact comes from</span><ul>${items}</ul></div>`;
}

export function renderDetailPane(paneEl, trophies, sourcesTable, state, onToggleEarned) {
  const trophy = trophies.find((t) => t.id === state.selectedId);
  if (!trophy) {
    paneEl.innerHTML = `<div class="detail-empty">
      <h2>Pick a trophy to read its guide</h2>
      <p>Every trophy has a guide in our own words, built from its official description, with its sources named beside it. Story trophies are hidden while “Hide story spoilers” is on.</p>
      <p><strong>55 trophies:</strong> 1 platinum · 2 gold · 6 silver · 46 bronze · 28 hidden on PlayStation until earned · 22 flagged missable.</p>
      <p>Tick the box beside a trophy when you earn it — your progress is saved in this browser.</p>
    </div>`;
    return;
  }
  const earned = state.earned.has(trophy.id);
  const hiddenNow = isSpoilerHidden(trophy, state.spoilersHidden, state.earned);
  if (hiddenNow) {
    // Spoilers on and the trophy not earned yet: the name, the description,
    // the guide and the missable reason all name the mission, so all of them
    // stay hidden. The grade, the kind and the sources are not spoilers.
    paneEl.innerHTML = `
    <div class="trophy-tags">${tagList(trophy)}</div>
    <h2>Hidden trophy</h2>
    <p class="detail-official"><span class="label">Official description (PlayStation)</span>Hidden on PlayStation until earned.</p>
    ${trophy.missable ? '<div class="missable-callout"><strong>Missable.</strong> This one is flagged missable — the reason names the mission, so it stays hidden until you earn it.</div>' : ''}
    <p class="detail-guide"><span class="label">Guide — our own words</span>Hidden while story spoilers are on. Turn the spoiler setting off, or earn this trophy, to read its guide.</p>
    ${sourceListHtml(trophy, sourcesTable)}
    <div class="detail-earned"><button type="button">Mark as earned</button></div>`;
    paneEl.querySelector('.detail-earned button').addEventListener('click', () => onToggleEarned(trophy.id, true));
    return;
  }
  const compactSources = (trophy.sources ?? []).map((key) => {
    const source = sourcesTable[key];
    return source ? `<a href="${source.url}" target="_blank" rel="noopener">${source.name}</a>` : '';
  }).filter(Boolean).join(' · ');
  const missable = trophy.missable
    ? `<div class="missable-callout"><strong>Missable.</strong> ${trophy.missableNote ?? 'The official description names a single mission or moment and no replay is named — keep a manual save before it.'}</div>`
    : '';
  paneEl.innerHTML = `
    <div class="trophy-tags">${tagList(trophy)}</div>
    <h2>${trophy.name}</h2>
    <p class="detail-source-line">Sources: ${compactSources}</p>
    <p class="detail-official"><span class="label">Official description (PlayStation)</span>${trophy.description}</p>
    ${missable}
    <p class="detail-guide"><span class="label">Guide — our own words</span>${trophy.guide}</p>
    ${sourceListHtml(trophy, sourcesTable)}
    <div class="detail-earned"><button type="button" class="${earned ? 'unearn' : ''}">${earned ? '✓ Earned — click to unmark' : 'Mark as earned'}</button></div>`;
  paneEl.querySelector('.detail-earned button').addEventListener('click', () => onToggleEarned(trophy.id, !earned));
}
