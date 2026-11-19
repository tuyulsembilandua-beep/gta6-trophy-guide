// Boot: load the trophy list, restore saved progress, wire the tabs and the
// toolbar, and keep every view in step when progress changes.
import { loadTrophyData, trophyById } from './data.js';
import { loadSavedState, saveState, exportProgress, importProgressFile } from './store.js';
import { trophyMatches, countByGrade, totalsByGrade } from './filters.js';
import { renderTrophyList, renderDetailPane } from './views.js';
import { renderRoadmap, renderMissables, renderSourceList } from './roadmap.js';

const state = loadSavedState();
const filters = { query: '', kind: 'all', grade: 'all' };
let trophies = [];
let sourcesTable = {};
let currentView = 'tracker';

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const statusEl = $('listStatus');
const detailPane = $('detailPane');

function refreshAll() {
  const earned = state.earned;
  const totals = totalsByGrade(trophies);
  const counts = countByGrade(trophies, earned);
  $('earnedCount').textContent = String(earned.size);
  $('progressFill').style.width = `${Math.round((earned.size / 55) * 100)}%`;
  $('progressNote').textContent = earned.size === 55
    ? 'Platinum! Every trophy earned — Vice Got a Price! is yours.'
    : `${Math.round((earned.size / 55) * 100)}% to the platinum — ${55 - earned.size} trophies to go.`;
  $('countPlatinum').textContent = `${counts.platinum} / ${totals.platinum}`;
  $('countGold').textContent = `${counts.gold} / ${totals.gold}`;
  $('countSilver').textContent = `${counts.silver} / ${totals.silver}`;
  $('countBronze').textContent = `${counts.bronze} / ${totals.bronze}`;
  $('missableCount').textContent = String(trophies.filter((t) => t.missable).length);

  const visible = trophies.filter((t) => trophyMatches(t, filters, earned));
  renderTrophyList(listEl, statusEl, visible, state, filters, toggleEarned, selectTrophy);
  renderDetailPane(detailPane, trophies, sourcesTable, state, toggleEarned);
  renderRoadmap($('roadmap'), trophies, earned);
  renderMissables($('missableGroups'), trophies);
  saveState(state);
}

function toggleEarned(id, earned) {
  if (earned) state.earned.add(id);
  else state.earned.delete(id);
  refreshAll();
}

function selectTrophy(id) {
  state.selectedId = id;
  saveState(state);
  renderTrophyList(listEl, statusEl, trophies.filter((t) => trophyMatches(t, filters, state.earned)), state, filters, toggleEarned, selectTrophy);
  renderDetailPane(detailPane, trophies, sourcesTable, state, toggleEarned);
  detailPane.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function showView(view) {
  currentView = view;
  for (const button of document.querySelectorAll('#tabs .tab')) {
    const active = button.dataset.view === view;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('active', section.id === `view-${view}`);
  }
}

function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (view && document.getElementById(`view-${view}`)) showView(view);
  const trophyId = Number(params.get('trophy'));
  if (Number.isInteger(trophyId) && trophyById(trophies, trophyId)) {
    state.selectedId = trophyId;
  }
  if (params.get('spoilers') === 'on') {
    state.spoilersHidden = true;
    $('spoilerToggle').checked = true;
  }
}

async function boot() {
  try {
    const data = await loadTrophyData();
    trophies = data.trophies;
    sourcesTable = data.sources ?? {};
  } catch (error) {
    listEl.innerHTML = '<li class="empty-list">The trophy list could not be loaded. Check that app/data/trophies.json is beside this page and reload.</li>';
    statusEl.textContent = 'Failed to load the trophy list.';
    return;
  }

  $('spoilerToggle').checked = state.spoilersHidden;
  renderSourceList($('sourceList'), sourcesTable);

  for (const button of document.querySelectorAll('#tabs .tab')) {
    button.addEventListener('click', () => showView(button.dataset.view));
  }
  for (const chip of document.querySelectorAll('#kindChips .chip')) {
    chip.addEventListener('click', () => {
      filters.kind = chip.dataset.kind;
      for (const other of document.querySelectorAll('#kindChips .chip')) {
        other.classList.toggle('active', other === chip);
      }
      refreshAll();
    });
  }
  $('searchInput').addEventListener('input', (event) => {
    filters.query = event.target.value.trim();
    refreshAll();
  });
  $('gradeSelect').addEventListener('change', (event) => {
    filters.grade = event.target.value;
    refreshAll();
  });
  $('spoilerToggle').addEventListener('change', (event) => {
    state.spoilersHidden = event.target.checked;
    refreshAll();
  });
  $('exportBtn').addEventListener('click', () => exportProgress(state, trophies));
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importProgressFile(file);
      state.earned = new Set([...imported].filter((id) => trophyById(trophies, id)));
      refreshAll();
      statusEl.textContent = `Imported ${state.earned.size} earned trophies from ${file.name}.`;
    } catch (error) {
      statusEl.textContent = error.message;
    }
    event.target.value = '';
  });

  applyUrlParams();
  refreshAll();
}

boot();
