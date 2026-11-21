import type { FieldNote } from '../core/types';
import type { StoneCfg, StoneState } from './scene';

/** Notes waiting for the uplink, oldest first (the order they will be sent). */
export const queueOldestFirst = (notes: FieldNote[]): FieldNote[] =>
  notes.filter((n) => !n.synced).sort((a, b) => a.createdAt - b.createdAt);

/** Notes already synced and enriched, most recent first. */
export const syncedRecentFirst = (notes: FieldNote[]): FieldNote[] =>
  notes.filter((n) => n.synced).sort((a, b) => b.createdAt - a.createdAt);

/** Display rank: chronological order, 1-based (a display rank, not a field). */
export const displayRank = (notes: FieldNote[], id: string): number =>
  [...notes].sort((a, b) => a.createdAt - b.createdAt).findIndex((n) => n.id === id) + 1;

export const displayNumber = (notes: FieldNote[], id: string): string =>
  `N°${String(displayRank(notes, id)).padStart(3, '0')}`;

const pad2 = (v: number): string => String(v).padStart(2, '0');

/** HH:MM, local time, as shown on every label. */
export const clockOf = (ts: number): string => {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

/** WED 18 NOV 15:04, the frame clock shown next to the signal. */
export const stampOf = (ts: number): string =>
  new Date(ts)
    .toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .toUpperCase()
    .replace(/,/g, '');

const ordinal = (rank: number): string => {
  const suffix = rank % 10 === 1 && rank !== 11 ? 'ST' : rank % 10 === 2 && rank !== 12 ? 'ND' : rank % 10 === 3 && rank !== 13 ? 'RD' : 'TH';
  return `${rank}${suffix}`;
};

/** Scene state of a note: cloud notes fall asleep when offline. */
export const noteState = (note: FieldNote, offline: boolean, sendingId?: string | null): StoneState => {
  if (sendingId && note.id === sendingId) return 1;
  if (!note.synced) return 0;
  return offline ? 3 : 2;
};

interface Slot {
  p: [number, number, number];
  b: [number, number, number];
  r: [number, number];
  o: [number, number];
}

const LOCAL_SLOTS: Slot[] = [
  { p: [-1.15, 0.42, 0.75], b: [0.22, 0.15, 0.18], r: [0.3, 0.4], o: [-60, 40] },
  { p: [1.05, 0.78, 0.55], b: [0.2, 0.14, 0.17], r: [1.2, -0.3], o: [60, 40] },
  { p: [-1.7, 0.52, 0.95], b: [0.19, 0.13, 0.16], r: [2.4, 0.2], o: [-60, 20] },
  { p: [1.6, 0.66, 0.9], b: [0.18, 0.13, 0.16], r: [-1.5, 0.6], o: [60, 10] },
];
const SEND_SLOT: Slot = { p: [-0.62, 1.62, 0.35], b: [0.2, 0.13, 0.17], r: [2.1, 0.5], o: [0, 0] };
const CLOUD_SLOTS: Slot[] = [
  { p: [1.2, 2.35, -0.3], b: [0.24, 0.15, 0.2], r: [0.7, 0.2], o: [34, 72] },
  { p: [-1.3, 2.8, -0.6], b: [0.22, 0.15, 0.19], r: [-0.8, 0.6], o: [-40, 60] },
  { p: [0.35, 3.3, -0.9], b: [0.25, 0.16, 0.21], r: [1.9, -0.4], o: [70, -40] },
  { p: [-0.4, 3.75, -1.2], b: [0.21, 0.15, 0.2], r: [-2.2, -0.5], o: [-60, -30] },
  { p: [1.3, 3.65, -1.4], b: [0.22, 0.14, 0.19], r: [2.6, 0.3], o: [70, -20] },
];

export interface StoneView {
  stone: StoneCfg;
  note: FieldNote;
  label: string[];
}

const labelLines = (note: FieldNote, state: StoneState, queueRank: number | null): string[] => {
  if (state === 1) return ['SENDING'];
  if (state === 0) {
    const ms = note.localLatencyMs ? `${note.localLatencyMs} MS` : 'ON DEVICE';
    const rank = queueRank ? ` · QUEUED ${ordinal(queueRank)}` : '';
    return ['LOCAL', `${ms}${rank}`];
  }
  if (state === 2) {
    const s = note.cloudLatencyMs ? `${(note.cloudLatencyMs / 1000).toFixed(1)} S` : null;
    const kw = note.cloudKeywords?.length ? note.cloudKeywords.join(' · ') : null;
    return ['CLOUD', ...[s, kw].filter((x): x is string => Boolean(x))];
  }
  const asleep = note.cloudLatencyMs ? `${(note.cloudLatencyMs / 1000).toFixed(1)} S` : null;
  return ['CLOUD · ASLEEP', ...[asleep].filter((x): x is string => Boolean(x))];
};

/**
 * Stones for the scene, most recent first within each altitude band.
 * The engine draws at most 8 stones; overflow is dropped (oldest first).
 */
export const stonesFor = (
  notes: FieldNote[],
  opts: { offline?: boolean; sendingId?: string | null } = {},
): StoneView[] => {
  const offline = opts.offline ?? false;
  const sendingId = opts.sendingId ?? null;
  const queue = queueOldestFirst(notes);
  const rankOf = (id: string): number | null => {
    const i = queue.findIndex((n) => n.id === id);
    return i < 0 ? null : i + 1;
  };
  const local = queue.filter((n) => n.id !== sendingId).slice(-LOCAL_SLOTS.length).reverse();
  const sending = notes.find((n) => n.id === sendingId);
  const cloud = syncedRecentFirst(notes).slice(0, CLOUD_SLOTS.length);
  const views: StoneView[] = [];
  local.forEach((note, i) => {
    const s = LOCAL_SLOTS[i];
    views.push({ note, label: labelLines(note, 0, rankOf(note.id)), stone: { p: s.p, b: s.b, r: s.r, o: s.o, s: 0 } });
  });
  if (sending) {
    views.push({ note: sending, label: labelLines(sending, 1, null), stone: { p: SEND_SLOT.p, b: SEND_SLOT.b, r: SEND_SLOT.r, o: SEND_SLOT.o, s: 1 } });
  }
  cloud.forEach((note, i) => {
    const s = CLOUD_SLOTS[i];
    const state = offline ? 3 : 2;
    views.push({
      note,
      label: labelLines(note, state, null),
      stone: { p: s.p, b: s.b, r: s.r, o: s.o, s: state, dim: offline },
    });
  });
  return views;
};
