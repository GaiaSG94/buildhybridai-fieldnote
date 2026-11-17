import type { FieldNote } from '../core/types';
import type { LocalRun } from '../models';

/** Card for a single note (badge + enrichment + body). */
export function renderNote(note: FieldNote, run?: LocalRun): HTMLElement {
  const card = document.createElement('article');
  card.className = 'note';
  card.appendChild(renderHeader(note, run));
  appendBlock(card, 'note-body', note.body);
  if (note.localSummary) {
    appendBlock(card, 'note-local', `LOCAL — ${note.localSummary}`);
  }
  if (note.localTranslation) {
    appendBlock(card, 'note-local muted', `TRANSLATION — ${note.localTranslation}`);
  }
  if (note.cloudSummary) {
    const keywords = note.cloudKeywords?.length ? ` (${note.cloudKeywords.join(', ')})` : '';
    appendBlock(card, 'note-cloud', `CLOUD — ${note.cloudSummary}${keywords}`);
  }
  return card;
}

const renderHeader = (note: FieldNote, run?: LocalRun): HTMLElement => {
  const header = document.createElement('header');
  const badge = document.createElement('span');
  const source = run?.source ?? (note.cloudSummary ? 'in_cloud' : 'on_device');
  badge.dataset.source = source;
  badge.textContent = source === 'on_device' ? 'LOCAL' : 'CLOUD';
  const date = document.createElement('time');
  date.textContent = new Date(note.createdAt).toLocaleString();
  const sync = document.createElement('span');
  sync.className = 'sync';
  sync.textContent = note.synced ? 'synced' : 'offline queue';
  header.append(badge, date, sync);
  return header;
};

const appendBlock = (card: HTMLElement, className: string, text: string): void => {
  const block = document.createElement('p');
  block.className = className;
  block.textContent = text;
  card.appendChild(block);
};

/** Render the pending-sync counter and the online/offline dot. */
export function renderStatusBar(online: boolean, pending: number): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'statusbar';
  const dot = document.createElement('span');
  dot.dataset.online = String(online);
  dot.textContent = online ? 'online' : 'offline';
  const counter = document.createElement('span');
  counter.textContent = `${pending} note(s) waiting for sync`;
  bar.append(dot, counter);
  return bar;
}
