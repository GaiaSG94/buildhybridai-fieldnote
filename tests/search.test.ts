import { describe, expect, it } from 'vitest';
import { search, tokenize } from '../src/core/search';
import { createNote } from '../src/core/note';

const notes = [
  createNote({ body: 'Water point dry at camp 3', now: 1 }),
  createNote({ body: 'Bridge collapsed after the rains', now: 2 }),
  {
    ...createNote({ body: 'Market day in the valley', now: 3 }),
    cloudKeywords: ['livestock', 'prices'],
  },
];

describe('tokenize', () => {
  it('drops short words and stop words', () => {
    expect(tokenize('The water point is dry')).toEqual(['water', 'point', 'dry']);
  });
});

describe('search', () => {
  it('ranks the note that shares the most tokens', () => {
    const hits = search(notes, 'water camp');
    expect(hits[0].id).toBe(notes[0].id);
    expect(hits[0].score).toBe(1);
  });

  it('matches the cloud keywords too', () => {
    const hits = search(notes, 'livestock prices');
    expect(hits[0].id).toBe(notes[2].id);
  });

  it('returns nothing for an empty query', () => {
    expect(search(notes, '   ')).toEqual([]);
  });

  it('returns nothing when no token matches', () => {
    expect(search(notes, 'helicopter')).toEqual([]);
  });
});
