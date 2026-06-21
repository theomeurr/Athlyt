# Athlyt

**Athlyt — Prépare. Exécute. Progresse.**

Compagnon de **préparation physique et athlétique**. Là où [Athelio](../Athelio) journalise *ce que tu as fait*, Athlyt s'occupe de *comment tu t'entraînes* : tu construis tes séances, tu les déroules en mode guidé avec chrono, et tu minutes tes intervalles.

Orientation **polyvalente multisport** : Force · Vitesse · Pliométrie · Endurance · Gainage · Mobilité.

## Fonctionnalités (v1)

### 💪 Exercices
- Bibliothèque d'exercices catégorisés (force, vitesse, pliométrie, endurance, gainage, mobilité)
- Recherche + filtres par catégorie
- Muscles ciblés et consignes d'exécution
- Ajout / modification / suppression

### 📋 Séances
- Construis une séance : exercices × séries × reps × charge × repos
- Réorganise les blocs, renomme, ajoute une note d'objectif
- Deux séances d'exemple fournies au premier lancement

### ▶️ Séance guidée
- Déroule la séance exercice par exercice
- Coche tes séries au fur et à mesure
- **Chrono de repos automatique** après chaque série (avec +15 s / passer + signal sonore)
- Barre de progression et bilan de fin (séries réalisées, durée, RPE)
- Séance enregistrée dans l'historique

### ⏱️ Minuteur d'intervalle
- **Tabata** (20 s / 10 s × 8), **Fractionné** (effort/repos personnalisables), **EMOM**, **AMRAP**
- Cadran circulaire, décompte de préparation, signaux sonores aux transitions

### 📈 Historique
- Séances réalisées datées, avec graphe des séries (Chart.js)

## Roadmap (v2 envisagée)
Tests & benchmarks athlétiques (sprint, détente, VMA, 1RM) · calculateurs (1RM, % charge, allures) · planning hebdo · charge d'entraînement & gestion de la fatigue · périodisation / affûtage · pont de données avec Athelio.

## Lancer l'app

Pas de build, pas de dépendance à installer.

```bash
# Option 1 : ouvrir directement
open index.html

# Option 2 : serveur local
python3 -m http.server 8000
# puis http://localhost:8000
```

Installable en **PWA** (écran d'accueil iOS/Android) et utilisable **hors-ligne**.

## Stack

- HTML, CSS, JavaScript (vanilla) — même socle qu'Athelio
- [Chart.js](https://www.chartjs.org/) via CDN pour les graphiques
- Web Audio API pour les bips du minuteur (aucun fichier audio)
- `localStorage` pour la persistance — tes données restent sur ton appareil
- Import / export JSON pour sauvegarde et portabilité
- Service worker offline-first

## Design

Le visuel (thème sombre + accent « volt ») est volontairement isolé dans `styles.css` pour être **re-designé facilement avec Claude Design** sans toucher à la logique (`app.js`).

## Données

Au premier lancement, l'app charge une bibliothèque d'exercices et deux séances d'exemple. Utilise **Réinitialiser** dans la barre latérale pour repartir de zéro (exporte d'abord si besoin).
