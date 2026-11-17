import {
  getGenerativeModel,
  InferenceMode,
  InferenceSource,
  type AI,
  type GenerativeModel,
} from 'firebase/ai';
import {
  buildCloudPrompt,
  buildLocalPrompt,
  parseCloudOutput,
  parseLocalOutput,
  type LocalEnrichment,
} from './core/enrich';
import type { InferenceSource as Source } from './core/types';

export interface FieldnoteModels {
  local: GenerativeModel;
  cloud: GenerativeModel;
}

/** Hybrid model: on-device first, cloud fallback. */
export function createModels(ai: AI, cloudModel: string): FieldnoteModels {
  const local = getGenerativeModel(ai, {
    mode: InferenceMode.PREFER_ON_DEVICE,
    onDeviceParams: { createOptions: { expectedOutputs: [{ type: 'text' }] } },
    inCloudParams: { model: cloudModel },
  });
  const cloud = getGenerativeModel(ai, {
    mode: InferenceMode.ONLY_IN_CLOUD,
    inCloudParams: { model: cloudModel },
  });
  return { local, cloud };
}

export interface LocalRun extends LocalEnrichment {
  source: Source;
  latencyMs: number;
}

/** Summarize and translate a note on the device. */
export async function runLocal(models: FieldnoteModels, body: string, language: string): Promise<LocalRun> {
  const started = performance.now();
  const result = await models.local.generateContent(buildLocalPrompt(body, language));
  const parsed = parseLocalOutput(result.response.text());
  const source = result.response.inferenceSource === InferenceSource.IN_CLOUD ? 'in_cloud' : 'on_device';
  return { ...parsed, source, latencyMs: Math.round(performance.now() - started) };
}

/** Enrich a note in the cloud (keywords + summary). */
export async function runCloud(models: FieldnoteModels, body: string) {
  const result = await models.cloud.generateContent(buildCloudPrompt(body));
  return parseCloudOutput(result.response.text());
}
