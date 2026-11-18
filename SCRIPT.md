# SCRIPT — fieldnote (vidéo démo ≤ 3 min, YouTube public)

Format : 16:9, anglais, voix off optionnelle. Aucun logo tiers à l'écran.

## Shot list (2 min 50)

| # | Temps | Plan | Ce qu'on voit / dit |
|---|---|---|---|
| 1 | 0:00–0:20 | Titre | « Fieldnote — notes that work with no signal » + URL du repo. |
| 2 | 0:20–0:50 | App, note terrain | Note brute : point d'eau à sec, pont effondré, prix du bétail. |
| 3 | 0:50–1:20 | Clic « Save note » | Badge **LOCAL**, résumé + traduction en anglais/français générés **sur l'appareil**, latence affichée. Voix off : « Summary and translation, produced on the device — no network needed. » |
| 4 | 1:20–1:50 | Mode avion + 2e note | La note est créée quand même ; barre d'état « offline » + « 1 note(s) waiting for sync ». |
| 5 | 1:50–2:15 | Retour en ligne | Flush Firestore + enrichissement cloud : badge **CLOUD**, mots-clés + résumé long. Voix off : « Back online, the cloud adds the searchable layer. » |
| 6 | 2:15–2:40 | Recherche | Mot-clé présent uniquement dans les mots-clés cloud → note trouvée, toujours hors-ligne. Voix off : « Search that works with no connection. » |
| 7 | 2:40–2:55 | Extension Chrome | Popup : capture + « Summarize on device », badge LOCAL. |
| 8 | 2:55–3:00 | Carte finale | « #BuildHybridAI · Fieldnote · Web/Chrome » + repo. |

## Captures à prendre

1. Note créée + badge LOCAL + résumé/traduction.
2. Mode avion + compteur de file.
3. Enrichissement cloud (badge CLOUD, mots-clés).
4. Recherche hors-ligne qui trouve la note par mot-clé cloud.
5. Popup de l'extension.
6. README (section « How Firebase AI Logic is used ») + Actions verte.

## Prérequis

- Web app déployée (config Firebase réelle) + extension chargée (unpacked) pour
  le plan 7 ; si l'extension n'est pas prête, remplacer le plan 7 par le
  repository README.
