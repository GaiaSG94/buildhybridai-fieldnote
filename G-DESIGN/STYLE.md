# STYLE — Fieldnote · direction « Orbite »

Validée par Gaia le 2026-11-18 (V3, planche `planches/v3/02-orbite.html`). Desktop 1440 × 900 uniquement, pensé pour une capture vidéo 16:9. Aucune version mobile.

## 1. Idée

La nuit sur le terrain. L'appareil est posé au sol, son écran rouge allumé. Quand le réseau revient, un **faisceau** part de l'appareil vers les nuages : c'est la liaison montante. Les notes sont des **roches en orbite** autour du faisceau. Plus une note est traitée, plus elle monte :

| État | Altitude | Matière | Couleur |
|---|---|---|---|
| LOCAL (résumée sur l'appareil, en file) | basse, près du sol | braises rouges dans les fissures | `#ff4b3a` |
| SENDING (en cours d'envoi) | milieu, sur l'orbite | liseré chaud, **réticule verrouillé** | `#ff4b3a` (réticule) |
| CLOUD (synchronisée, enrichie) | haute, sous les nuages | givre froid, liseré glacé | `#cfe6ff` |
| CLOUD en sommeil (hors-ligne) | haute, éteinte | roche nue, sans liseré | `#8b9099` |

Sans réseau, le faisceau s'éteint, les nuages se ferment et l'écran de l'appareil devient la seule source de lumière.

## 2. Palette

| Jeton | Hex | Usage |
|---|---|---|
| `--night` | `#050608` | fond, sous la scène |
| `--white` | `#eceef0` | texte principal |
| `--dim` | `#eceef0` à 55 % | texte secondaire, métadonnées |
| `--faint` | `#eceef0` à 22 % | filets, séparateurs |
| `--red` | `#ff4b3a` | **seul accent** : local, réticule, action principale |
| `--ice` | `#cfe6ff` | cloud, faisceau |
| `--sleep` | `#8b9099` | cloud indisponible (hors-ligne) |
| `--ok` | `#6ff0a4` | pastille « online » uniquement |

Règle : le rouge et le glacé ne se mélangent jamais sur un même objet. Pas de dégradé d'interface : la lumière vient de la scène.

## 3. Typographie

Polices libres (OFL), embarquées dans chaque fichier.

| Rôle | Police | Taille / graisse | Interlettrage |
|---|---|---|---|
| Titre de scène | Archivo | 46 px / 300 | −0,025 em |
| Corps de note | Archivo | 15–16 px / 400 | 0 |
| Texte secondaire | Archivo | 12,5 px / 400, `--dim` | 0 |
| HUD, étiquettes, heures | DM Mono | 9,5–11 px / 400–500 | 0,1–0,2 em, capitales |
| Compteurs | DM Mono | 11 px, chiffre en `--white` | 0,06 em |

Deux voix seulement : une grotesque fine qui parle, un mono minuscule qui mesure.

## 4. Grille et cadre

- Marges extérieures : 36 px.
- Cadre fixe sur toutes les pages : marque en haut à gauche, compteur centré en haut (`03 / 06 IN ORBIT · 03 SYNCED`), index des pages en haut à droite (`01 Notes … 05 Offline`), signal réseau sous la marque, règle graduée verticale sur le bord droit.
- Le compositeur occupe toujours la bande basse, séparé par un filet `--faint`.
- La scène occupe tout l'écran ; aucun panneau n'est opaque.

## 5. Composants

- **Étiquette d'objet** : petit carré au trait sur l'objet, trait fin vers le texte ; état en capitales (couleur de l'état), puis `N° · heure`, puis la mesure (latence, rang dans la file, mots-clés).
- **Réticule** : lignes plein écran à 50 %, graduations tous les 34 px, cercle pointillé qui tourne lentement (9 s), crochets carrés. Un seul réticule par écran, sur l'objet actif.
- **Crochets de sélection** : quatre coins au trait, pour un résultat de recherche.
- **Panneau de lecture** : verre sombre `rgba(10,6,6,.5)` + flou 10 px, filet rouge à 45 %, en-tête mono rouge, sections séparées par un pointillé.
- **Bouton principal** : fond rouge, texte mono capitales noir-rouge, halo rouge. Bouton secondaire : contour `--faint`.
- **Orbites** : ellipses pointillées autour du faisceau à 22 % d'opacité, rouge en bas, glacé en haut.

## 6. Mouvement

- Une courbe : `cubic-bezier(.22,1,.36,1)`.
- Animations permanentes limitées à : caret (1 s), rotation du réticule (9 s), pastille hors-ligne qui clignote. Rien d'autre ne bouge sans action.
- Transition d'état (vidéo) : une roche monte d'une orbite à l'autre ; le réticule la suit.

## 7. Règles d'états

- Chaque note affiche **toujours** son état et sa latence sur l'appareil ; la latence cloud apparaît seulement une fois la note enrichie.
- La recherche ne montre de score que sous la forme « termes trouvés / termes de la requête » (fidèle au code : recherche par mots communs, pas d'embeddings).
- Hors-ligne : rien de cloud n'est caché, tout est **en sommeil** (gris, sans liseré) ; le local continue normalement.
