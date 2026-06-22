# Athlyt

**Athlyt — Prépare. Exécute. Progresse.**

Compagnon de **préparation physique et athlétique**. Là où [Athelio](../Athelio) journalise *ce que tu as fait*, Athlyt s'occupe de *comment tu t'entraînes* : tu construis tes séances, tu les déroules en mode guidé avec chrono, et tu minutes tes intervalles.

PWA installable, hors-ligne, orientation **polyvalente multisport** : Force · Vitesse · Pliométrie · Endurance · Gainage · Mobilité.

## Écrans

- **Accueil** — progression de la semaine (anneau), séance du jour recommandée, accès rapides, activité récente.
- **Séances** — cartes de séances, création/édition (exos × séries × reps × charge × repos), démarrage en mode guidé.
- **Exercices** — bibliothèque catégorisée, recherche + filtres, fiche exercice (muscles, consignes).
- **Minuteur** — Tabata · Fractionné · EMOM · AMRAP (cadran, signaux sonores).
- **Activité** — stats, graphe des séries par séance, historique.
- **Séance guidée** — déroulé exercice par exercice, validation des séries, chrono de repos automatique, bilan (séries / durée / RPE).
- **Paramètres** (icône ⚙️ sur l'Accueil) — apparence (thème clair/sombre, accent), entraînement (disciplines, objectif, niveau, séances/semaine), rappels, réinitialisation des données.
- **Importer une séance** (icône ⛶ sur Séances) — trois onglets : **Texte** (colle/écris), **Photo** (OCR), **Modèle**. Le parseur (`parseWorkout`) reconnaît `Nom — séries x reps`, les préfixes `1.A.`, et les sections (Plyometrics, Strength, Trunk…), infère la catégorie, puis crée les exercices manquants (dédoublonnés) + la séance.
  - **OCR photo** : lecture d'une capture **sur l'appareil, hors-ligne** via Tesseract.js (vendorisé dans `vendor/tesseract/`, ~9,5 Mo, chargé au 1ᵉʳ usage puis mis en cache). Le texte extrait est éditable avant l'ajout.

Thème **clair/sombre** (préférence système par défaut, réglable dans Paramètres), accent bleu `#1F6BFF`.

## Stack

- **React 18** (UMD, vendorisé dans `vendor/` — aucune dépendance réseau au runtime).
- Le design vient de **Claude Design** : composants dans `src/*.jsx` (styles inline).
- `localStorage` pour la persistance — tes données restent sur ton appareil.
- Service worker offline-first, Web Audio API pour les bips du minuteur.

Le visuel est issu d'une maquette React : le cadre « iPhone » de la maquette et le panneau d'édition ont été retirés pour en faire une vraie app plein écran.

## Développement

Aucun build n'est nécessaire pour **lancer** l'app (`app.js` est déjà transpilé et commité). Il faut seulement (re)builder après avoir édité `src/*.jsx`.

```bash
# Lancer (sans rien installer)
python3 -m http.server 8000      # puis http://localhost:8000
# ou : open index.html

# Modifier le design puis régénérer app.js
npm install                      # outils de dev (babel, sharp…)
npm run build                    # transpile src/*.jsx -> app.js
npm run icons                    # régénère les icônes PNG depuis le SVG
npm run vendor:ocr               # re-copie les assets Tesseract dans vendor/tesseract/
```

### Architecture des sources

| Fichier | Rôle |
|---|---|
| `src/01-data.jsx` | thème (clair/sombre), catégories, données seed, icônes, anneau `Ring`, helpers, audio |
| `src/02-onboarding.jsx` | flux de premier lancement + primitives (Switch, Segmented…) |
| `src/03-overlays.jsx` | séance guidée + minuteur d'intervalle |
| `src/04-editors.jsx` | éditeur d'exercice, éditeur de séance, sélecteur d'exercice |
| `src/05-screens.jsx` | écrans principaux + tab bar |
| `src/06-app.jsx` | racine de l'app (état, thème, navigation) — adaptée de la maquette |

`build.js` concatène et transpile ces fichiers en `app.js`. `vendor/` contient React/ReactDOM.

## Données

L'app démarre **vierge** (aucune donnée d'exemple) : ajoute tes exercices puis construis tes séances. Les données vivent dans `localStorage` (`athlyt-v3`). « Tout effacer » (Paramètres) repart d'un état vierge.
