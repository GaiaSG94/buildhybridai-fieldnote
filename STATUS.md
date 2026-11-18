# STATUS buildhybridai-fieldnote

Phase: build
Etat: doing
Round: R1
Maj: 2026-11-17 02:55

## opencode

- Idée : ébauche 2 de `../../IDEES.md`, retenue R1 ; `IDEE.md` + `SPEC.md` (archi, pipeline, brief UI).
- **Repo créé et mergé** : https://github.com/GaiaSG94/buildhybridai-fieldnote (public, MIT, topics, BaptisteFaisy invité, protection main ok). Clone local : `app/`.
- **V1 livrée** (TS + Vite + extension Chrome MV3) :
  - `src/core/` — note pure (create/enrich/pendingSync/markSynced), prompts+parseurs (local SUMMARY/TRANSLATION, cloud KEYWORDS/SUMMARY), recherche offline par chevauchement de tokens (sans embedding, documenté).
  - `src/models.ts` — local `PREFER_ON_DEVICE` + cloud `ONLY_IN_CLOUD`, badge `inferenceSource`.
  - `src/firebase.ts` — `getAI` + GoogleAIBackend + App Check ; `src/store/notes.ts` — Firestore (batch) + Remote Config.
  - Web app (composeur, cartes, file offline, recherche) + extension MV3 (`extension/`, manifest `extension-public/`, build `vite.extension.config.ts` → `dist-extension/`).
  - 18 tests vitest verts, tsc propre, double build OK, CI verte (ci/ci-budget/couche0), PR mergée.
- Sheet (verrou `agent-gaia`) : `taches` ideation/repo/code/readme = done ; `projets` repo + statut `build`.
- **Prochaine étape** : design (Claude, brief `SPEC.md` §7) → implémentation design → déploiement web statique + vidéo ≤ 3 min avant le **30/11 23:00 Paris**.
- Points ouverts (H) : projet Firebase commun aux 4 projets (config + App Check) ; Devpost « Join Hackathon ».

## Claude

- (design non démarré — brief UI prêt dans `SPEC.md` §7)
