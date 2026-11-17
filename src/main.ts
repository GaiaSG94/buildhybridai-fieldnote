import './ui/style.css';
import { loadConfig } from './config';
import { initFirebase } from './firebase';
import { createModels, runLocal, runCloud, type FieldnoteModels } from './models';
import { loadNotes, saveNotes } from './store/notes';
import {
  applyCloudEnrichment,
  applyLocalEnrichment,
  byRecency,
  createNote,
  markSynced,
  pendingSync,
} from './core/note';
import { search } from './core/search';
import { renderNote, renderStatusBar } from './ui/note-card';
import type { FieldNote } from './core/types';

export interface UiElements {
  form: HTMLFormElement;
  body: HTMLTextAreaElement;
  language: HTMLSelectElement;
  searchInput: HTMLInputElement;
  cloudToggle: HTMLInputElement;
  feed: HTMLElement;
  status: HTMLElement;
  notice: HTMLElement;
}

const elements = (): UiElements => ({
  form: requireEl('#note-form'),
  body: requireEl('#note-body'),
  language: requireEl('#note-language'),
  searchInput: requireEl('#search'),
  cloudToggle: requireEl('#cloud-toggle'),
  feed: requireEl('#feed'),
  status: requireEl('#status'),
  notice: requireEl('#notice'),
});

const requireEl = <T extends HTMLElement>(selector: string): T => {
  const found = document.querySelector<T>(selector);
  if (!found) {
    throw new Error(`missing element: ${selector}`);
  }
  return found;
};

let models: FieldnoteModels | null = null;
let notes: FieldNote[] = [];

export function mount(): void {
  const ui = elements();
  const config = loadConfig();
  const bundle = initFirebase(config);
  if (!bundle) {
    setNotice(ui, 'Firebase is not configured: copy .env.example to .env.local.');
    ui.form.addEventListener('submit', (event) => event.preventDefault());
    return;
  }
  models = createModels(bundle.ai, config.cloudModel);
  void loadNotes(bundle.app)
    .then((remote) => {
      notes = remote;
      refresh(ui);
    })
    .catch(() => refresh(ui));

  bindCreate(ui, bundle.app, config.targetLanguage);
  bindSearch(ui);
  bindOnline(ui);
  bindSync(ui, bundle.app);
}

const bindCreate = (ui: UiElements, app: Parameters<typeof saveNotes>[0], language: string): void => {
  ui.form.addEventListener('submit', (event) => {
    event.preventDefault();
    void (async () => {
      const body = ui.body.value;
      if (!body.trim() || !models) {
        return;
      }
      const note = createNote({ body, now: Date.now() });
      try {
        const run = await runLocal(models, note.body, ui.language.value || language);
        notes = [applyLocalEnrichment(note, run), ...notes];
        setNotice(ui, `${run.source === 'on_device' ? 'on-device' : 'cloud fallback'} - ${run.latencyMs} ms`);
        if (navigator.onLine && ui.cloudToggle.checked) {
          const cloud = await runCloud(models, note.body);
          notes[0] = applyCloudEnrichment(notes[0], cloud);
        }
        ui.body.value = '';
        refresh(ui);
        void flush(ui, app);
      } catch (error) {
        setNotice(ui, `local pass failed: ${describe(error)}`);
      }
    })();
  });
};

const bindSearch = (ui: UiElements): void => {
  ui.searchInput.addEventListener('input', () => refresh(ui));
};

const bindOnline = (ui: UiElements): void => {
  window.addEventListener('online', () => refresh(ui));
  window.addEventListener('offline', () => refresh(ui));
};

const bindSync = (ui: UiElements, app: Parameters<typeof saveNotes>[0]): void => {
  window.addEventListener('online', () => void flush(ui, app));
};

async function flush(ui: UiElements, app: Parameters<typeof saveNotes>[0]): Promise<void> {
  const pending = pendingSync(notes);
  if (!pending.length || !navigator.onLine) {
    return;
  }
  try {
    const ids = await saveNotes(app, pending);
    notes = markSynced(notes, ids);
    refresh(ui);
  } catch (error) {
    setNotice(ui, `sync failed (kept in queue): ${describe(error)}`);
  }
}

function refresh(ui: UiElements): void {
  const query = ui.searchInput.value.trim();
  const visible = query
    ? search(notes, query)
        .map((hit) => notes.find((note) => note.id === hit.id))
        .filter((note): note is FieldNote => Boolean(note))
    : byRecency(notes);
  ui.feed.replaceChildren(...visible.map((note) => renderNote(note)));
  ui.status.replaceChildren(renderStatusBar(navigator.onLine, pendingSync(notes).length));
}

function setNotice(ui: UiElements, message: string | null): void {
  ui.notice.textContent = message ?? '';
  ui.notice.hidden = !message;
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

if (document.getElementById('app')) {
  mount();
}
