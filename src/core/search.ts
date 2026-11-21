/**
 * Offline-first search over the local notes.
 *
 * Token overlap scoring (no embeddings, no network): the index is built
 * from the note body, its local summary and its cloud keywords.
 */
import type { FieldNote, SearchHit } from './types';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'des', 'les', 'une',
  'pour', 'avec', 'dans', 'sur', 'est', 'sont', 'nous', 'vous',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function indexTokens(note: FieldNote): Set<string> {
  const parts = [note.body, note.localSummary ?? '', note.cloudSummary ?? ''];
  parts.push(...(note.cloudKeywords ?? []));
  return new Set(tokenize(parts.join(' ')));
}

/** Score a query against the notes, best match first. */
export function search(notes: FieldNote[], query: string, limit = 10): SearchHit[] {
  const queryTokens = [...new Set(tokenize(query))];
  if (!queryTokens.length) {
    return [];
  }
  const hits: SearchHit[] = [];
  for (const note of notes) {
    const tokens = indexTokens(note);
    const matched = queryTokens.filter((token) => tokens.has(token));
    if (!matched.length) {
      continue;
    }
    hits.push({ id: note.id, score: matched.length / queryTokens.length, matched });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export type TokenOrigin = 'text' | 'local' | 'cloud_summary' | 'keyword';

const contains = (text: string, token: string): boolean => new Set(tokenize(text)).has(token);

/**
 * Where each matched term was found (note text, on-device summary,
 * cloud summary or cloud keyword) - provenance shown by the search HUD.
 */
export function tokenOrigins(note: FieldNote, tokens: string[]): Map<string, TokenOrigin[]> {
  const origins = new Map<string, TokenOrigin[]>();
  const add = (token: string, origin: TokenOrigin): void => {
    const found = origins.get(token) ?? [];
    found.push(origin);
    origins.set(token, found);
  };
  for (const token of tokens) {
    if (contains(note.body, token)) add(token, 'text');
    if (contains(note.localSummary ?? '', token)) add(token, 'local');
    if (contains(note.cloudSummary ?? '', token)) add(token, 'cloud_summary');
    if ((note.cloudKeywords ?? []).some((keyword) => contains(keyword, token))) add(token, 'keyword');
  }
  return origins;
}
