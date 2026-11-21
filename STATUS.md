# STATUS buildhybridai-fieldnote

Phase: design-impl
Etat: done
Round: R1
Maj: 2026-11-21 22:45

## opencode

- Idée : ébauche 2 de `../../IDEES.md`, retenue R1 ; `IDEE.md` + `SPEC.md` (archi, pipeline, brief UI).
- **Repo créé et mergé** : https://github.com/GaiaSG94/buildhybridai-fieldnote (public, MIT, topics, BaptisteFaisy invité, protection main ok). Clone local : `app/`.
- **V1 livrée** (TS + Vite + extension Chrome MV3) : `src/core/` (note, prompts, recherche offline), `src/models.ts` (hybride PREFER_ON_DEVICE / ONLY_IN_CLOUD), `src/firebase.ts` (AI + App Check), `src/store/notes.ts` (Firestore batch + Remote Config), web app + extension MV3.
- **Vérification 04 (2026-11-20)** : PASS avec 8 deltas — rapport `../VERIFICATION.md`.
- **07b fait (2026-11-21, branche `design/orbite-impl`)** : style Orbite verrouillé intégré au produit réel :
  - Moteur de scène raymarché porté 1:1 des planches (`src/ui/scene.ts`), HUD (réticule, étiquettes, crochets, orbites) à l'identique (`src/ui/hud.ts`), tokens + Archivo/DM Mono embarquées OFL.
  - 5 pages (hash `#01..#05`) : Notes (composeur réel), Extension (vitrine + popup MV3 restylé), Sync queue (table + pipeline), Search (score n/n + provenance), Offline (faisceau éteint, cloud endormi).
  - Modèle enrichi de ce que le design affiche : `localLatencyMs`, `cloudLatencyMs`, `translationLanguage`, provenance de recherche (`tokenOrigins`), notes de démo quand Firebase absent (annonce « SAMPLE DATA »).
  - Revue : section « opencode - Revue d'implémentation (07b) » dans `G-DESIGN/DESIGN.md` + captures planche|produit 1440×900 dans `G-DESIGN/revue/compare-01..05.png`.
  - 32/32 tests vitest, tsc vert, double build vert, check-limits 0.
- Sheet (verrou `agent-gaia`) : `taches` ideation/repo/code/readme = done ; `projets` repo + statut `build`.
- **Prochaine étape** : déployer la web app (projet Firebase commun = point ouvert H) → vidéo ≤ 3 min (SCRIPT.md prêt) → description Devpost → soumission avant le **30/11 23:00 Paris**.
- Points ouverts (H) : projet Firebase commun aux 4 projets (config + App Check) ; Devpost « Join Hackathon » ; arbitrage écart n°2 (page 05 hors-ligne = écran de démonstration, pas un reflet de `navigator.onLine`).

## Claude

- Style « Orbite » validé et verrouillé (V3.1, 2026-11-18) — planches `G-DESIGN/planches/orbite/`, `STYLE.md`, `PAGES.md`. Implémenté tel quel (07b ci-dessus), écarts listés dans `G-DESIGN/DESIGN.md` § Revue.
