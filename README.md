# Fieldnote

Field notes that work with no network — and get smarter when the network is back.

Fieldnote is an offline-first field notebook built on **Firebase AI Logic hybrid
inference**: every note is **summarized and translated on the device** (Gemini
Nano through the Chrome Prompt API, no network required), queued locally, then
**enriched in the cloud** when the connection returns — and searchable offline
the whole time.

## Why it matters

People who work in the field (journalists, surveyors, humanitarian teams) write
where there is no signal, and they cannot afford to upload raw interviews
before they are safe to share. Fieldnote keeps the sensitive pass on the
device and only sends what is safe to send, when it is safe to send it.

## How Firebase AI Logic is used

- `getAI(app, { backend: new GoogleAIBackend() })` — Firebase AI
  Logic is initialized at runtime (`src/firebase.ts`), on the Gemini
  Developer API free tier (no payment method, no billing).
- `getGenerativeModel(ai, { mode: InferenceMode.PREFER_ON_DEVICE,
  onDeviceParams, inCloudParams })` — **hybrid inference** (`src/models.ts`):
  the on-device model produces the summary and the translation; the cloud
  model is the fallback and also runs the enrichment pass. The badge on each
  note shows where the inference ran (`response.inferenceSource`).
- `initializeAppCheck(...)` — App Check protects every cloud call.
- Firestore stores the notes (`notes` collection) once the queue is flushed;
  Remote Config carries the operational flags.

## Quickstart

```bash
npm ci
cp .env.example .env.local   # fill with your Firebase project values
npm run dev
```

The Chrome extension is built separately:

```bash
npm run build            # web app -> dist/, extension -> dist-extension/
```

Load `dist-extension/` as an unpacked extension (chrome://extensions →
Developer mode → Load unpacked).

Commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server (web app) |
| `npm test` | Unit tests (vitest): notes, offline search, prompts |
| `npm run build` | Type-check + web app build + extension build |
| `npm run preview` | Serve the production web build |

## Architecture

```
src/
  core/note.ts     pure note model (create, enrich, pending queue, sync flags)
  core/enrich.ts   pure prompts + parsers (local summary/translation, cloud keywords)
  core/search.ts   pure offline search index (token overlap, no embeddings)
  firebase.ts      Firebase + App Check + Firebase AI Logic bootstrap
  models.ts        hybrid local model (prefer on-device) + cloud enrichment model
  store/notes.ts   Firestore persistence + Remote Config flags
  ui/              DOM rendering (note cards, status bar)
  extension/       Chrome MV3 popup (capture + on-device summary)
extension/         extension manifest and popup page
tests/             vitest unit tests (no network)
```

## Demo script (3 minutes)

1. Open the web app, keep the sample note, press **Save note**: the badge
   shows `LOCAL` and the latency — the summary and the translation were
   produced **on the device**.
2. Switch the browser to **airplane mode** and save another note: it still
   works, and the status bar shows the note waiting in the offline queue.
3. Go back online: the queue is flushed to Firestore and the cloud
   enrichment (keywords + fuller summary) appears, badge `CLOUD`.
4. Search for a word only present in the cloud keywords: the offline index
   finds the note without any network call.
5. Open the Chrome extension popup, capture a note, and press **Summarize on
   device**: same on-device path, from the extension.

## Limitations

- The on-device model needs a Chromium browser with the built-in model
  available; otherwise the SDK falls back to the cloud and the badge says so.
- The offline search is token-overlap based (no embeddings): it is fast and
  works with no network, but it misses synonyms.
- The extension currently syncs only when the device is online; the offline
  queue lives in the web app session.

## Interface and typefaces

The interface follows the locked "Orbite" design (`G-DESIGN/STYLE.md`): a
night scene rendered by a dedicated WebGL shader, notes drawn as rocks in
orbit (red embers = local, frost = cloud), and a monospaced HUD. Two free
(SIL OFL) typefaces are embedded in `src/ui/fonts/`:

- [Archivo](https://fonts.google.com/specimen/Archivo) (variable) — titles and body text.
- [DM Mono](https://fonts.google.com/specimen/DM+Mono) — HUD, labels, measurements.

## Built with

TypeScript, Vite, vitest, Firebase (AI Logic, App Check, Firestore, Remote
Config), Chrome Extension Manifest V3.

## Measurements

Every measured latency is shown where it happened, following the locked
design: the on-device pass is printed on each note label and in the queue
table ("402 ms"), the cloud latency appears once a note has been enriched
("1.8 s"), and the readout panel quotes them per note. Nothing is
hard-coded, nothing is estimated; aggregate helpers live in
`src/core/metrics.ts` (`summarize` → run counts, medians, on-device share).
