import { describe, expect, it } from 'vitest';
import {
  buildCloudPrompt,
  buildLocalPrompt,
  parseCloudOutput,
  parseLocalOutput,
} from '../src/core/enrich';

describe('parseLocalOutput', () => {
  it('reads the summary and the translation', () => {
    const raw = ['SUMMARY: Water point dry at camp 3.', 'TRANSLATION: Point d eau a sec.'].join('\n');
    const parsed = parseLocalOutput(raw);
    expect(parsed.summary).toBe('Water point dry at camp 3.');
    expect(parsed.translation).toBe('Point d eau a sec.');
  });

  it('survives a missing section', () => {
    const parsed = parseLocalOutput('SUMMARY: Only a summary.');
    expect(parsed.summary).toBe('Only a summary.');
    expect(parsed.translation).toBe('');
  });
});

describe('parseCloudOutput', () => {
  it('reads keywords and summary', () => {
    const raw = ['KEYWORDS: water, camp, drought', 'SUMMARY: Camp 3 is dry.'].join('\n');
    const parsed = parseCloudOutput(raw);
    expect(parsed.keywords).toEqual(['water', 'camp', 'drought']);
    expect(parsed.summary).toBe('Camp 3 is dry.');
  });
});

describe('prompts', () => {
  it('asks the on-device model for two lines', () => {
    const prompt = buildLocalPrompt('note body', 'French');
    expect(prompt).toContain('SUMMARY:');
    expect(prompt).toContain('TRANSLATION:');
    expect(prompt).toContain('French');
    expect(prompt).toContain('note body');
  });

  it('asks the cloud model for keywords and a summary', () => {
    const prompt = buildCloudPrompt('note body');
    expect(prompt).toContain('KEYWORDS:');
    expect(prompt).toContain('SUMMARY:');
    expect(prompt).toContain('note body');
  });
});
