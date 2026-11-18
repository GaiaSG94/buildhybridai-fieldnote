# DESIGN — journal Fieldnote

Tenu par Claude (directeur artistique). Versions datées, jamais écrasées.

## V3.1 — 2026-11-18 — Style « Orbite » validé, déclinaison des pages

**Statut** : style validé par Gaia (« 02 Orbite »). Les 5 planches de pages sont en revue.

- `STYLE.md` créé : palette, typo, grille, composants, mouvement, règles d'états.
- Moteur 3D partagé (même scène, même lumière) + feuille de style HUD commune : les 5 pages sont strictement cohérentes.
- Planches dans `planches/orbite/` : `01-notes`, `02-extension`, `03-file`, `04-recherche`, `05-hors-ligne`.
- Ajouts au moteur : faisceau éteignable (hors-ligne), roches atténuées (recherche), état « cloud en sommeil » gris.
- Recherche fidèle au code : index = texte + résumé local + résumé cloud + mots-clés cloud ; score = termes trouvés / termes demandés. La traduction n'est pas indexée.
- Données de démo : uniquement les champs du modèle de note. N°015 (extension) est une nouvelle note de démo capturée depuis une page.

---

## V3 — 2026-11-18 — Scènes 3D et HUD de jeu

**Statut** : direction 02 Orbite retenue par Gaia (voir V3.1).

### Retour sur V2

V2 a été refusée : « slop IA, la matière, les couleurs, les motifs n'ont pas été travaillés, pas d'identité visuelle ». Gaia m'a orienté vers ses références `narratif-jeu` et `3d-matiere` (voir `REFS.md`, section V3). V2 restait des pages plates décorées : ni lumière, ni profondeur, ni scène.

Rappel de cadrage : desktop 1440 × 900 uniquement, aucun téléphone ni mobile (Fieldnote concourt en Web/Chrome).

### Méthode

- Chaque planche est une **scène 3D rendue en direct** par un shader WebGL écrit pour le projet (raymarching : terrain, pierres, nuages, ombres douces, occlusion, brume, halos). Il n'y a ni bibliothèque ni réseau : le fichier s'ouvre en double-cliquant.
- Le **HUD** (étiquettes, réticule, fiche de note, compositeur) est en HTML par-dessus. Les étiquettes sont projetées depuis les coordonnées 3D avec la même caméra que le shader : elles restent collées aux objets.
- Les polices restent les polices libres embarquées de la V2.

### Les trois directions (`planches/v3/`)

| # | Fichier | Scène | Lumière et palette | Typo | Références |
|---|---|---|---|---|---|
| 01 | `01-ascension.html` | Crête à l'heure bleue. Les notes sont des pierres : LOCAL au sol près de l'appareil, SENDING suspendue à un fil de lumière, CLOUD flottant dans le plafond de brume | Ciel nuit → lueur d'horizon, lampe ambrée `#ffb15c` (seul accent chaud), givre froid `#bcd6ee` sur les pierres synchronisées | Archivo condensé + Instrument Serif italique, DM Mono pour le HUD | igloo.inc, Noddal, Raben Rifaie |
| 02 | `02-orbite.html` | Nuit étoilée, faisceau montant de l'appareil vers les nuages d'orage. Les notes sont des roches en orbite : LOCAL en braises rouges en bas, CLOUD givrées en haut. Un réticule verrouillé suit la note SENDING | Noir, rouge signal `#ff4b3a` (seul accent), blanc glacé `#cfe6ff` pour le faisceau et le cloud | Archivo fin (300) en grand, DM Mono minuscule | Yogi Suria, Noddal, Sponge |
| 03 | `03-diorama.html` | Île en lévitation au-dessus d'une mer de nuages, avec la tente et l'appareil. Les notes sont des feuilles : orange sur l'île, en vol sur un pointillé animé, bleues posées sur un vrai cumulus | Jour, ciel bleu → horizon crème, terre et herbe saturées, orange `#d9622b` pour le local, bleu `#3d6fa8` pour le cloud | Instrument Serif (titre), Instrument Sans, DM Mono | Dairy Food Bulgaria, Raben Rifaie, Gemeos |

### Mon choix (3 phrases)

Je recommande **02 Orbite** : c'est la plus forte en vidéo 16:9, le contraste nuit / braises / faisceau se lit même compressé, et le réticule verrouillé sur la note SENDING montre l'inférence hybride en action. 01 Ascension est la plus subtile et la plus « carnet de terrain », mais plus calme. 03 Diorama est la plus lisible pour un jury non technique, mais la moins singulière.

### Limites connues

