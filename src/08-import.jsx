// athlyt-import.jsx — import d'une séance depuis du texte (ou un modèle).
// parseWorkout() transforme un texte libre en séance structurée ; l'OCR (photo)
// se branchera dessus en pré-remplissant le texte éditable.

/* ----------------------------------------------------- Parseur texte → séance */
const _SECTION_CAT = [
  [/plyo|plio|jump|saut|bond|hop/i, 'plio'],
  [/strength|force/i, 'force'],
  [/build|hypertroph|muscle|accessor/i, 'force'],
  [/trunk|core|gainage|abdo|abs/i, 'gainage'],
  [/speed|vitesse|sprint|accel/i, 'vitesse'],
  [/endurance|condition|cardio|metcon/i, 'endurance'],
  [/mobil|stretch|étirement|souplesse|warm|échauff/i, 'mobilite'],
];
const _KW_CAT = [
  [/pogo|hop|jump|saut|bond|skater|plyo|drop|box/i, 'plio'],
  [/sprint|dash|accel|navette|shuttle/i, 'vitesse'],
  [/run|course|row(er)?|bike|vélo|velo|rope|corde|cardio|erg|ski/i, 'endurance'],
  [/plank|planche|cobra|hollow|crunch|sit.?up|gainage|abs|abdo|twist|climber|core|dead.?bug|cobra/i, 'gainage'],
  [/stretch|mobil|étirement|cat.?cow|opener/i, 'mobilite'],
  [/press|bench|squat|deadlift|soulev|curl|row|pull|chin|raise|extension|fly|face.?pull|thrust|lunge|fente|dip|push.?up|pompe|shrug|clean|snatch|ohp|military|hinge|rdl/i, 'force'],
];
const _REST = { plio: 75, force: 90, gainage: 45, vitesse: 120, endurance: 60, mobilite: 30 };
const _catFromSection = (l) => { for (const [re, c] of _SECTION_CAT) if (re.test(l)) return c; return null; };
const _catFromName = (nm, fallback) => { for (const [re, c] of _KW_CAT) if (re.test(nm)) return c; return fallback || 'force'; };

