import type { Projector, StoneState } from './scene';
import { stateColor } from './scene';

/** One floating label pinned to a stone. */
export interface TagData {
  p: number[];
  o: [number, number];
  s: StoneState;
  dim?: boolean;
  id: string;
  t: string;
  l: string[];
}

/** Square marker + leader line + label block, as on the planches. */
export const drawTag = (
  proj: Projector,
  s: TagData,
  root: HTMLElement,
  svg: string[],
): [number, number] => {
  const [x, y] = proj(s.p);
  const ex = x + s.o[0];
  const ey = y + s.o[1];
  const c = stateColor(s.s);
  const op = s.dim ? 0.25 : 0.7;
  svg.push(
    `<path d="M${x} ${y} L${ex} ${ey}" stroke="${c}" stroke-opacity="${op}" fill="none"/>` +
      `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="none" stroke="${c}" stroke-opacity="${s.dim ? 0.3 : 1}"/>`,
  );
  const d = document.createElement('div');
  d.className = `tag ${['local', 'send', 'cloud', 'sleep'][s.s]}${s.dim ? ' dim' : ''}`;
  d.innerHTML = `<b>${s.l[0]}</b>${s.id} · ${s.t}<br>${s.l.slice(1).join('<br>')}`;
  d.style.top = `${ey - 10}px`;
  if (s.o[0] > 0) {
    d.style.left = `${ex + 8}px`;
  } else {
    d.style.right = `${1440 - ex + 8}px`;
  }
  root.appendChild(d);
  return [x, y];
};

/** Full-screen reticle (graduations, dashed rotating circle, square hooks). */
export const drawCross = (x: number, y: number, svg: string[], color = '#ff4b3a'): void => {
  svg.push(
    `<line x1="0" y1="${y}" x2="1440" y2="${y}" stroke="${color}" stroke-opacity=".5"/>` +
      `<line x1="${x}" y1="0" x2="${x}" y2="900" stroke="${color}" stroke-opacity=".5"/>`,
  );
  for (let k = -6; k <= 6; k++) {
    if (!k) continue;
    const l = k % 3 ? 5 : 10;
    svg.push(
      `<line x1="${x + k * 34}" y1="${y - l}" x2="${x + k * 34}" y2="${y + l}" stroke="${color}" stroke-opacity=".8"/>` +
        `<line x1="${x - l}" y1="${y + k * 34}" x2="${x + l}" y2="${y + k * 34}" stroke="${color}" stroke-opacity=".8"/>`,
    );
  }
  svg.push(
    `<circle cx="${x}" cy="${y}" r="46" fill="none" stroke="${color}" stroke-width="1.2" stroke-dasharray="3 5">` +
      `<animateTransform attributeName="transform" type="rotate" from="0 ${x} ${y}" to="360 ${x} ${y}" dur="9s" repeatCount="indefinite"/></circle>` +
      `<rect x="${x - 58}" y="${y - 58}" width="116" height="116" fill="none" stroke="${color}" stroke-width="1.4" stroke-dasharray="14 88 14 0"/>`,
  );
};

/** Four selection corner hooks. */
export const drawBrackets = (
  x: number,
  y: number,
  r: number,
  svg: string[],
  color = '#ff4b3a',
): void => {
  const l = 12;
  svg.push(
    `<path d="M${x - r} ${y - r + l}V${y - r}H${x - r + l} M${x + r - l} ${y - r}H${x + r}V${y - r + l} ` +
      `M${x + r} ${y + r - l}V${y + r}H${x + r - l} M${x - r + l} ${y + r}H${x - r}V${y + r - l}" ` +
      `fill="none" stroke="${color}" stroke-width="1.5"/>`,
  );
};

/** Dashed orbit ellipses around the beam (red low, ice high). */
export const drawOrbits = (
  proj: Projector,
  beam: number[],
  rings: [number, number, string, number?][],
  svg: string[],
): void => {
  rings.forEach(([hgt, r, c, op]) => {
    let pts = '';
    for (let a = 0; a <= 64; a++) {
      const th = (a / 64) * Math.PI * 2;
      const [x, y] = proj([beam[0] + Math.cos(th) * r, hgt, beam[2] + Math.sin(th) * r * 0.7]);
      pts += (a ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    svg.unshift(`<path d="${pts}" fill="none" stroke="${c}" stroke-opacity="${op ?? 0.22}" stroke-dasharray="2 6"/>`);
  });
};

/** Vertical graduated ruler on the right edge. */
export const fillRuler = (el: HTMLElement | null): void => {
  if (!el) return;
  for (let i = 0; i <= 38; i++) {
    const e = document.createElement('i');
    e.style.top = `${i * 10}px`;
    if (i % 5) e.style.width = '3px';
    el.appendChild(e);
  }
};