- Le rendu se calcule sur la carte graphique à l'ouverture (une image fixe, un temps de calcul court). Seul le HUD est animé.
- Les objets sont stylisés (pierres et feuilles procédurales), ce ne sont pas des modèles 3D détaillés : le niveau de finition des références (rendus Blender) n'est atteignable qu'avec des assets dédiés.

### Changelog

- 2026-11-18 : V3. 3 planches en scènes 3D + HUD (`planches/v3/`), `REFS.md` complété avec les captures de Gaia. V2 refusée et conservée.

---

## V2 — 2026-11-18 — Trois directions refaites, chacune avec un concept

**Statut** : refusée par Gaia (voir V3).

### Retour sur V1

Les 3 planches V1 ont toutes été refusées : « on dirait du slop IA, pas d'identité visuelle, aucun travail des couleurs, des détails, des motifs ». Le diagnostic est juste. J'avais posé une mise en page d'app générique avec trois palettes différentes, et rien ne racontait le produit.

### Ce qui change dans la méthode

- **Chaque direction part d'une métaphore physique de l'hybride local/cloud.** Le motif, la palette et les détails en découlent.
- **De vraies polices.** Ce sont des polices libres OFL (dépôt google/fonts), réduites aux caractères latins et embarquées en base64 dans chaque fichier : la planche reste autonome, sans réseau.
- **Des motifs générés, pas décoratifs.** Les courbes de niveau de la 01 sont calculées (marching squares sur un champ de relief, une courbe maîtresse sur cinq). Le bord de couche de la 03 est un filtre SVG de déplacement.
- Les planches sont dans `planches/v2/`. La V1 est conservée dans `planches/v1/`.

### Les trois directions

| # | Fichier | Concept | Palette | Typo | Détails signature |
|---|---|---|---|---|---|
| 01 | `planches/v2/01-releve.html` | **Relevé** : carnet de levé topographique. Le terrain, c'est l'appareil ; le ciel, c'est le cloud. La file est un sentier qui monte de l'un à l'autre. | Papier `#ece4d0`, encre `#1c211e`, orange de levé `#d4602a` (seul accent), conventions de carte : LOCAL vert végétation `#2f6b45`, SENDING graphite `#7d7a6c`, CLOUD bleu ciel `#2d5d8c` | Fraunces (titres, résumés en italique annoté), Alegreya Sans (texte), JetBrains Mono (heures, états) | Papier pointé + grain, double marge rouge de carnet, carte à double cadre, courbes de niveau, sentier animé, symboles de carte (▲ local, cercle pointillé, disque cloud), échelles de latence en barres de carte, mots-clés cloud composés comme des noms de lieux, couche cloud en « calque » |
| 02 | `planches/v2/02-carbone.html` | **Carbone** : carnet à souches dupliqué. L'original s'écrit sur l'appareil, la copie carbone est le cloud. Chaque note est un bordereau. | Couverture bleu carbone `#1b2249` (toile), papier bond `#fbf8ef`, copie canari `#f6edc5`, rouge de numéroteur `#d23a2e` (seul accent), texte carbone `#27359c` | Archivo étendu (en-têtes de formulaire), Courier Prime (texte tapé), IBM Plex Mono (numéros) | Numéros N° rouges en léger décalage d'impression, souche perforée avec trous de reliure, ligne de perforation, lignes de formulaire, tampons encreux texturés LOCAL / SENDING / CLOUD, moitié « copie » vierge tant que la note n'est pas synchronisée, balayage de transfert animé, gros compteur « 03 » |
| 03 | `planches/v2/03-cyanotype.html` | **Cyanotype** : tirage au soleil. Une note locale est un papier non exposé ; la sync « développe » la note en bleu de Prusse. | Bleu de Prusse `#0e2a5c` → `#091d42`, cyan `#9cc8ef`, crème papier `#f1ead6`. Aucun autre accent : l'état se lit sur l'échelle crème → bleu. | Instrument Serif (titre, résumés), Instrument Sans (texte), DM Mono (données) | Couche bleue au pinceau avec bord irrégulier et stries, papier crème en marge avec repères au crayon, tirages suspendus par des pinces à un fil qui fléchit, bord frangé des tirages, carte SENDING qui « développe » (dégradé animé), échelle de gris photographique 1–8 comme légende des états, latences présentées comme des « temps d'exposition » |

### Mon choix (3 phrases)

Je recommande **02 Carbone** : la métaphore original/copie explique l'inférence hybride sans un mot, puisque chaque bordereau montre côte à côte ce que l'appareil a fait et ce que le cloud a ajouté. C'est aussi la plus reconnaissable en une seconde de vidéo, et ça sert directement Design et Technological Implementation. La 03 est la plus belle en plan large, mais elle montre moins de texte par note ; la 01 est la plus riche, mais elle est dense à lire en vidéo compressée.

### Décisions et alertes