function _normReps(s) {
  // NB : pas de \b final — "côté" finit par "é", qui n'est pas un caractère de mot
  // en regex JS, donc \b échouerait juste après.
  return s.replace(/\s+/g, ' ')
    .replace(/\bchaque\s+c[oô]t[eé]s?/gi, '/côté')
    .replace(/\bchaque\s+(?:direction|sens)s?/gi, '/dir')
    .replace(/\bper\s+(?:side|leg)s?/gi, '/côté')
    .trim();
}
function _parseLine(line) {
  // retire les énumérateurs : "1.A.", "4.B.", "1)", "-", "•", "*"
  const s = line.replace(/^\s*(\d+\s*[.)]\s*[A-Za-z]?\.?|[A-Za-z]\.|[-–—•*])\s+/, '').trim();
  // motif :  Nom <sep> <séries> x <reps>
  const m = s.match(/^(.+?)[\s:—–-]+(\d+)\s*[x×]\s*(.+)$/i);
  if (!m) return null;
  const name = m[1].replace(/[\s:—–-]+$/, '').trim();
  const sets = parseInt(m[2], 10);
  const reps = _normReps(m[3]);
  if (!name || name.length > 60 || !sets) return null;
  return { name, sets, reps };
}
function parseWorkout(raw) {
  const lines = String(raw || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let name = '', note = [], section = null, sectionCat = null;
  const items = [];
  const isMeta = (l) => /^(phase|week|semaine|day|jour|bloc|block|session|s[ée]ance|programme)\b/i.test(l)
    || /\b(adaptation|accumulation|intensification|r[ée]alisation|deload|d[ée]charge|affûtage|affutage)\b/i.test(l);
  const looksHeader = (l) => !/\d/.test(l) && l.split(/\s+/).length <= 4;

  for (const line of lines) {
    const ex = _parseLine(line);
    if (ex) {
      const cat = _catFromName(ex.name, sectionCat);
      items.push({ ...ex, load: '', category: cat, rest: _REST[cat] || 75, section: section || '' });
      continue;
    }
    if (isMeta(line)) {
      if (/^(day|jour|s[ée]ance|session)\b/i.test(line) && !name) name = line.replace(/\s*-\s*/g, ' — ');
      else note.push(line);
      continue;
    }
    if (_catFromSection(line) || looksHeader(line)) {
      section = line.replace(/\s*[-–—:]\s*$/, '').trim();
      sectionCat = _catFromSection(line);
      continue;
    }
    // sinon : ligne ignorée (texte parasite)
  }
  return { name: name || 'Séance importée', note: note.join(' · '), items };
}

/* ----------------------------------------------------- Modèles intégrés */
const WORKOUT_TEMPLATES = [
  {
    id: 'p1w1d3',
    title: 'Phase 1 · Semaine 1 · Jour 3',
    sub: 'Plyométrie / Force / Hypertrophie',
    text: `Phase 1 : Week 1 - Adaptation
Day 3 - Plyometrics / Strength / Hypertrophy

Plyometrics - Foundation
Pogo Jumps — 2 x 10 sec
Lateral Pogo Jumps — 2 x 10 yards chaque direction
Line Hops — 2 x 10 sec
Lateral Line Hops — 2 x 10 sec
Alternating Lunge Jumps — 2 x 10 sec
Ascending Skater Jumps — 4 x 10 yards chaque côté

Strength
1.A. Floor Press — 3 x 10
1.B. Facepulls — 3 x 12

Build
Dumbbell Bench Press — 3 x 12
Pull Ups — 3 x Max
Lateral Raises — 3 x 12
4.A. Barbell Curls — 3 x 12
4.B. Reverse Grip Tricep Extension — 3 x 12

Trunk
Prone Cobra — 2 x 60 sec chaque côté`,
  },
];

/* ----------------------------------------------------- OCR (Tesseract, local) */
// Chargé paresseusement : les ~9 Mo d'assets ne sont récupérés qu'à la 1re photo,
// puis mis en cache par le service worker (dispo hors-ligne ensuite).
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = new URL('vendor/tesseract/tesseract.min.js', location.href).href;
    s.onload = () => resolve(window.Tesseract);
    s.onerror = () => reject(new Error('tesseract load failed'));
    document.head.appendChild(s);
  });
}
async function runOCR(file, onProgress) {
  const T = await loadTesseract();
  const base = new URL('vendor/tesseract/', location.href).href;
  const worker = await T.createWorker('eng', 1, {
    workerPath: base + 'worker.min.js',
    corePath: base,
    langPath: base + 'lang',
    logger: (m) => { if (m.status === 'recognizing text' && onProgress) onProgress(Math.round((m.progress || 0) * 100)); },
  });
  try {
    const { data: { text } } = await worker.recognize(file);
    return text;
  } finally {
    await worker.terminate();
  }
}

