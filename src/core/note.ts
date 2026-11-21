import type { FieldNote, NoteDraft } from './types';

/** Create a note from a draft (deterministic id when not provided). */
export function createNote(draft: NoteDraft): FieldNote {
  return {
    id: draft.id ?? `note-${draft.now}`,
    body: draft.body.trim(),
    createdAt: draft.now,
    synced: false,
  };
}

/** Attach the on-device summary and translation to a note. */
export function applyLocalEnrichment(
  note: FieldNote,
  enrichment: { summary?: string; translation?: string; language?: string; latencyMs?: number },
): FieldNote {
  return {
    ...note,
    localSummary: enrichment.summary ?? note.localSummary,
    localTranslation: enrichment.translation ?? note.localTranslation,
    translationLanguage: enrichment.language ?? note.translationLanguage,
    localLatencyMs: enrichment.latencyMs ?? note.localLatencyMs,
  };
}

/** Attach the cloud enrichment to a note. */
export function applyCloudEnrichment(
  note: FieldNote,
  enrichment: { summary?: string; keywords?: string[]; latencyMs?: number },
): FieldNote {
  return {
    ...note,
    cloudSummary: enrichment.summary ?? note.cloudSummary,
    cloudKeywords: enrichment.keywords ?? note.cloudKeywords,
    cloudLatencyMs: enrichment.latencyMs ?? note.cloudLatencyMs,
  };
}

/** Notes waiting for a network connection. */
export function pendingSync(notes: FieldNote[]): FieldNote[] {
  return notes.filter((note) => !note.synced && note.body.length > 0);
}

/** Mark notes as synced after a successful push. */
export function markSynced(notes: FieldNote[], ids: string[]): FieldNote[] {
  const done = new Set(ids);
  return notes.map((note) => (done.has(note.id) ? { ...note, synced: true } : note));
}

/** Sort notes from the most recent to the oldest. */
export function byRecency(notes: FieldNote[]): FieldNote[] {
  return [...notes].sort((a, b) => b.createdAt - a.createdAt);
}