- **Numéros N°** : c'est un rang d'affichage, pas un nouveau champ de données. Ils sont dérivés de l'ordre des notes.
- **Polices** : licence OFL, compatible avec l'embarquement. Les crédits sont à ajouter au README au moment de l'implémentation.
- **Poids des fichiers** : 01 ≈ 640 Ko (Fraunces variable + courbes), 02 ≈ 280 Ko, 03 ≈ 215 Ko.
- **Questions de `PAGES.md` toujours ouvertes** (page principale, « semantic », état hors-ligne, définition des 3 états).

### Changelog

- 2026-11-18 : V2. 3 nouvelles planches (`planches/v2/`), polices embarquées, motifs générés. V1 refusée et conservée.

---

## V1 — 2026-11-18 — Trois directions pour la page principale

**Statut** : refusée par Gaia (voir V2).

### Compris du produit

Un carnet de terrain qui marche sans réseau : chaque note est résumée et traduite sur l'appareil (Gemini Nano via Firebase AI Logic), avec sa latence affichée. Les notes attendent dans une file. Au retour du réseau, elles partent par lot vers Firestore et le cloud Gemini ajoute des mots-clés et un résumé plus complet. Ces mots-clés servent ensuite à la recherche. L'histoire à montrer en vidéo : **une file qui se vide**, de LOCAL à CLOUD.

### Page principale retenue pour le style : Notes (web app)

C'est le seul écran où composeur, trois états, latences et file tiennent dans un même plan 16:9. À confirmer (voir `PAGES.md`, question 1).

### Les trois directions

| # | Fichier | Palette | Typo | Motif |
|---|---|---|---|---|
| 01 | `planches/v1/01-carnet.html` | Papier `#f5f1e8`, encre `#14181c`, accent `#e07a3f`, états `#3ddc84` / `#93a1b5` / `#ffb454` (la direction du brief) | Sans humaniste pour le texte, mono pour heures et badges | Le carnet : feuille de saisie à gauche, fil au centre, **colonne de file** à droite qui descend « On device → Sending → Cloud » |
| 02 | `planches/v1/02-instrument.html` | Nuit `#0f1310`, panneaux `#161b17`, LOCAL `#7ee787`, CLOUD `#79c0ff`, accent `#ffa657` (la palette de `SPEC.md` §7) | Mono dominante pour les libellés, sans pour le contenu | Trois **couloirs** ON DEVICE / SENDING / CLOUD : les notes changent de colonne, la file se lit de gauche à droite |
| 03 | `planches/v1/03-depeche.html` | Blanc `#fbfbf9`, encre `#111315`, **aucun accent** : la couleur ne sert qu'aux états (`#1f9d55` / `#8792a2` / `#c77d10`) | Sans très grasse en titre (56 px), mono pour les colonnes | Le **registre de dépêches** : une ligne par note, des barres de latence côte à côte (sur la même échelle de 0 à 2 s) rendent visible l'écart device / cloud |

### Mon choix (3 phrases)

Je recommande **03 Dépêche** : c'est la seule où la différence entre local et cloud se *mesure* à l'œil (barre courte verte, barre longue ambre), ce qui sert directement le critère Technological Implementation en vidéo. Elle tient le ton « outil de journaliste » sans décor et reste lisible en 1080p compressé. La direction 01 est la plus chaleureuse et la plus fidèle au brief ; je la garderais en recours si 03 paraît trop froide.

### Décisions et alertes

- **Polices** : aucune police téléchargée ni sous licence. Pile système (Seravek / Gill Sans Nova / Ubuntu / Segoe UI…) et `ui-monospace`. Le rendu varie selon la machine : à figer au moment de l'implémentation (par ex. une police libre embarquée dans l'app).
- **Contraste** : le vert `#3ddc84` et l'ambre `#ffb454` ne passent pas AA en texte sur papier. Dans 01, ils ne servent que de fond aux badges (texte encre dessus). Dans 03, j'ai foncé les états pour qu'ils passent en texte.
- **Accent trop proche** (01) : l'accent `#e07a3f` et CLOUD `#ffb454` se confondent en vidéo. Si 01 est retenue, il faudra changer l'un des deux.
- **Données de démo** : uniquement des champs existants (`body`, `createdAt`, résumé et traduction locaux, mots-clés et résumé cloud, `synced`, latence). J'ai retiré un libellé de lieu que j'avais ajouté : il n'existe pas dans le modèle.
- **Recherche** : barre présente partout, libellée « Search notes and keywords », sans parler de « semantic » tant que la question 2 de `PAGES.md` n'est pas tranchée.

### Changelog

- 2026-11-18 : `PAGES.md`, `REFS.md`, `DESIGN.md` créés ; trois planches V1 de la page Notes.
