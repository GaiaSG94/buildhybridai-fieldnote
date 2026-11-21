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
const result = document.querySelector<HTMLElement>('#result');
const source = document.querySelector<HTMLElement>('#source');
const latency = document.querySelector<HTMLElement>('#latency');
const summary = document.querySelector<HTMLElement>('#summary');
const translation = document.querySelector<HTMLElement>('#translation');
const foot = document.querySelector<HTMLElement>('#foot');
const stamp = document.querySelector<HTMLElement>('#stamp');

const config = loadConfig();
const bundle = initFirebase(config);

const clock = (): string => {
  const d = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const show = (message: string | null): void => {
  if (!notice) {
    return;
  }
  notice.textContent = message ?? '';
  notice.hidden = !message;
};

if (foot) {
  foot.textContent = navigator.onLine
    ? 'ONLINE · SAVED AND SENT TO THE SYNC QUEUE'
    : 'OFFLINE · KEPT ON THE DEVICE, SYNC LATER';
}

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
      if (stamp) stamp.textContent = `NEW · ${clock()}`;
      if (result && source && latency && summary && translation) {
        result.hidden = false;
        source.textContent = run.source === 'on_device' ? 'LOCAL · GEMINI NANO' : 'CLOUD · GEMINI';
        latency.textContent = `${run.latencyMs} MS`;
        summary.textContent = run.summary ?? '';
        translation.textContent = run.translation ? `→ ${run.translation}` : '';
      }
      if (navigator.onLine) {
        await saveNotes(bundle.app, [note]);
        show(`${run.latencyMs} ms — synced`);
      } else {
        show(`${run.latencyMs} ms — kept offline, sync later from the web app`);
      }
    } catch (error) {
      show(error instanceof Error ? error.message : String(error));
    } finally {
      saveButton.disabled = false;
    }
  })();
});
