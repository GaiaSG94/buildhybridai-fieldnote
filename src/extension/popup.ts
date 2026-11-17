import '../ui/style.css';
import { loadConfig } from '../config';
import { initFirebase } from '../firebase';
import { createModels, runLocal } from '../models';
import { createNote } from '../core/note';
import { saveNotes } from '../store/notes';

/** Chrome extension popup: capture a note and summarize it on the device. */
const body = document.querySelector<HTMLTextAreaElement>('#note-body');
const saveButton = document.querySelector<HTMLButtonElement>('#save');
const notice = document.querySelector<HTMLElement>('#notice');
const summary = document.querySelector<HTMLElement>('#summary');

const config = loadConfig();
const bundle = initFirebase(config);

const show = (message: string | null): void => {
  if (!notice) {
    return;
  }
  notice.textContent = message ?? '';
  notice.hidden = !message;
};

saveButton?.addEventListener('click', () => {
  void (async () => {
    if (!body?.value.trim()) {
      show('Write something first.');
      return;
    }
    if (!bundle) {
      show('Firebase is not configured.');
      return;
    }
    const models = createModels(bundle.ai, config.cloudModel);
    const note = createNote({ body: body.value, now: Date.now() });
    saveButton.disabled = true;
    try {
      const run = await runLocal(models, note.body, config.targetLanguage);
      if (summary) {
        summary.textContent = `${run.source === 'on_device' ? 'LOCAL' : 'CLOUD'} — ${run.summary}`;
      }
      show(`${run.latencyMs} ms`);
      if (navigator.onLine) {
        await saveNotes(bundle.app, [note]);
        show(`${run.latencyMs} ms â€” synced`);
      } else {
        show(`${run.latencyMs} ms â€” kept offline, sync later from the web app`);
      }
    } catch (error) {
      show(error instanceof Error ? error.message : String(error));
    } finally {
      saveButton.disabled = false;
    }
  })();
});
