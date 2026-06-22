// vendor-ocr.js — copie les assets Tesseract.js (OCR hors-ligne) dans vendor/tesseract/.
// Réseau restreint : on sert tout en local. Régénérer : npm run vendor:ocr
// (nécessite les devDependencies tesseract.js / tesseract.js-core / @tesseract.js-data/eng)
const fs = require('fs');
const path = require('path');

const nm = path.join(__dirname, 'node_modules');
const out = path.join(__dirname, 'vendor', 'tesseract');
fs.mkdirSync(path.join(out, 'lang'), { recursive: true });

const cp = (src, dst) => {
  fs.copyFileSync(src, dst);
  console.log('✅', path.relative(__dirname, dst), (fs.statSync(dst).size / 1048576).toFixed(2) + ' Mo');
};

cp(path.join(nm, 'tesseract.js/dist/tesseract.min.js'), path.join(out, 'tesseract.min.js'));
cp(path.join(nm, 'tesseract.js/dist/worker.min.js'), path.join(out, 'worker.min.js'));
// Core LSTM + SIMD (iOS 16.4+/Android récents). Le .wasm.js charge le .wasm voisin.
cp(path.join(nm, 'tesseract.js-core/tesseract-core-simd-lstm.wasm.js'), path.join(out, 'tesseract-core-simd-lstm.wasm.js'));
cp(path.join(nm, 'tesseract.js-core/tesseract-core-simd-lstm.wasm'), path.join(out, 'tesseract-core-simd-lstm.wasm'));
// Données de langue (anglais, variante "best_int" compacte)
cp(path.join(nm, '@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz'), path.join(out, 'lang/eng.traineddata.gz'));

const total = fs.readdirSync(out, { recursive: true })
  .map((f) => path.join(out, f)).filter((f) => fs.statSync(f).isFile())
  .reduce((n, f) => n + fs.statSync(f).size, 0);
console.log('Total vendor/tesseract :', (total / 1048576).toFixed(1) + ' Mo');