/* ----------------------------------------------------- Écran d'import */
function ImportScreen({ existing = [], onImport, onClose }) {
  const t = useTheme();
  const [tab, setTab] = React.useState('text');
  const [text, setText] = React.useState('');
  const [nameEdit, setNameEdit] = React.useState(null);
  const [excluded, setExcluded] = React.useState(() => new Set());

  const parsed = React.useMemo(() => parseWorkout(text), [text]);
  const items = parsed.items.filter((_, i) => !excluded.has(i));
  const name = nameEdit != null ? nameEdit : parsed.name;
  const existingNames = React.useMemo(() => new Set(existing.map((e) => e.name.toLowerCase())), [existing]);

  const loadText = (v) => { setText(v); setNameEdit(null); setExcluded(new Set()); };

  // OCR photo
  const fileRef = React.useRef(null);
  const [ocr, setOcr] = React.useState({ status: 'idle', prog: 0, error: null });
  const onPickImage = async (file) => {
    if (!file) return;
    setOcr({ status: 'loading', prog: 0, error: null });
    try {
      const text = await runOCR(file, (p) => setOcr((o) => ({ ...o, prog: p })));
      if (!text || !text.trim()) { setOcr({ status: 'error', prog: 0, error: 'Aucun texte détecté sur l’image.' }); return; }
      loadText(text);
      setOcr({ status: 'idle', prog: 0, error: null });
      setTab('text');
    } catch (e) {
      setOcr({ status: 'error', prog: 0, error: 'Lecture impossible. Réessaie avec une capture nette, ou colle le texte.' });
    }
  };

  // regroupe l'aperçu par section, dans l'ordre d'apparition
  const groups = [];
  parsed.items.forEach((it, i) => {
    if (excluded.has(i)) return;
    let g = groups.find((x) => x.section === it.section);
    if (!g) { g = { section: it.section, list: [] }; groups.push(g); }
    g.list.push({ it, i });
  });

  const TABS = [['text', 'Texte', 'text'], ['photo', 'Photo', 'camera'], ['template', 'Modèle', 'scan']];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 115, background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '58px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onClose} style={iconBtn(t)}><Icon name="chevron-l" size={20} sw={2.2} stroke={t.ink} /></button>
        <div style={{ flex: 1, fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: t.ink }}>Importer une séance</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 20px calc(120px + env(safe-area-inset-bottom))' }}>
        {/* onglets */}
        <div style={{ display: 'flex', background: t.fill, borderRadius: 14, padding: 4, gap: 4, marginBottom: 16 }}>
          {TABS.map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', borderRadius: 10,
              padding: '10px 4px', background: tab === id ? t.surface : 'transparent', color: tab === id ? t.ink : t.sub,
              fontSize: 14.5, fontWeight: 640, boxShadow: tab === id ? t.shadowSm : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <Icon name={icon} size={17} stroke={tab === id ? t.accent : t.sub} /> {label}
            </button>
          ))}
        </div>

        {tab === 'text' && (
          <textarea value={text} onChange={(e) => loadText(e.target.value)} autoFocus
            placeholder={"Colle ou écris ta séance, ex :\n\nStrength\nFloor Press — 3 x 10\nFacepulls — 3 x 12\n\nTrunk\nProne Cobra — 2 x 60 sec"}
            style={{ ...inputStyle(t), minHeight: 150, resize: 'vertical', lineHeight: 1.5, fontSize: 15 }} />
        )}

        {tab === 'photo' && (
          <div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPickImage(e.target.files && e.target.files[0])} />
            {ocr.status === 'loading' ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ display: 'inline-flex' }}>
                  <Ring size={84} stroke={9} value={ocr.prog / 100} gradient={[t.energy1, t.energy2]} track={t.fill}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: t.ink, fontVariantNumeric: 'tabular-nums' }}>{ocr.prog}%</div>
                  </Ring>
                </div>
                <div style={{ marginTop: 16, fontSize: 15, fontWeight: 640, color: t.ink }}>Lecture de la capture…</div>
                <div style={{ marginTop: 4, fontSize: 13, color: t.sub }}>Sur ton appareil, hors-ligne</div>
              </div>
            ) : (
              <>
                <button onClick={() => fileRef.current && fileRef.current.click()} style={{ width: '100%', cursor: 'pointer',
                  border: `1.5px dashed ${t.lineStrong}`, background: t.surface, color: t.ink, borderRadius: 18,
                  padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 52, height: 52, borderRadius: 15, background: t.accentSoft, display: 'flex',
                    alignItems: 'center', justifyContent: 'center' }}><Icon name="camera" size={26} stroke={t.accent} /></span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Choisir une capture</span>
                  <span style={{ fontSize: 13, color: t.sub }}>Photo ou capture d’écran d’une séance</span>
                </button>
                {ocr.error && <p style={{ fontSize: 13.5, color: '#FF5A5F', marginTop: 12 }}>{ocr.error}</p>}
                <p style={{ fontSize: 13, color: t.faint, lineHeight: 1.5, marginTop: 12 }}>
                  Le texte est extrait sur ton appareil (hors-ligne), puis tu le corriges avant l’ajout. Le 1ᵉʳ usage télécharge le moteur OCR (~9 Mo), ensuite c’est instantané.
                </p>
              </>
            )}
          </div>
        )}

        {tab === 'template' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {WORKOUT_TEMPLATES.map((tpl) => {
              const n = parseWorkout(tpl.text).items.length;
              return (
                <button key={tpl.id} onClick={() => { loadText(tpl.text); setTab('text'); }} style={{ width: '100%', textAlign: 'left',
                  cursor: 'pointer', background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: 14, boxShadow: t.shadowSm }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, background: t.accentSoft, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bolt" size={22} stroke={t.accent} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: t.ink }}>{tpl.title}</div>
                    <div style={{ fontSize: 13, color: t.sub, marginTop: 1 }}>{tpl.sub} · {n} exercices</div>
                  </div>
                  <Icon name="chevron" size={18} stroke={t.faint} />
                </button>
              );
            })}
            <p style={{ fontSize: 13, color: t.faint, lineHeight: 1.5, margin: '6px 4px 0' }}>
              Charge un modèle : son contenu s'ouvre dans l'onglet Texte, modifiable avant l'ajout.
            </p>
          </div>
        )}

        {/* aperçu */}
        {parsed.items.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <Label text={`Aperçu · ${items.length} exercice${items.length > 1 ? 's' : ''}`} />
            <input value={name} onChange={(e) => setNameEdit(e.target.value)} placeholder="Nom de la séance"
              style={{ ...inputStyle(t), fontSize: 17, fontWeight: 700, marginBottom: 4 }} />
            {parsed.note && <div style={{ fontSize: 13, color: t.sub, margin: '2px 2px 12px' }}>{parsed.note}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
              {groups.map((g, gi) => (
                <div key={gi}>
                  {g.section && <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, color: t.faint, margin: '0 2px 8px' }}>{g.section}</div>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {g.list.map(({ it, i }) => {
                      const c = catById(it.category);
                      const exists = existingNames.has(it.name.toLowerCase());
                      return (
                        <div key={i} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14, padding: '12px 14px',
                          display: 'flex', alignItems: 'center', gap: 12, boxShadow: t.shadowSm }}>
                          <span style={{ width: 9, height: 9, borderRadius: 99, background: c.color, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 15.5, fontWeight: 650, color: t.ink }}>{it.name}
                              {exists && <span style={{ fontSize: 11, fontWeight: 700, color: t.sub, marginLeft: 8 }}>· déjà créé</span>}
                            </div>
                            <div style={{ fontSize: 13, color: t.sub, marginTop: 1 }}>{it.sets} × {it.reps} · {c.name}</div>
                          </div>
                          <button onClick={() => setExcluded((s) => new Set(s).add(i))} aria-label="Retirer"
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 6, color: t.faint }}>
                            <Icon name="close" size={17} sw={2.2} stroke={t.faint} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'text' && text.trim() && parsed.items.length === 0 && (
          <p style={{ fontSize: 13.5, color: t.faint, lineHeight: 1.5, marginTop: 14 }}>
            Aucun exercice détecté. Une ligne doit ressembler à <b style={{ color: t.sub }}>Nom — séries x reps</b> (ex : « Squat — 3 x 10 »).
          </p>
        )}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 20px calc(20px + env(safe-area-inset-bottom))',
        background: t.bg, borderTop: `1px solid ${t.line}` }}>
        <button disabled={!items.length} onClick={() => onImport({ name, note: parsed.note, items })}
          style={{ ...navBtn(t, true), opacity: items.length ? 1 : 0.5 }}>
          <Icon name="check" size={20} sw={2.6} stroke="#fff" /> Ajouter {items.length ? `(${items.length})` : ''}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { parseWorkout, WORKOUT_TEMPLATES, ImportScreen });
