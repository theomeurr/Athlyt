// build.js — transpile les sources JSX du design en un seul app.js (JS classique).
// Aucun build au runtime : on livre app.js déjà transpilé. Pour régénérer après
// avoir édité src/*.jsx :  npm install  &&  npm run build
const fs = require('fs');
const path = require('path');
const Babel = require('@babel/standalone');

const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.jsx')).sort();

let out =
  '// ⚠️ FICHIER GÉNÉRÉ par build.js — ne pas éditer à la main.\n' +
  '// Source : src/*.jsx — régénérer avec `npm run build`.\n' +
  "'use strict';\n";

for (const f of files) {
  const code = fs.readFileSync(path.join(srcDir, f), 'utf8');
  const res = Babel.transform(code, { presets: ['react'], filename: f, compact: false });
  out += `\n/* ======================= ${f} ======================= */\n` + res.code + '\n';
}

fs.writeFileSync(path.join(__dirname, 'app.js'), out);
console.log(`✅ app.js généré (${(out.length / 1024).toFixed(1)} Ko) depuis ${files.length} fichiers : ${files.join(', ')}`);
