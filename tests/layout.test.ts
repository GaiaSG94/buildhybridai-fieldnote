import { describe, expect, it } from 'vitest';
import type { FieldNote } from '../src/core/types';
import {
  clockOf,
  displayNumber,
  displayRank,
  noteState,
  queueOldestFirst,
  stonesFor,
  syncedRecentFirst,
} from '../src/ui/layout';
import { tokenOrigins } from '../src/core/search';

const note = (id: string, minutes: number, extra: Partial<FieldNote> = {}): FieldNote => ({
  id,
  body: `note ${id}`,
  createdAt: Date.UTC(2026, 10, 18, 14, minutes),
  synced: false,
  ...extra,
});

describe('layout', () => {
  it('numbers notes by chronological rank', () => {
    const notes = [note('b', 30), note('a', 10), note('c', 50)];
    expect(displayRank(notes, 'a')).toBe(1);
    expect(displayNumber(notes, 'b')).toBe('N°002');
    expect(displayNumber(notes, 'c')).toBe('N°003');
  });

  it('formats the clock and the frame stamp', () => {
    const ts = new Date(2026, 10, 18, 15, 4).getTime();
    expect(clockOf(ts)).toBe('15:04');
  });

  it('orders the queue oldest first and the synced most recent first', () => {
    const notes = [
      note('a', 10, { synced: true }),
      note('b', 30),
      note('c', 20, { synced: true }),
      note('d', 40),
    ];
    expect(queueOldestFirst(notes).map((n) => n.id)).toEqual(['b', 'd']);
    expect(syncedRecentFirst(notes).map((n) => n.id)).toEqual(['c', 'a']);
  });

  it('maps notes to scene states', () => {
    const local = note('local', 5);
    const cloud = note('cloud', 5, { synced: true, cloudSummary: 'done' });
    expect(noteState(local, false)).toBe(0);
    expect(noteState(local, false, 'local')).toBe(1);
    expect(noteState(cloud, false)).toBe(2);
    expect(noteState(cloud, true)).toBe(3);
  });

  it('lays out stones per altitude band, offline dims the cloud', () => {
    const notes = [
      note('l1', 30),
      note('l2', 40),
      note('c1', 10, { synced: true, cloudSummary: 's', cloudLatencyMs: 1800 }),
    ];
    const online = stonesFor(notes, {});
    expect(online.map((v) => v.stone.s).sort()).toEqual([0, 0, 2]);
    expect(online.find((v) => v.note.id === 'l1')?.label.join(' ')).toContain('QUEUED');
    const offline = stonesFor(notes, { offline: true });
    const asleep = offline.find((v) => v.note.id === 'c1');
    expect(asleep?.stone.s).toBe(3);
    expect(asleep?.stone.dim).toBe(true);
    expect(asleep?.label[0]).toBe('CLOUD · ASLEEP');
  });

  it('shows latencies on the labels when measured', () => {
    const notes = [
      note('l', 30, { localLatencyMs: 402 }),
      note('c', 10, { synced: true, cloudSummary: 's', cloudKeywords: ['road'], cloudLatencyMs: 1800 }),
    ];
    const views = stonesFor(notes, {});
    const local = views.find((v) => v.note.id === 'l');
    expect(local?.label.join(' ')).toContain('402 MS');
    const cloud = views.find((v) => v.note.id === 'c');
    expect(cloud?.label).toContain('1.8 S');
    expect(cloud?.label).toContain('road');
  });

  it('caps the stones drawn (engine limit reached, oldest dropped)', () => {
    const many = Array.from({ length: 12 }, (_, i) => note(`n${i}`, i));
    const views = stonesFor(many, {});
    expect(views.length).toBeLessThanOrEqual(8);
  });
});

describe('token origins', () => {
  it('reports where each matched term was found', () => {
    const n = note('a', 10, {
      body: 'The road to the market is cut.',
      localSummary: 'Bridge lost; no trucks since.',
      synced: true,
      cloudSummary: 'Access to the market broken.',
      cloudKeywords: ['road access'],
    });
    const origins = tokenOrigins(n, ['road', 'trucks', 'market']);
    expect(origins.get('road')).toContain('text');
    expect(origins.get('road')).toContain('keyword');
    expect(origins.get('trucks')).toEqual(['local']);
    expect(origins.get('market')).toContain('text');
    expect(origins.get('market')).toContain('cloud_summary');
  });
});
