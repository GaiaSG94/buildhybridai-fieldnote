import { fillRuler } from './hud';

export interface FrameHandles {
  canvas: HTMLCanvasElement;
  svg: SVGSVGElement;
  tags: HTMLElement;
  count: HTMLElement;
  signal: HTMLElement;
  page: HTMLElement;
}

export const PAGES: [string, string, string][] = [
  ['01', 'Notes', 'notes'],
  ['02', 'Extension', 'extension'],
  ['03', 'Sync queue', 'queue'],
  ['04', 'Search', 'search'],
  ['05', 'Offline', 'offline'],
];

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
};

/** Keep the 1440x900 stage fully visible in any window (integer design, scaled). */
export const fitStage = (stage: HTMLElement): void => {
  const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 900);
  stage.style.transform = `translate(-50%,-50%) scale(${scale})`;
};

/** Build the fixed frame: brand, counter, page index, signal, ruler, overlays. */
export const buildFrame = (root: HTMLElement, onPage: (page: string) => void): FrameHandles => {
  const stage = el('div', 'stage');
  const inner = el('div', 'inner');
  const canvas = el('canvas');
  canvas.width = 1440;
  canvas.height = 900;
  canvas.id = 'c';
  const grain = el('div', 'grain');
  const hud = el('div', 'hud');
  const top = el('div', 'top');
  const mark = el('div', 'mark');
  mark.innerHTML = '<i></i>Fieldnote';
  const count = el('div', 'count');
  const nav = el('nav', 'nav');
  for (const [num, label, id] of PAGES) {
    const btn = el('button');
    btn.dataset.page = id;
    btn.innerHTML = `<span>${num}</span>${label}`;
    btn.addEventListener('click', () => onPage(id));
    nav.appendChild(btn);
  }
  top.append(mark, count, nav);
  const signal = el('div', 'signal');
  const vr = el('div', 'vr');
  vr.id = 'vr';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'x');
  svg.id = 'x';
  const tags = el('div');
  tags.id = 'tags';
  const page = el('div');
  page.id = 'page';
  hud.append(top, signal, vr, svg, tags, page);
  inner.append(canvas, grain, hud);
  stage.appendChild(inner);
  root.appendChild(stage);
  fillRuler(vr);
  window.addEventListener('resize', () => fitStage(stage));
  fitStage(stage);
  return { canvas, svg, tags, count, signal, page };
};

/** Highlight the active nav entry. */
export const setNav = (root: Document | ShadowRoot, page: string): void => {
  root.querySelectorAll<HTMLElement>('.nav button').forEach((btn) => {
    btn.classList.toggle('on', btn.dataset.page === page);
  });
};
