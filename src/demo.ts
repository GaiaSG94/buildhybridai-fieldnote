import type { FieldNote } from './core/types';

const at = (h: number, m: number): number => new Date(2026, 10, 18, h, m).getTime();

/**
 * Sample notes shown when Firebase is not configured yet (no live notebook).
 * Same fields as real notes, clearly announced in the notice line.
 */
export const demoNotes = (): FieldNote[] => [
  {
    id: 'demo-14-52',
    body: 'Clinic at Mutarara reopened this morning. Two nurses, no fridge for vaccines yet — doses kept in a cool box swapped every 6 h.',
    createdAt: at(14, 52),
    synced: false,
    localSummary: 'Clinic reopened with two nurses; vaccines kept in a cool box, no fridge.',
    localTranslation: 'Clínica de Mutarara reaberta esta manhã; vacinas numa caixa térmica, sem frigorífico.',
    translationLanguage: 'PT',
    localLatencyMs: 391,
  },
  {
    id: 'demo-14-37',
    body: '“El puente se cayó con la crecida del jueves. Desde entonces ningún camión pasa.” — driver, market road.',
    createdAt: at(14, 37),
    synced: false,
    localSummary: 'Bridge lost in Thursday’s flood; no trucks since.',
    localTranslation: '“El puente se cayó con la crecida del jueves…” — resumen en español conservado.',
    translationLanguage: 'FR',
    localLatencyMs: 412,
  },
  {
    id: 'demo-14-21',
    body: 'Escola primária usada como abrigo: 41 famílias, uma latrina, sem luz à noite.',
    createdAt: at(14, 21),
    synced: false,
    localSummary: 'School sheltering 41 families; one latrine, no light at night.',
    localTranslation: 'Primary school used as a shelter: 41 families, one latrine, no light at night.',
    translationLanguage: 'EN',
    localLatencyMs: 402,
  },
  {
    id: 'demo-11-48',
    body: 'Market prices up again: maize flour 25 kg now 1 450, was 1 100 two weeks ago. Traders blame the road, not the harvest.',
    createdAt: at(11, 48),
    synced: true,
    localSummary: 'Maize flour prices up 32% in two weeks; traders blame the road.',
    translationLanguage: 'EN',
    localLatencyMs: 371,
    cloudSummary: 'Maize flour prices rose 32% in two weeks; traders attribute the increase to degraded road access rather than harvest shortfalls.',
    cloudKeywords: ['maize', 'prices', 'road access'],
    cloudLatencyMs: 1800,
  },
  {
    id: 'demo-09-30',
    body: 'Night convoy held at checkpoint for 3 h; 14 trucks waiting at Km 22. Fuel getting short for the return leg.',
    createdAt: at(9, 30),
    synced: true,
    localSummary: 'Convoy delayed 3 h at checkpoint; 14 trucks at Km 22, fuel short.',
    translationLanguage: 'EN',
    localLatencyMs: 355,
    cloudSummary: 'Night convoy held 3 h at the Km 22 checkpoint with 14 trucks queued; drivers report fuel running short for the return leg.',
    cloudKeywords: ['convoy', 'checkpoint', 'delay'],
    cloudLatencyMs: 2100,
  },
  {
    id: 'demo-08-12',
    body: 'Water point at Km 14 dry since Tuesday. Families now walk 6 km to the river; cholera prepositioning kits requested.',
    createdAt: at(8, 12),
    synced: true,
    localSummary: 'Water point dry since Tuesday; families walk 6 km; kits requested.',
    translationLanguage: 'EN',
    localLatencyMs: 386,
    cloudSummary: 'The Km 14 water point has been dry since Tuesday; households now walk 6 km to the river and cholera prepositioning kits have been requested.',
    cloudKeywords: ['displacement', 'water', 'registration'],
    cloudLatencyMs: 1600,
  },
];
