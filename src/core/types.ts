export type InferenceSource = 'on_device' | 'in_cloud';

export interface FieldNote {
  id: string;
  body: string;
  createdAt: number;
  /** Summary produced on the device (no network needed). */
  localSummary?: string;
  /** Translation produced on the device. */
  localTranslation?: string;
  /** Cloud enrichment: keywords and a fuller summary. */
  cloudKeywords?: string[];
  cloudSummary?: string;
  /** True once the note has been pushed to Firestore. */
  synced: boolean;
}

export interface NoteDraft {
  body: string;
  now: number;
  id?: string;
}

export interface SearchHit {
  id: string;
  score: number;
  matched: string[];
}
