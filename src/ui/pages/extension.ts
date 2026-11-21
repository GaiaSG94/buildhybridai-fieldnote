import { drawBrackets, drawOrbits, drawTag } from '../hud';
import { BEAM, el, flushSvg, paint, type Cam } from '../page-kit';
import type { PageCtx } from './notes';
import { clockOf, displayNumber, stonesFor } from '../layout';
import { HUD_ICE, HUD_RED } from '../scene';

const CAM_EXTENSION: Cam = { ro: [-3.1, 1.0, 7.0], ta: [-1.55, 1.65, 0], fov: 44 };

export const extensionCounter = (ctx: PageCtx): string => {
  const views = stonesFor(ctx.notes, { sendingId: ctx.sendingId });
  const synced = ctx.notes.filter((n) => n.synced).length;
  return `<b>${String(views.length).padStart(2, '0')}</b> / ${String(ctx.notes.length).padStart(2, '0')} IN ORBIT · <b>${String(synced).padStart(2, '0')}</b> SYNCED`;
};

const browserWindow = (root: HTMLElement): void => {
  const win = el('section', 'win');
  const bar = el('div', 'bar');
  const dots = el('div', 'dots');
  dots.append(el('i'), el('i'), el('i'));
  const url = el('div', 'url', 'district-bulletin / situation-update-18-nov');
  const ext = el('div', 'ext');
  ext.innerHTML = '<i></i>';
  bar.append(dots, url, ext);
  const page = el('div', 'page');
  page.innerHTML =
    '<small>SITUATION UPDATE · 18 NOV</small>' +
    '<h2>East bank access after Thursday’s flood</h2>' +
    '<p>Road crews report that the market road remains closed to heavy vehicles. Small boats are carrying goods across at the old ferry point during daylight.</p>' +
    '<p><mark>Two health posts on the east bank are closed until staff can cross safely; patients are being referred to Mutarara.</mark></p>' +
    '<p>A second assessment is planned once water levels drop below the bridge footings.</p>';
  win.append(bar, page);
  root.appendChild(win);
};

const popup = (root: HTMLElement): void => {
  const pop = el('aside', 'pop');
  const head = el('div', 'h');
  const mark = el('div', 'mark');
  mark.innerHTML = '<i></i>Fieldnote';
  const stamp = el('span', undefined, 'N°015 · 15:18');
  head.append(mark, stamp);
  const cap = el('div', 'cap');
  cap.innerHTML = '<small>CAPTURED FROM PAGE</small>Two health posts on the east bank are closed until staff can cross safely; patients are being referred to Mutarara.';
  const row = el('div', 'row');
  row.innerHTML = '<span>TRANSLATE <u>PT</u></span>';
  const button = document.createElement('button');
  button.className = 'btn';
  button.type = 'button';
  button.textContent = 'SUMMARIZE ON DEVICE';
  row.appendChild(button);
  const res = el('div', 'res');
  res.innerHTML =
    '<div class="k"><b>LOCAL · GEMINI NANO</b><span>374 MS</span></div>' +
    '<p>East-bank health posts closed; patients sent to Mutarara.</p>' +
    '<p class="t">PT → Dois postos de saúde na margem leste estão fechados; os doentes são encaminhados para Mutarara.</p>' +
    '<div class="bar2"><i></i></div>';
  const foot = el('div', 'foot', 'ONLINE · SAVED AND SENT TO THE SYNC QUEUE');
  pop.append(head, cap, row, res, foot);
  root.appendChild(pop);
};

const sidePanel = (root: HTMLElement): void => {
  const side = el('div', 'side');
  side.innerHTML =
    '<h3>Capture from any tab.<br><b>Summarized before it leaves.</b></h3>' +
    'The extension runs the same on-device model as the notebook. Online, the note joins the queue right away; offline, it waits on the device. Load <b>dist-extension</b> in Chrome to install it.';
  root.appendChild(side);
};

/** Page 02 - capture from any tab (extension popup, shown in its browser window). */
export const renderExtension = (frame: { canvas: HTMLCanvasElement; svg: SVGSVGElement; tags: HTMLElement; page: HTMLElement }, ctx: PageCtx): void => {
  frame.page.replaceChildren();
  browserWindow(frame.page);
  popup(frame.page);
  sidePanel(frame.page);

  const views = stonesFor(ctx.notes, { sendingId: ctx.sendingId });
  const svg: string[] = [];
  const proj = paint(frame.canvas, CAM_EXTENSION, 1, views.map((v) => v.stone));
  const newest = views.find((v) => v.stone.s === 0);
  views.forEach((v) => {
    const [x, y] = drawTag(proj, { p: v.stone.p, o: v.stone.o!, s: v.stone.s, dim: v.stone.dim, id: displayNumber(ctx.notes, v.note.id), t: clockOf(v.note.createdAt), l: v.label }, frame.tags, svg);
    if (v === newest) drawBrackets(x, y, 30, svg);
  });
  drawOrbits(proj, BEAM, [[0.6, 1.35, HUD_RED], [1.7, 1.0, HUD_RED], [2.8, 1.4, HUD_ICE]], svg);
  flushSvg(frame, svg);
};
