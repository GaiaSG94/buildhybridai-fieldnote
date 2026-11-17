/**
 * Prompts and parsers for the on-device and in-cloud passes.
 *
 * The on-device model answers with a single `SUMMARY:` line and a single
 * `TRANSLATION:` line, which small models handle reliably.
 */
export interface LocalEnrichment {
  summary: string;
  translation: string;
}

/** Prompt for the on-device model: summary and translation in one call. */
export function buildLocalPrompt(body: string, targetLanguage: string): string {
  return [
    'You run offline on the user device.',
    'Read the NOTE and answer with exactly two lines, no markdown:',
    `SUMMARY: one short sentence summarizing the note (max 25 words).`,
    `TRANSLATION: the note translated into ${targetLanguage}.`,
    'Never invent facts that are not in the note.',
    '',
    'NOTE:',
    body,
  ].join('\n');
}

/** Parse the two lines produced by the on-device model. */
export function parseLocalOutput(raw: string): LocalEnrichment {
  let summary = '';
  let translation = '';
  for (const line of raw.split('\n')) {
    const clean = line.trim();
    const upper = clean.toUpperCase();
    if (upper.startsWith('SUMMARY:')) {
      summary = clean.slice(clean.indexOf(':') + 1).trim();
    } else if (upper.startsWith('TRANSLATION:')) {
      translation = clean.slice(clean.indexOf(':') + 1).trim();
    }
  }
  return { summary, translation };
}

/** Prompt for the cloud pass: keywords and a fuller summary. */
export function buildCloudPrompt(body: string): string {
  return [
    'Summarize the field note below for a searchable archive.',
    'Answer with exactly two sections, no markdown:',
    'KEYWORDS: up to 6 comma separated keywords.',
    'SUMMARY: two sentences, factual, no speculation.',
    '',
    'NOTE:',
    body,
  ].join('\n');
}

/** Parse the cloud answer into keywords and summary. */
export function parseCloudOutput(raw: string): { keywords: string[]; summary: string } {
  let summary = '';
  const keywords: string[] = [];
  for (const line of raw.split('\n')) {
    const clean = line.trim();
    const upper = clean.toUpperCase();
    if (upper.startsWith('KEYWORDS:')) {
      const value = clean.slice(clean.indexOf(':') + 1).trim();
      keywords.push(...value.split(',').map((item) => item.trim()).filter(Boolean));
    } else if (upper.startsWith('SUMMARY:')) {
      summary = clean.slice(clean.indexOf(':') + 1).trim();
    }
  }
  return { keywords, summary };
}
