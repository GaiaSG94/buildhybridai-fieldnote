import type { FieldNote } from '../../core/types';
import { drawBrackets, drawOrbits, drawTag } from '../hud';
import { BEAM, el, flushSvg, paint, type Cam } from '../page-kit';
import type { PageCtx } from './notes';
import { clockOf, displayNumber, queueOldestFirst, stonesFor, syncedRecentFirst } from '../layout';
import { HUD_ICE, HUD_RED } from '../scene';

const CAM_QUEUE: Cam = { ro: [-2.7, 1.1, 7.2], ta: [-1.25, 1.75, 0], fov: 44 };

export const queueCounter = (ctx: PageCtx): string => {
  const queue = queueOldestFirst(ctx.notes);
  const synced = ctx.notes.filter((n) => n.synced).length;
  return `<b>${String(queue.length).padStart(2, '0')}</b> IN QUEUE · <b>${String(synced).padStart(2, '0')}</b> SYNCED TODAY`;
};

const stateBadge = (note: FieldNote, sendingId: string | null): HTMLElement => {
  const st = el('span', 'st');
  if (note.id === sendingId) {
    st.classList.add('s');
    st.textContent = 'SENDING';
  } else if (note.synced) {
    st.classList.add('c');
    st.textContent = 'CLOUD';
  } else {
    st.classList.add('l');
    st.textContent = 'LOCAL';
  }
  return st;
};

const row = (cells: HTMLElement[], className?: string): HTMLElement => {
  const tr = el('tr', className);
  tr.append(...cells);
  return tr;
};

const textCell = (body: string, summary: string | undefined): HTMLElement => {
  const td = el('td');
  td.appendChild(el('span', 'x', `“${body}”`));
  if (summary) td.appendChild(el('span', 'y', summary));
  return td;
};

const table = (root: HTMLElement, ctx: PageCtx): void => {
  const queue = queueOldestFirst(ctx.notes);
  const done = syncedRecentFirst(ctx.notes).slice(0, 5);
  const wrap = el('section', 'qtable');
  const cap = el('div', 'cap');
  cap.innerHTML = `<span>NOTES WAITING ON THIS DEVICE</span><span><b>${queue.length}</b> TO SEND · BATCH WRITE</span>`;
  wrap.appendChild(cap);
  const t = el('table');
  const head = el('tr');
  for (const label of ['#', 'NOTE', 'CREATED', 'ON DEVICE', 'STATE', 'CLOUD']) {
    head.appendChild(el('th', undefined, label));
  }
  t.appendChild(head);
  queue.forEach((note, i) => {
    const rank = el('td', 'n', String(i + 1).padStart(2, '0'));
    const created = el('td', 'm', clockOf(note.createdAt));
    const ms = note.localLatencyMs ? `${note.localLatencyMs} ms` : '—';
    const latency = el('td', 'm', ms);
    const state = el('td');
    state.appendChild(stateBadge(note, ctx.sendingId));
    const cloud = el('td', 'm', '—');
    t.appendChild(row([rank, textCell(note.body, note.localSummary), created, latency, state, cloud], note.id === ctx.sendingId ? 'active' : undefined));
  });
  if (done.length) {
    t.appendChild(row([el('td', undefined, 'SYNCED AND ENRICHED TODAY')], 'sep'));
    done.forEach((note) => {
      const number = el('td', 'n', displayNumber(ctx.notes, note.id));
      const created = el('td', 'm', clockOf(note.createdAt));
      const ms = note.localLatencyMs ? `${note.localLatencyMs} ms` : '—';
      const latency = el('td', 'm', ms);
      const state = el('td');
      state.appendChild(stateBadge(note, null));
      const cloudMs = note.cloudLatencyMs ? `${(note.cloudLatencyMs / 1000).toFixed(1)} s` : '—';
      const cloud = el('td', 'm', cloudMs);
      t.appendChild(row([number, textCell(note.body, note.cloudKeywords?.join(' · ') ?? note.cloudSummary), created, latency, state, cloud], 'done'));
    });
  }
  wrap.appendChild(t);
  root.appendChild(wrap);
};

const pipeline = (root: HTMLElement): void => {
  const pipe = el('div', 'pipe');
  const device = el('div', 'd');
  device.innerHTML = 'ON DEVICE · GEMINI NANO<b>Summary + translation</b>';
  const arrow1 = el('div', 'ar');
  const firestore = el('div');
  firestore.innerHTML = 'FIRESTORE · BATCH WRITE<b>Note saved to the notebook</b>';
  const arrow2 = el('div', 'ar');
  const cloud = el('div', 'c');
  cloud.innerHTML = 'CLOUD · GEMINI<b>Keywords + fuller summary</b>';
  const rc = el('div', 'rc');
  rc.innerHTML = 'CLOUD ENRICHMENT<u>ON</u><br>SET IN REMOTE CONFIG';
  pipe.append(device, arrow1, firestore, arrow2, cloud, rc);
  root.appendChild(pipe);
};

/** Page 03 - the sync queue, oldest first, draining into the beam. */
export const renderQueue = (frame: { canvas: HTMLCanvasElement; svg: SVGSVGElement; tags: HTMLElement; page: HTMLElement }, ctx: PageCtx): void => {
  frame.page.replaceChildren();
  const hl = el('div', 'hl q');
  hl.innerHTML = '<small>SYNC QUEUE · OLDEST FIRST</small><h1>The queue empties itself <b>as soon as</b> the signal comes back.</h1>';
  frame.page.appendChild(hl);
  table(frame.page, ctx);
  pipeline(frame.page);

  const queue = queueOldestFirst(ctx.notes);
  const views = stonesFor(ctx.notes, { sendingId: ctx.sendingId });
  const svg: string[] = [];
  const proj = paint(frame.canvas, CAM_QUEUE, 1, views.map((v) => v.stone));
  const waiting = views.filter((v) => v.stone.s === 0).map((v) => v.stone.p);
  views.forEach((v) => {
    const [x, y] = drawTag(proj, { p: v.stone.p, o: v.stone.o!, s: v.stone.s, dim: v.stone.dim, id: displayNumber(ctx.notes, v.note.id), t: clockOf(v.note.createdAt), l: v.label }, frame.tags, svg);
    if (v.stone.s === 1) {
      drawBrackets(x, y, 34, svg);
      const read = el('div', 'read');
      read.style.left = `${x + 44}px`;
      read.style.top = `${y - 26}px`;
      read.innerHTML = `01 · ${displayNumber(ctx.notes, v.note.id)} · SENDING<br>NEXT: ${queue.length > 1 ? displayNumber(ctx.notes, queue[1].id) : '—'}`;
      frame.tags.appendChild(read);
    }
  });
  if (waiting.length) {
    const path = [...waiting].reverse().map((p) => proj(p));
    const topP = proj([0, 2.2, 0.15]);
    svg.push(`<path d="M${path.map((p) => p.join(' ')).join(' L')} L${topP.join(' ')}" fill="none" stroke="${HUD_RED}" stroke-opacity=".7" stroke-dasharray="2 6"><animate attributeName="stroke-dashoffset" from="16" to="0" dur="1s" repeatCount="indefinite"/></path>`);
  }
  drawOrbits(proj, BEAM, [[0.55, 1.3, HUD_RED], [1.5, 0.95, HUD_RED], [2.9, 1.3, HUD_ICE]], svg);
  flushSvg(frame, svg);
};
