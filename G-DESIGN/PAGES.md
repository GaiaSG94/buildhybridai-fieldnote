# PAGES — Fieldnote

Proposition V1 (2026-11-18), à valider. Desktop 1440 × 900, capture vidéo 16:9.
Statuts : à dessiner / en revue / validée.

| # | Page | Rôle | Contenu clé | Planche | Statut |
|---|---|---|---|---|---|
| 1 | **Notes** (page principale) | Écrire, voir chaque note monter de LOCAL à CLOUD | Compositeur, roches en orbite autour du faisceau, réticule sur la note SENDING, fiche de la note (résumé + traduction + latence) | `planches/orbite/01-notes.html` | en revue (style validé) |
| 2 | Panneau d'extension | Capturer depuis n'importe quel onglet, résumé local immédiat | Fenêtre de navigateur générique, passage sélectionné, popup : capture, « Summarize on device », résultat LOCAL + latence, état de la file | `planches/orbite/02-extension.html` | en revue |
| 3 | File de synchronisation | Montrer la file qui se vide au retour du réseau | Tableau ordonné (plus ancienne d'abord), pierres reliées au faisceau dans l'ordre d'envoi, chaîne appareil → Firestore (écriture groupée) → Gemini cloud, enrichissement piloté par Remote Config | `planches/orbite/03-file.html` | en revue |
| 4 | Recherche | Retrouver une note sur l'appareil | Requête « road trucks », 2 résultats avec termes trouvés / termes demandés et provenance (texte, résumé local, mot-clé cloud), roches correspondantes encadrées, les autres éteintes | `planches/orbite/04-recherche.html` | en revue |
| 5 | État hors-ligne | Prouver que le local continue sans réseau | Faisceau éteint, nuages fermés, cloud « en sommeil », 4 notes en file, note N°014 résumée et traduite sur l'appareil | `planches/orbite/05-hors-ligne.html` | en revue |

Questions 1 à 4 ci-dessous : faute de réponse, j'ai appliqué mes propositions (page principale = Notes ; « Search » sans le mot « semantic » ; hors-ligne dessiné comme un état de Notes ; définition des 3 états telle que décrite). Dis-moi si l'une ne te va pas.

## Points à trancher (questions pour Gaia)

1. **Page principale = Notes (web app)** et non le panneau d'extension : c'est là que les trois états et la file se voient ensemble dans un seul plan vidéo. D'accord ?
2. **« Recherche sémantique »** : le code fait une recherche par mots communs (texte + mots-clés cloud), sans embeddings, et le README le dit. Je nomme la page « Search » et je n'affiche pas de score de similarité. Faut-il garder le mot « semantic » dans l'UI ?
3. **État hors-ligne** : je le traite comme un état de la page Notes (même écran, autre moment de la vidéo) plutôt qu'un écran à part. Ça te va ?
4. **Trois états** : je lis LOCAL = résumé fait sur l'appareil, pas encore envoyé · PENDING = en cours d'envoi / en attente d'enrichissement · CLOUD = synchronisé et enrichi. À confirmer.
