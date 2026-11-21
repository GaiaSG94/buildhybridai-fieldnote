import type { Projector, StoneCfg } from './scene';
import { renderScene } from './scene';

export const BEAM: [number, number, number] = [0, 0, 0.15];
export const DEV: [number, number, number] = [0, 0, 0.4];

export type Cam = { ro: [number, number, number]; ta: [number, number, number]; fov: number };

export interface OverlayEls {
  svg: SVGSVGElement;
  tags: HTMLElement;
}

/** Draw the raymarched scene for a page; returns the HUD projector. */
export const paint = (
  canvas: HTMLCanvasElement,
  cam: Cam,
  beamOn: number,
  stones: StoneCfg[],
): Projector =>
  renderScene(canvas, {
    cam: { ro: cam.ro, ta: cam.ta, fov: cam.fov },
    dev: DEV,
    beam: BEAM,
    beamOn,
    stones,
  });

/** Commit the SVG overlay after all parts were collected. */
export const flushSvg = (els: OverlayEls, svg: string[]): void => {
  els.svg.innerHTML = svg.join('');
};

export const el = (tag: string, className?: string, text?: string): HTMLElement => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export interface ReadoutSection {
  label: string;
  text: string;
}

export interface ReadoutData {
  head: string;
  status: string;
  body: string;
  sections: ReadoutSection[];
  /** Offline page: measured on-device latency vs pending cloud pass. */
  lat?: { device: string; cloud: string };
}

/** The glass note panel (verre sombre, filet rouge, sections pointillées). */
export const buildReadout = (root: HTMLElement, data: ReadoutData, width = 320): HTMLElement => {
  const panel = el('aside', 'readout');
  panel.style.right = '36px';
  panel.style.top = '300px';
  panel.style.width = `${width}px`;
  const head = el('div', 'h');
  const left = el('span', undefined, data.head);
  const right = el('span', undefined, data.status);
  head.append(left, right);
  const body = el('p', 'b', data.body);
  panel.append(head, body);
  for (const section of data.sections) {
    const block = el('div', 's');
    const label = el('em', undefined, section.label);
    block.append(label, document.createTextNode(section.text));
    panel.appendChild(block);
  }
  if (data.lat) {
    const lat = el('div', 'lat');
    const device = el('div');
    device.append(document.createTextNode('ON DEVICE'), el('b', undefined, data.lat.device));
    const cloud = el('div', 'sl');
    cloud.append(document.createTextNode('CLOUD'), el('b', undefined, data.lat.cloud));
    lat.append(device, cloud);
    panel.appendChild(lat);
  }
  root.appendChild(panel);
  return panel;
};

/** Active note = sending note, else the most recent one. */
export const activeNote = <T extends { id: string; createdAt: number }>(
  notes: T[],
  sendingId: string | null,
): T | undefined => {
  if (sendingId) {
    const sending = notes.find((n) => n.id === sendingId);
    if (sending) return sending;
  }
  return [...notes].sort((a, b) => b.createdAt - a.createdAt)[0];
};
