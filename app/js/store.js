// Saved progress: localStorage only, plus export to a file and import back.
const STORAGE_KEY = 'leonida-trophy-guide-v1';

export function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return freshState();
    return {
      earned: new Set(Array.isArray(parsed.earned) ? parsed.earned : []),
      spoilersHidden: parsed.spoilersHidden === true,
      selectedId: typeof parsed.selectedId === 'number' ? parsed.selectedId : null,
    };
  } catch {
    return freshState();
  }
}

export function freshState() {
  return { earned: new Set(), spoilersHidden: false, selectedId: null };
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      earned: [...state.earned].sort((a, b) => a - b),
      spoilersHidden: state.spoilersHidden,
      selectedId: state.selectedId,
    }));
  } catch {
    // Private mode or a full store: the checklist still works for this visit.
  }
}

export function exportProgress(state, trophies) {
  const payload = {
    app: 'Leonida Trophy Guide',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
    earnedNames: trophies.filter((t) => state.earned.has(t.id)).map((t) => t.name),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importProgressFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const ids = Array.isArray(parsed.earned) ? parsed.earned : parsed;
        if (!Array.isArray(ids)) throw new Error('Not a progress file.');
        resolve(new Set(ids.filter((id) => Number.isInteger(id))));
      } catch (error) {
        reject(new Error('That file is not a Leonida Trophy Guide progress export.'));
      }
    };
    reader.readAsText(file);
  });
}
