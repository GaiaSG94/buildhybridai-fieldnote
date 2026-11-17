import { describe, expect, it } from 'vitest';
import {
  applyCloudEnrichment,
  applyLocalEnrichment,
  byRecency,
  createNote,
  markSynced,
  pendingSync,
} from '../src/core/note';

const draft = { body: '  Water point dry at camp 3  ', now: 1000 };

describe('createNote', () => {
  it('trims the body and starts unsynced', () => {
    const note = createNote(draft);
    expect(note.body).toBe('Water point dry at camp 3');
    expect(note.synced).toBe(false);
    expect(note.createdAt).toBe(1000);
  });

  it('uses the given id when provided', () => {
    expect(createNote({ ...draft, id: 'note-42' }).id).toBe('note-42');
  });
});

describe('enrichment', () => {
  it('stores the local summary and translation', () => {
    const note = applyLocalEnrichment(createNote(draft), {
      summary: 'Water point dry.',
      translation: 'Point d eau à sec.',
    });
    expect(note.localSummary).toBe('Water point dry.');
    expect(note.localTranslation).toBe('Point d eau à sec.');
  });

  it('keeps the previous local values when the new pass is empty', () => {
    const once = applyLocalEnrichment(createNote(draft), { summary: 'Water point dry.' });
    const twice = applyLocalEnrichment(once, {});
    expect(twice.localSummary).toBe('Water point dry.');
  });

  it('stores the cloud enrichment', () => {
    const note = applyCloudEnrichment(createNote(draft), {
      summary: 'Camp 3 water point dry.',
      keywords: ['water', 'camp'],
    });
    expect(note.cloudKeywords).toEqual(['water', 'camp']);
  });
});

describe('sync helpers', () => {
  it('lists the notes waiting for the network', () => {
    const notes = [createNote(draft), { ...createNote({ ...draft, now: 2 }), synced: true }];
    expect(pendingSync(notes)).toHaveLength(1);
  });

  it('marks the given notes as synced', () => {
    const note = createNote(draft);
    const synced = markSynced([note], [note.id]);
    expect(synced[0].synced).toBe(true);
  });

  it('sorts notes from the most recent to the oldest', () => {
    const older = createNote({ ...draft, now: 1 });
    const newer = createNote({ ...draft, now: 2 });
    expect(byRecency([older, newer]).map((note) => note.createdAt)).toEqual([2, 1]);
  });
});
