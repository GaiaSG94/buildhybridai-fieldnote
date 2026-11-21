import type { FieldNote } from '../../core/types';
import { drawCross, drawOrbits, drawTag } from '../hud';
import { activeNote, BEAM, buildReadout, el, flushSvg, paint, type Cam, type OverlayEls } from '../page-kit';
import { clockOf, displayNumber, stonesFor } from '../layout';
import { HUD_GREY, HUD_ICE, HUD_RED } from '../scene';

export const CAM_NOTES: Cam = { ro: [0, 1.05, 7.4], ta: [0.15, 1.75, 0], fov: 44 };

export interface PageCtx {
  notes: FieldNote[];
  sendingId: string | null;
  online: boolean;
  now: number;
  query: string;
}

export const notesCounter = (ctx: PageCtx): string => {
  const views = stonesFor(ctx.notes, { sendingId: ctx.sendingId });
  const synced = ctx.notes.filter((n) => n.synced).length;
  return `<b>${String(views.length).padStart(2, '0')}</b> / ${String(ctx.notes.length).padStart(2, '0')} IN ORBIT · <b>${String(synced).padStart(2, '0')}</b> SYNCED`;
};

const headline = (root: HTMLElement, offline: boolean): void => {
  const hl = el('div', offline ? 'hl off' : 'hl');
  const small = el('small');
  small.textContent = offline
    ? 'THE UPLINK IS DOWN. THE NOTEBOOK IS NOT.'
    : 'ON DEVICE FIRST. CLOUD WHEN THE SIGNAL RETURNS.';
  const h1 = el('h1');
  h1.innerHTML = offline
    ? 'No signal.<br><b>Nothing stops.</b>'
    : 'Every note is summarized <b>here</b>,<br>then lifted to the cloud.';
  hl.append(small, h1);
  root.appendChild(hl);
};

const readoutData = (ctx: PageCtx, offline: boolean) => {
  const note = activeNote(ctx.notes, ctx.sendingId);
  if (!note) return null;
  const synced = Boolean(note.cloudSummary);
  const status = ctx.sendingId === note.id ? 'LOCKED · SENDING' : synced ? 'SYNCED · CLOUD' : 'SAVED · LOCAL';
  const sections = [];
  if (note.localSummary) {
    const ms = note.localLatencyMs ? ` · ${note.localLatencyMs} MS` : '';
    sections.push({ label: `SUMMARY · ON DEVICE${ms}`, text: note.localSummary });
  }
  if (note.localTranslation) {
    sections.push({ label: `→ ${note.translationLanguage ?? 'EN'}`, text: note.localTranslation });
  }
  return {
    head: `${displayNumber(ctx.notes, note.id)} · ${clockOf(note.createdAt)}`,
    status,
    body: note.body,
    sections,
    lat: offline
      ? { device: `${note.localLatencyMs ?? '—'} ms`, cloud: 'when online' }
      : undefined,
  };
};

/** Page 01 Notes and page 05 Offline (same scene, beam off, cloud asleep). */
export const renderNotes = (frame: OverlayEls & { canvas: HTMLCanvasElement; page: HTMLElement }, ctx: PageCtx, offline: boolean): void => {
  frame.page.replaceChildren();
  if (offline) {
    const banner = el('div', 'banner');
    const dot = el('i');
    banner.append(dot, document.createTextNode('NO SIGNAL · ON-DEVICE MODE'));
    frame.page.appendChild(banner);
  }
  headline(frame.page, offline);
  const data = readoutData(ctx, offline);
  if (data) buildReadout(frame.page, data, offline ? 320 : 300);

  const views = stonesFor(ctx.notes, { offline, sendingId: ctx.sendingId });
  const svg: string[] = [];
  const proj = paint(frame.canvas, CAM_NOTES, offline ? 0 : 1, views.map((v) => v.stone));
  const focus = views.find((v) => (offline ? v.stone.s === 0 && v.stone.o![0] === 0 : v.stone.s === 1));
  views.forEach((v) => {
    const [x, y] = drawTag(
      proj,
      { p: v.stone.p, o: v.stone.o!, s: v.stone.s, dim: v.stone.dim, id: displayNumber(ctx.notes, v.note.id), t: clockOf(v.note.createdAt), l: v.label },
      frame.tags,
      svg,
    );
    if (v === focus) {
      drawCross(x, y, svg);
      const read = el('div', 'read');
      read.style.left = `${x + 66}px`;
      read.style.top = `${y - 62}px`;
      read.innerHTML = offline
        ? `${displayNumber(ctx.notes, v.note.id)} · SUMMARIZED ON DEVICE<br>${v.note.localLatencyMs ?? '—'} MS · NO NETWORK USED`
        : `TARGET · ${displayNumber(ctx.notes, v.note.id)}<br>UPLOADING TO NOTEBOOK<br>THEN CLOUD ENRICHMENT`;
      frame.tags.appendChild(read);
      svg.push(`<path d="M${x + 58} ${y + 40} L1060 ${y + 40} L1104 400" stroke="${HUD_RED}" stroke-opacity=".6" fill="none"/>`);
    }
  });
  if (offline) {
    const b0 = proj([0, 0.1, 0.15]);
    const b1 = proj([0, 6, 0.15]);
    svg.push(`<line x1="${b0[0]}" y1="${b0[1]}" x2="${b1[0]}" y2="${b1[1]}" stroke="${HUD_GREY}" stroke-opacity=".5" stroke-dasharray="4 8"/>`);
    const m = proj([0, 2, 0.15]);
    const read = el('div', 'read');
    read.style.color = HUD_GREY;
    read.style.left = `${m[0] + 12}px`;
    read.style.top = `${m[1]}px`;
    read.textContent = 'UPLINK · OFF';
    frame.tags.appendChild(read);
    drawOrbits(proj, BEAM, [[0.6, 1.35, HUD_RED, 0.3], [2.8, 1.4, HUD_GREY]], svg);
  } else {
    drawOrbits(proj, BEAM, [[0.6, 1.35, HUD_RED], [1.6, 1.0, HUD_RED], [2.8, 1.4, HUD_ICE]], svg);
  }
  flushSvg(frame, svg);
};
