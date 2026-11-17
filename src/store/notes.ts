import {
  getFirestore,
  collection,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { getRemoteConfig, fetchAndActivate, type RemoteConfig } from 'firebase/remote-config';
import type { FirebaseApp } from 'firebase/app';
import type { FieldNote } from '../core/types';

const COLLECTION = 'notes';

/** Push notes to Firestore (one batch). */
export async function saveNotes(app: FirebaseApp, notes: FieldNote[]): Promise<string[]> {
  if (!notes.length) {
    return [];
  }
  const db = getFirestore(app);
  const batch = writeBatch(db);
  for (const note of notes) {
    batch.set(doc(collection(db, COLLECTION), note.id), { ...note, synced: true });
  }
  await batch.commit();
  return notes.map((note) => note.id);
}

/** Load the notes stored in Firestore. */
export async function loadNotes(app: FirebaseApp): Promise<FieldNote[]> {
  const db = getFirestore(app);
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((entry) => entry.data() as FieldNote);
}

/** Remote Config flags (cloud enrichment on/off, target language). */
export async function loadFlags(app: FirebaseApp): Promise<RemoteConfig> {
  const remote = getRemoteConfig(app);
  await fetchAndActivate(remote);
  return remote;
}
