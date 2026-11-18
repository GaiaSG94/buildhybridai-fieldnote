# SPEC — buildhybridai-fieldnote

Date : 2026-11-16. Idée : `IDEE.md`. Critères : `CRITERES.md` (généré).
Repo : https://github.com/GaiaSG94/buildhybridai-fieldnote (clone : `app/`).

## 1. Architecture

- **Stack** : TypeScript + Vite (vanilla DOM) ; vitest ; **extension Chrome MV3** (build séparé `vite.extension.config.ts` → `dist-extension/`, manifest dans `extension-public/`).
- **Firebase AI Logic** (`firebase/ai`) :
  - `getAI(app, { backend: new GoogleAIBackend() })` — appelé au runtime. Backend **Gemini Developer API** (plan Spark, free tier, aucun moyen de paiement) ; `AgentPlatformBackend` (ex-Vertex) exigerait un compte de facturation Blaze → écarté.
  - Modèle **local hybride** `PREFER_ON_DEVICE` : résumé + traduction (`SUMMARY:` / `TRANSLATION:`), badge via `inferenceSource`.
  - Modèle **cloud** `ONLY_IN_CLOUD` : enrichissement (`KEYWORDS:` / `SUMMARY:`).
- **App Check** (ReCaptchaV3Provider ; debug provider en local), **Firestore** (collection `notes`, flush par batch), **Remote Config** (drapeaux).

## 2. Pipeline de données (purement testable)

1. `createNote` → note non synchronisée.
2. Passe **locale** (hors-ligne possible) : résumé ≤ 25 mots + traduction dans la langue choisie.
3. File d'attente : `pendingSync` (notes non synchronisées) ; `markSynced` après push batch Firestore.
4. Passe **cloud** (en ligne uniquement, opt-in) : mots-clés + résumé long → `applyCloudEnrichment`.
5. **Recherche offline** : index par chevauchement de tokens (stop-words EN/FR), score = tokens communs / tokens requête — honnête : pas d'embedings, documenté dans le README.

## 3. Écrans

| Écran | Contenu |
|---|---|
| Barre haute | Titre + champ de recherche offline |
| Barre d'état | Pastille online/offline + compteur de la file |
| Composeur | Textarea + langue de traduction + case « Enrich in cloud when online » + bouton Save note |
| Flux | Cartes de notes : badge LOCAL/CLOUD, date, état sync, résumé local (vert), traduction (muted), enrichissement cloud (bleu) |
| Extension | Popup MV3 : capture + « Summarize on device » + sync si en ligne |

## 4. Intégrations imposées (critères 1-1)

| Critère | Implémentation |
|---|---|
| Firebase AI Logic au runtime | `src/firebase.ts` + `src/models.ts` |
| Inférence hybride (thème) | PREFER_ON_DEVICE + fallback + enrichissement ONLY_IN_CLOUD, badge par note |
| App Check | `initAppCheck` (debug accepté) |
| Plateforme | Web/Chrome : web app + extension Chrome (catégorie « Web/Chrome ») |
| Repo public + licence OSS | MIT (détectée dans About) |
| Vidéo ≤ 3 min | script 5 étapes dans le README (avion → queue → sync → recherche offline → extension) |
| Description EN | README EN + Devpost à la soumission |
| Démo hébergée | à déployer (web app statique) avant le 30/11 |
| Pas de secrets | `.env.example` placeholders + garde CI |

## 5. Plan de test

- 18 tests vitest verts : modèle de note (create/enrich/file/sync/tri), recherche offline (tokenization, classement, mots-clés cloud, cas vides), prompts/parseurs (sections manquantes, contenus requis).
- Manuel : mode avion (résumé local + file), retour en ligne (flush + enrichissement), recherche offline sur mots-clés cloud, popup extension, console sans erreur.
- CI : template (npm ci/test/build, garde secrets, check-limits).

## 6. Limites connues

- Recherche par tokens : pas de synonymes (documenté).
- File offline en mémoire de session (pas encore IndexedDB) → à durcir si le temps le permet.
- Extension : sync immédiate seulement si en ligne (sinon message).

## 7. Brief UI (étape 6, pour Claude)

- **Ton** : carnet de terrain, calme, naturel — « notes d'expédition », pas dashboard corporate.
- **Palette** : fond `#0f1310`, panneaux `#161b17`, texte `#e9f0ea`, muted `#93a396`, LOCAL vert `#7ee787`, CLOUD bleu `#79c0ff`, offline orange `#ffa657`.
- **Signatures visuelles** : pastille online/offline + compteur de file (le « offline-first » doit se voir en vidéo), badge LOCAL vert par carte, enrichissement cloud bleu distinct.
- **Interdits** : marques tierces, emoji, gradients criards.
- **Contraintes** : desktop-first 16:9, anglais, focus visible + contrastes AA.
