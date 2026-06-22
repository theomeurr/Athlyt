// build-icons.js — génère les icônes PNG de la PWA depuis un SVG plein cadre.
// iOS n'accepte pas un apple-touch-icon en SVG : on produit donc des PNG fiables.
// Régénérer : npm run icons   (nécessite sharp en devDependency)
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Plein cadre (pas de coins transparents) pour un rendu correct en "maskable"
// et sur iOS (qui applique lui-même l'arrondi). Éclair centré dans la zone sûre.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1024" height="1024">
  <rect width="100" height="100" fill="#1F6BFF"/>
  <path d="M55 24 L33 56 h16 L45 76 l24 -34 H53 z" fill="#fff"/>
</svg>`;

const targets = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
];

(async () => {
  for (const [name, size] of targets) {
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(__dirname, name));
    console.log('✅', name, `${size}×${size}`);
  }
})();
