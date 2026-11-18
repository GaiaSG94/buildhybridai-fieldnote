# IDEE — buildhybridai-fieldnote (Web/Chrome, extension)

Extrait de `../../IDEES.md` (ébauche 2, retenue R1 le 2026-11-16). Critères : `../../../criteres/index.json#buildhybridai-2026` + `../../FICHE.md` + `CRITERES.md` (généré).

## Pitch (1 phrase)

Carnet de terrain hors-ligne : Gemini Nano 4 résume et traduit les notes **sans réseau**, et au retour en ligne le cloud Gemini enrichit chaque note d'un index sémantique synchronisé via Firestore.

## Problème / cible

Journalistes, chercheurs de terrain, intervenants humanitaires : zones blanches réseau, notes à traiter sur place, confidentialité des sources. Cible : quiconque écrit sans réseau fiable et veut retrouver/chaque note plus tard.

## Features

- Notes tapées/pasted dans l'extension (ou web app compagnon) : résumé + traduction **instantanés en local** (badge `LOCAL`, latence affichée).
- File de synchronisation visible : badge `CLOUD` au retour réseau, enrichissement (index sémantique, mots-clés, entités).
- Recherche sémantique sur l'ensemble des notes une fois synchronisées.
- Firebase : App Check (requis), Authentication, Firestore (notes + index), Remote Config (langues/toggle d'enrichissement).

## Différenciation

Le contraste visuel fort `LOCAL`/`CLOUD` + latence rend l'inférence hybride **démontrable en 20 secondes** de vidéo ; le hors-ligne-first est un vrai workflow (pas une démo d'exception), avec le cloud qui ajoute de la valeur au retour.

## Risques

- Gemini Nano 4 selon version Chrome → version testée documentée dans le README.
- Périmètre extension vs web app → extension Chrome = catégorie Web/Chrome claire ; garder l'UI minimaliste pour tenir le temps de build.

## Pourquoi ça gagne

- Démo 60 s imparable : avion activé → résumé local instantané → reconnexion → badge-cloud + recherche sémantique.
- Produit complet (auth, sync, recherche) → critère *Design*.
- Impact crédible et audience nommée (terrain, confidentialité des sources).

## Livrables visés (critères 1-1)

| Livrable | Plan |
|---|---|
| Repo public GitHub + licence OSS (Apache-2.0) | Firebase AI Logic importé et appelé au runtime (Nano 4 + cloud) |
| Vidéo YouTube publique ≤ 3 min EN | footage extension Chrome, scénario avion/reconnexion |
| Démo hébergée | extension (build) + web app compagnon déployée |
| Description EN | usage Firebase AI Logic, features, value prop, résumé période |
| Catégorie sélectionnée | Web/Chrome |
