import type { FieldNote, SearchHit } from '../../core/types';
import { tokenOrigins, type TokenOrigin } from '../../core/search';
import { drawBrackets, drawOrbits, drawTag } from '../hud';
import { BEAM, el, flushSvg, paint, type Cam } from '../page-kit';
import type { PageCtx } from './notes';
import { clockOf, displayNumber, stonesFor } from '../layout';
import { HUD_ICE, HUD_RED } from '../scene';

const CAM_SEARCH: Cam = { ro: [-1.6, 1.05, 7.4], ta: [-0.6, 1.75, 0], fov: 44 };

const ORIGIN_LABEL: Record<TokenOrigin, string> = {
  text: 'NOTE TEXT',
  local: 'ON-DEVICE SUMMARY',
  cloud_summary: 'CLOUD SUMMARY',
  keyword: 'CLOUD KEYWORD',
};

const ORIGIN_CLASS: Record<TokenOrigin, string> = {
  text: '',
  local: 'd',
  cloud_summary: 'c',
  keyword: 'c',
};

const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

/** Note text with the matched terms underlined in red. */
const marked = (text: string, terms: string[]): string => {
  let out = escapeHtml(text);
  for (const term of terms) {
    const re = new RegExp(`(${escapeHtml(term)})`, 'gi');
    out = out.replace(re, '<mark>$1</mark>');
  }
  return out;
};

export const searchCounter = (ctx: PageCtx, hits: SearchHit[]): string =>
  `<b>${String(hits.length).padStart(2, '0')}</b> / ${String(ctx.notes.length).padStart(2, '0')} MATCH`;

const queryBox = (root: HTMLElement, ctx: PageCtx, onQuery: (q: string) => void): HTMLInputElement => {
  const box = el('div', 'query');
  const small = el('small', undefined, 'SEARCH ALL NOTES · RUNS ON THIS DEVICE');
  const field = el('div', 'f');
  const slash = el('span', undefined, '/');
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'search the notebook';
  input.value = ctx.query;
  input.setAttribute('aria-label', 'Search notes');
  input.addEventListener('input', () => onQuery(input.value));
  field.append(slash, input);
  const meta = el('div', 'meta');
  meta.innerHTML = `<span><b>—</b> NOTES FOUND</span><span>LOOKS IN · NOTE TEXT · ON-DEVICE SUMMARY · CLOUD SUMMARY · CLOUD KEYWORDS</span>`;
  box.append(small, field, meta);
  root.appendChild(box);
  return input;
};

const sourceChips = (container: HTMLElement, origins: Map<string, TokenOrigin[]>): void => {
  const src = el('div', 'src');
  const seen = new Set<string>();
  for (const [term, list] of origins) {
    for (const origin of list) {
      const key = `${term}:${origin}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const chip = el('span', ORIGIN_CLASS[origin], `${term.toUpperCase()} · ${ORIGIN_LABEL[origin]}`);
      src.appendChild(chip);
    }
  }
  container.appendChild(src);
};

const hitCard = (root: HTMLElement, ctx: PageCtx, note: FieldNote, hit: SearchHit, best: boolean): void => {
  const card = el('article', best ? 'hit best' : 'hit');
  const head = el('div', 'h');
  const badge = note.synced ? 'CLOUD' : 'LOCAL';
  head.innerHTML = `<span><b>${displayNumber(ctx.notes, note.id)}</b> · ${clockOf(note.createdAt)} · ${badge}</span>`;
  const total = hit.score > 0 ? Math.round(hit.matched.length / hit.score) : hit.matched.length;
  const score = el('span', 'sc', `${hit.matched.length} / ${total} TERMS`);
  head.appendChild(score);
  card.appendChild(head);
  const body = el('p');
  body.innerHTML = `“${marked(note.body, hit.matched)}”`;
  card.appendChild(body);
  if (note.localSummary) {
    const summary = el('p', 's');
    summary.innerHTML = marked(note.localSummary, hit.matched);
    card.appendChild(summary);
  }
  sourceChips(card, tokenOrigins(note, hit.matched));
  root.appendChild(card);
};

/** Page 04 - offline search, honest token-overlap scoring (no embeddings). */
export const renderSearch = (
  frame: { canvas: HTMLCanvasElement; svg: SVGSVGElement; tags: HTMLElement; page: HTMLElement },
  ctx: PageCtx,
  hits: SearchHit[],
  onQuery: (q: string) => void,
): void => {
  frame.page.replaceChildren();
  const input = queryBox(frame.page, ctx, onQuery);
  const meta = frame.page.querySelector('.query .meta b');
  if (meta) meta.textContent = String(hits.length).padStart(2, '0');

  const res = el('div', 'res');
  hits.forEach((hit, i) => {
    const note = ctx.notes.find((n) => n.id === hit.id);
    if (note) hitCard(res, ctx, note, hit, i === 0);
  });
  frame.page.appendChild(res);

  const side = el('div', 'side-note');
  side.innerHTML = 'The match runs <b>on this device</b>: note text, on-device summaries and cloud keywords. No embeddings, no network.';
  frame.page.appendChild(side);

  const hitIds = new Set(hits.map((h) => h.id));
  const views = stonesFor(ctx.notes, { sendingId: ctx.sendingId });
  const svg: string[] = [];
  const proj = paint(frame.canvas, CAM_SEARCH, 0.3, views.map((v) => v.stone));
  const positioned: [number, number, boolean][] = [];
  views.forEach((v) => {
    const isHit = hitIds.has(v.note.id) && ctx.query.trim().length > 0;
    const [x, y] = drawTag(
      proj,
      {
        p: v.stone.p,
        o: v.stone.o!,
        s: v.stone.s,
        dim: v.stone.dim || (!isHit && ctx.query.trim().length > 0),
        id: displayNumber(ctx.notes, v.note.id),
        t: clockOf(v.note.createdAt),
        l: isHit ? [v.label[0], hitLabel(v.note.id, hits)] : v.label,
      },
      frame.tags,
      svg,
    );
    if (isHit) {
      drawBrackets(x, y, v.stone.s === 2 ? 40 : 32, svg, v.stone.s === 2 ? HUD_ICE : HUD_RED);
      positioned.push([x, y, v.stone.s === 2]);
    }
  });
  positioned.slice(0, 2).forEach(([x, y, cloud], i) => {
    const color = cloud ? HUD_ICE : HUD_RED;
    const tx = i === 0 ? 984 : 1002;
    const ty = i === 0 ? 330 : 520;
    svg.push(`<path d="M${x + 40} ${y} L${tx} ${y} L${tx} ${ty}" stroke="${color}" stroke-opacity=".45" fill="none"/>`);
  });
  drawOrbits(proj, BEAM, [[0.6, 1.35, HUD_RED, 0.12], [1.6, 1.0, HUD_RED, 0.12], [2.8, 1.4, HUD_ICE, 0.12]], svg);
  flushSvg(frame, svg);
  input.focus();
};

const hitLabel = (id: string, hits: SearchHit[]): string => {
  const hit = hits.find((h) => h.id === id);
  if (!hit) return '';
  const total = hit.score > 0 ? Math.round(hit.matched.length / hit.score) : hit.matched.length;
  return `${hit.matched.length} / ${total}`;
};
