import './ui/style.css';
import { loadConfig } from './config';
import { initFirebase, type FirebaseBundle } from './firebase';
import { createModels, runCloud, runLocal, type FieldnoteModels } from './models';
import { loadNotes, saveNotes } from './store/notes';
import {
  applyCloudEnrichment,
  applyLocalEnrichment,
  createNote,
  markSynced,
  pendingSync,
} from './core/note';
import { search } from './core/search';
import type { FieldNote, SearchHit } from './core/types';
import { demoNotes } from './demo';
import { buildFrame, setNav, type FrameHandles } from './ui/frame';
import { buildComposer, languageCode, type ComposerHandles } from './ui/composer';
import { el } from './ui/page-kit';
import { queueOldestFirst, stampOf } from './ui/layout';
import { notesCounter, renderNotes, type PageCtx } from './ui/pages/notes';
import { queueCounter, renderQueue } from './ui/pages/queue';
import { renderSearch, searchCounter } from './ui/pages/search';
import { extensionCounter, renderExtension } from './ui/pages/extension';

interface AppState {
  notes: FieldNote[];
  sendingId: string | null;
  query: string;
  page: string;
  online: boolean;
}

const state: AppState = {
  notes: [],
  sendingId: null,
  query: '',
  page: location.hash.replace('#', '') || '01',
  online: navigator.onLine,
};

let bundle: FirebaseBundle | null = null;
let models: FieldnoteModels | null = null;
let frame: FrameHandles;
let composer: ComposerHandles;
let notice: HTMLElement;

const describe = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const setNotice = (message: string | null): void => {
  notice.textContent = message ?? '';
  notice.hidden = !message;
};

const ctx = (): PageCtx => ({
  notes: state.notes,
  sendingId: state.sendingId,
  online: state.online,
  now: Date.now(),
  query: state.query,
});

const attachShared = (): void => {
  if (state.page === '01' || state.page === '05') {
    frame.page.appendChild(notice);
    frame.page.appendChild(composer.root);
    composer.setNumber(`N°${String(state.notes.length + 1).padStart(3, '0')}`);
    composer.setCloudLabel(state.online ? 'ON' : 'WHEN ONLINE');
  }
};

const offlineCounter = (): string => {
  const waiting = queueOldestFirst(state.notes).length;
  const asleep = state.notes.filter((n) => n.synced).length;
  return `<b>${String(waiting).padStart(2, '0')}</b> WAITING ON DEVICE · <b>${String(asleep).padStart(2, '0')}</b> ASLEEP IN CLOUD`;
};

const refresh = (): void => {
  const hits: SearchHit[] = state.query.trim() ? search(state.notes, state.query) : [];
  if (state.page === '02') {
    renderExtension(frame, ctx());
    frame.count.innerHTML = extensionCounter(ctx());
  } else if (state.page === '03') {
    renderQueue(frame, ctx());
    frame.count.innerHTML = queueCounter(ctx());
  } else if (state.page === '04') {
    renderSearch(frame, ctx(), hits, (query) => {
      state.query = query;
      refresh();
    });
    frame.count.innerHTML = searchCounter(ctx(), hits);
  } else {
    renderNotes(frame, ctx(), state.page === '05');
    frame.count.innerHTML = state.page === '05' ? offlineCounter() : notesCounter(ctx());
  }
  attachShared();
  const stamp = stampOf(Date.now());
  frame.signal.textContent = state.online ? `ONLINE · ${stamp}` : `OFFLINE · NO NETWORK · ${stamp}`;
  frame.signal.classList.toggle('off', !state.online);
  setNav(document, state.page);
};

const goTo = (page: string): void => {
  state.page = page;
  history.replaceState(null, '', `#${page}`);
  refresh();
};

const flush = async (): Promise<void> => {
  const pending = pendingSync(state.notes);
  if (!pending.length || !state.online || !bundle) {
    return;
  }
  state.sendingId = pending[0].id;
  refresh();
  try {
    const ids = await saveNotes(bundle.app, pending);
    state.notes = markSynced(state.notes, ids);
    setNotice(`SYNCED · ${ids.length} NOTE(S) · BATCH WRITE`);
  } catch (error) {
    setNotice(`SYNC FAILED (KEPT IN QUEUE) · ${describe(error)}`);
  }
  state.sendingId = null;
  refresh();
};

const submitNote = async (body: string, language: string, cloudOn: boolean): Promise<void> => {
  if (!models) {
    setNotice('FIREBASE NOT CONFIGURED · COPY .ENV.EXAMPLE TO .ENV.LOCAL');
    return;
  }
  const note = createNote({ body, now: Date.now() });
  composer.clear();
  setNotice(null);
  try {
    const run = await runLocal(models, note.body, language);
    state.notes = [
      applyLocalEnrichment(note, {
        summary: run.summary,
        translation: run.translation,
        language: languageCode(language),
        latencyMs: run.latencyMs,
      }),
      ...state.notes,
    ];
    setNotice(`${run.source === 'on_device' ? 'ON DEVICE' : 'CLOUD FALLBACK'} · ${run.latencyMs} MS`);
    if (state.online && cloudOn) {
      const started = performance.now();
      const cloud = await runCloud(models, note.body);
      state.notes = state.notes.map((n) =>
        n.id === note.id
          ? applyCloudEnrichment(n, { ...cloud, latencyMs: Math.round(performance.now() - started) })
          : n,
      );
    }
    refresh();
    void flush();
  } catch (error) {
    setNotice(`LOCAL PASS FAILED · ${describe(error)}`);
    refresh();
  }
};

export function mount(): void {
  const root = document.getElementById('app');
  if (!root) {
    throw new Error('missing element: #app');
  }
  frame = buildFrame(root, goTo);
  notice = el('div', 'notice');
  notice.hidden = true;
  composer = buildComposer(document.body, submitNote);
  document.body.removeChild(composer.root);

  const config = loadConfig();
  bundle = initFirebase(config);
  if (bundle) {
    models = createModels(bundle.ai, config.cloudModel);
    void loadNotes(bundle.app)
      .then((remote) => {
        state.notes = remote;
        refresh();
      })
      .catch(() => refresh());
  } else {
    state.notes = demoNotes();
    setNotice('SAMPLE DATA · CONFIGURE FIREBASE (.ENV.LOCAL) FOR THE LIVE NOTEBOOK');
  }
  window.addEventListener('online', () => {
    state.online = true;
    refresh();
    void flush();
  });
  window.addEventListener('offline', () => {
    state.online = false;
    refresh();
  });
  refresh();
}

if (document.getElementById('app')) {
  mount();
}
