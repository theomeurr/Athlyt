/* ===========================================================================
   Athlyt — préparation physique & athlétique (PWA vanilla)
   v1 : Exercices · Séances · Séance guidée · Minuteur d'intervalle
   Persistance : localStorage. Aucune dépendance hors Chart.js (CDN).
   =========================================================================== */
'use strict';

/* ----------------------------------------------------------------- Constantes */
const STORAGE_KEY = 'athlyt-data-v1';

const CATEGORIES = [
  { id: 'force',     name: 'Force',      color: '#c8ff2e', emoji: '🏋️' },
  { id: 'vitesse',   name: 'Vitesse',    color: '#2dd4ff', emoji: '⚡' },
  { id: 'plio',      name: 'Pliométrie', color: '#ff5d6c', emoji: '🦘' },
  { id: 'endurance', name: 'Endurance',  color: '#34d399', emoji: '🏃' },
  { id: 'gainage',   name: 'Gainage',    color: '#ffb020', emoji: '🧱' },
  { id: 'mobilite',  name: 'Mobilité',   color: '#a78bfa', emoji: '🧘' },
];
const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

/* --------------------------------------------------------------------- Utils */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'style') n.setAttribute('style', v);
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) n.setAttribute(k, '');
    else n.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return n;
}

function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}`;
}
function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

/* --------------------------------------------------------------------- Audio */
let _audio;
function audio() {
  if (!_audio) { try { _audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { _audio = null; } }
  return _audio;
}
function beep(freq = 880, dur = 0.14, vol = 0.22) {
  const ctx = audio(); if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = freq;
  o.connect(g); g.connect(ctx.destination);
  const t = ctx.currentTime;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur);
}
const tick    = () => beep(660, 0.07, 0.15);
const goWork  = () => { beep(990, 0.18); setTimeout(() => beep(1320, 0.2), 120); };
const goRest  = () => beep(520, 0.2);
const goDone  = () => { beep(880, 0.18); setTimeout(() => beep(1175, 0.18), 160); setTimeout(() => beep(1568, 0.32), 320); };

/* --------------------------------------------------------------- Persistance */
let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return seed();
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

/* ----------------------------------------------------------- Données d'exemple */
function seed() {
  const E = (name, category, muscles, instructions) => ({ id: uid(), name, category, muscles, instructions, media: '' });
  const exercises = [
    // Force
    E('Squat', 'force', 'Quadriceps, fessiers', 'Dos gainé, descends jusqu’à la parallèle, pousse sur les talons.'),
    E('Soulevé de terre', 'force', 'Chaîne postérieure', 'Dos plat, barre près des tibias, pousse le sol.'),
    E('Développé couché', 'force', 'Pectoraux, triceps', 'Omoplates serrées, barre au niveau des pectoraux.'),
    E('Tractions', 'force', 'Dos, biceps', 'Amplitude complète, menton au-dessus de la barre.'),
    E('Développé militaire', 'force', 'Épaules, triceps', 'Gainage abdos, barre à la verticale au-dessus de la tête.'),
    E('Hip thrust', 'force', 'Fessiers', 'Pousse les hanches vers le haut, verrouille en haut 1 s.'),
    E('Fentes', 'force', 'Quadriceps, fessiers', 'Grand pas, genou arrière vers le sol, buste droit.'),
    E('Rowing barre', 'force', 'Dos', 'Buste penché, tire la barre vers le nombril.'),
    // Vitesse
    E('Sprint 30 m', 'vitesse', 'Globale', 'Départ explosif, accélération progressive, relâché en fin de course.'),
    E('Sprint résisté', 'vitesse', 'Globale', 'Élastique/traîneau, pousse fort sur les premiers appuis.'),
    E('Montées de genoux', 'vitesse', 'Fléchisseurs hanche', 'Fréquence haute, genoux à hauteur de hanche.'),
    E('Talons-fesses', 'vitesse', 'Ischio-jambiers', 'Talons qui claquent les fessiers, buste droit.'),
    E('Démarrages 10 m', 'vitesse', 'Globale', 'Position basse, 3 appuis explosifs puis relâche.'),
    // Pliométrie
    E('Squat sauté', 'plio', 'Quadriceps, mollets', 'Descends puis saute le plus haut possible, réception amortie.'),
    E('Box jumps', 'plio', 'Globale', 'Saute sur la box, réception douce, redescends contrôlé.'),
    E('Fentes sautées', 'plio', 'Quadriceps, fessiers', 'Alterne les jambes en l’air, réception stable.'),
    E('Bonds horizontaux', 'plio', 'Chaîne postérieure', 'Enchaîne des sauts vers l’avant, gagne en distance.'),
    E('Drop jump', 'plio', 'Mollets, quadriceps', 'Descends de la box, rebondis immédiatement vers le haut.'),
    // Endurance
    E('Course continue', 'endurance', 'Cardio', 'Allure régulière et confortable, respiration maîtrisée.'),
    E('Fractionné 30/30', 'endurance', 'Cardio', '30 s rapide / 30 s lent, garde une allure constante.'),
    E('Rameur', 'endurance', 'Globale', 'Jambes-tronc-bras à la traction, retour bras-tronc-jambes.'),
    E('Corde à sauter', 'endurance', 'Mollets, cardio', 'Petits sauts, poignets qui tournent, rythme régulier.'),
    E('Vélo', 'endurance', 'Cardio', 'Cadence fluide, ajuste la résistance selon l’objectif.'),
    // Gainage
    E('Planche', 'gainage', 'Abdos profonds', 'Corps aligné, fessiers serrés, ne creuse pas le dos.'),
    E('Planche latérale', 'gainage', 'Obliques', 'Appui sur l’avant-bras, hanches hautes et alignées.'),
    E('Hollow hold', 'gainage', 'Abdos', 'Bas du dos plaqué au sol, bras et jambes tendus.'),
    E('Mountain climbers', 'gainage', 'Abdos, cardio', 'Position pompe, ramène les genoux en rythme.'),
    E('Superman', 'gainage', 'Lombaires, fessiers', 'À plat ventre, lève bras et jambes, tiens 1-2 s.'),
    // Mobilité
    E('Mobilité hanches', 'mobilite', 'Hanches', '90/90 ou fentes mobiles, va chercher l’amplitude doucement.'),
    E('Cat-cow', 'mobilite', 'Colonne', 'Alterne dos rond / dos creux, synchronisé à la respiration.'),
    E('Mobilité chevilles', 'mobilite', 'Chevilles', 'Genou vers l’avant au-delà des orteils, talon ancré.'),
    E('World’s greatest stretch', 'mobilite', 'Globale', 'Fente + rotation thoracique, ouvre la poitrine.'),
    E('Rotation épaules', 'mobilite', 'Épaules', 'Grands cercles avec bâton/élastique, amplitude complète.'),
  ];
  const find = (name) => exercises.find((e) => e.name === name).id;
  const B = (name, sets, reps, load, rest, tempo = '', note = '') => ({ exerciseId: find(name), sets, reps, load, rest, tempo, note });

  const sessions = [
    {
      id: uid(), name: 'Pleine puissance', note: 'Force + explosivité bas du corps',
      blocks: [
        B('Mobilité hanches', 1, '5 / côté', 'PdC', 30),
        B('Squat', 4, '5', '80 %', 150),
        B('Squat sauté', 4, '6', 'PdC', 120),
        B('Hip thrust', 3, '8', '', 120),
        B('Planche', 3, '45 s', 'PdC', 60),
      ],
    },
    {
      id: uid(), name: 'Vitesse & gainage', note: 'Vivacité et zone de force centrale',
      blocks: [
        B('Montées de genoux', 3, '20 s', 'PdC', 45),
        B('Sprint 30 m', 6, '1', 'max', 90),
        B('Bonds horizontaux', 4, '5', 'PdC', 90),
        B('Mountain climbers', 3, '30 s', 'PdC', 45),
        B('Planche latérale', 3, '30 s / côté', 'PdC', 45),
      ],
    },
  ];

  return { exercises, sessions, history: [], settings: { seeded: true } };
}

/* --------------------------------------------------------------- UI : toasts */
function toast(msg, type = '') {
  const root = $('#toast-root');
  const t = el('div', { class: 'toast ' + type, text: msg });
  root.append(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2200);
  setTimeout(() => t.remove(), 2600);
}

/* --------------------------------------------------------------- UI : modale */
function openModal({ title, body }) {
  const root = $('#modal-root');
  const close = () => { root.innerHTML = ''; };
  const modal = el('div', { class: 'modal' },
    el('div', { class: 'modal-head' },
      el('h3', { text: title }),
      el('button', { class: 'modal-close', html: '&times;', onClick: close }),
    ),
    body,
  );
  const backdrop = el('div', { class: 'modal-backdrop', onClick: (e) => { if (e.target === backdrop) close(); } }, modal);
  root.innerHTML = '';
  root.append(backdrop);
  return close;
}

function confirmDialog(message, onYes, { danger = false, yesLabel = 'Confirmer' } = {}) {
  const yes = el('button', { class: 'btn ' + (danger ? 'btn-danger' : 'btn-primary'), text: yesLabel });
  const no  = el('button', { class: 'btn btn-ghost', text: 'Annuler' });
  const close = openModal({
    title: 'Confirmer',
    body: el('div', {},
      el('p', { text: message, style: 'color:var(--muted);margin-bottom:6px' }),
      el('div', { class: 'form-actions' }, no, yes),
    ),
  });
  no.onclick = close;
  yes.onclick = () => { close(); onYes(); };
}

/* ===========================================================================
   ROUTAGE / VUES
   =========================================================================== */
const ROUTES = [
  { id: 'seances',    name: 'Séances',    ico: '📋', render: viewSeances,    fab: 'Nouvelle séance' },
  { id: 'exercices',  name: 'Exercices',  ico: '💪', render: viewExercices,  fab: 'Nouvel exercice' },
  { id: 'minuteur',   name: 'Minuteur',   ico: '⏱️', render: viewMinuteur },
  { id: 'historique', name: 'Historique', ico: '📈', render: viewHistorique },
];

const ui = { route: 'seances', editSession: null, exFilter: 'all', exSearch: '' };

function buildNav() {
  const wrap = $('#nav-items');
  wrap.innerHTML = '';
  ROUTES.forEach((r) => {
    const b = el('button', {
      class: 'nav-btn' + (r.id === ui.route ? ' active' : ''),
      onClick: () => { ui.editSession = null; go(r.id); closeNav(); },
    }, el('span', { class: 'ico', text: r.ico }), el('span', { text: r.name }));
    wrap.append(b);
  });
}

function go(routeId) {
  ui.route = routeId;
  buildNav();
  render();
}

function render() {
  const main = $('#main');
  main.innerHTML = '';
  const fab = $('#fab');
  const route = ROUTES.find((r) => r.id === ui.route);

  if (ui.route === 'seances' && ui.editSession) {
    fab.hidden = true;
    main.append(viewSessionEditor(ui.editSession));
    return;
  }

  main.append(route.render());

  if (route.fab) {
    fab.hidden = false;
    fab.onclick = ui.route === 'seances' ? createSession : openExerciseEditor;
  } else {
    fab.hidden = true;
  }
}

function viewHead(title, subtitle) {
  return el('div', { class: 'view-head' },
    el('h2', { text: title }),
    subtitle && el('p', { text: subtitle }),
  );
}

function emptyState(emoji, title, text, actionLabel, action) {
  const btn = actionLabel && el('button', { class: 'btn btn-primary', text: actionLabel, onClick: action });
  return el('div', { class: 'empty' },
    el('div', { class: 'big', text: emoji }),
    el('h3', { text: title }),
    el('p', { text: text }),
    btn,
  );
}

/* ----------------------------------------------------------- Vue : Exercices */
function viewExercices() {
  const wrap = el('div', {});
  wrap.append(viewHead('Exercices', `${state.exercises.length} mouvements dans ta bibliothèque`));

  const search = el('input', {
    class: 'search', type: 'search', placeholder: 'Rechercher un exercice…', value: ui.exSearch,
    oninput: (e) => { ui.exSearch = e.target.value; renderList(); },
  });
  wrap.append(el('div', { class: 'toolbar' }, search));

  const chips = el('div', { class: 'chips' });
  const mkChip = (id, label) => el('button', {
    class: 'chip' + (ui.exFilter === id ? ' active' : ''),
    text: label, onClick: () => { ui.exFilter = id; render(); },
  });
  chips.append(mkChip('all', 'Tous'));
  CATEGORIES.forEach((c) => chips.append(mkChip(c.id, `${c.emoji} ${c.name}`)));
  wrap.append(chips);

  const list = el('div', { style: 'margin-top:16px' });
  wrap.append(list);

  function renderList() {
    list.innerHTML = '';
    const q = ui.exSearch.trim().toLowerCase();
    const items = state.exercises
      .filter((e) => ui.exFilter === 'all' || e.category === ui.exFilter)
      .filter((e) => !q || e.name.toLowerCase().includes(q) || (e.muscles || '').toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (!items.length) {
      list.append(emptyState('🔍', 'Aucun exercice', 'Modifie ta recherche ou ajoute un nouvel exercice.', 'Nouvel exercice', openExerciseEditor));
      return;
    }
    items.forEach((ex) => {
      const c = catById(ex.category);
      const card = el('div', { class: 'card tappable', onClick: () => openExerciseEditor(ex) },
        el('div', { class: 'card-row' },
          el('div', {},
            el('div', { class: 'card-title', text: ex.name }),
            ex.muscles && el('div', { class: 'card-sub', text: ex.muscles }),
          ),
          el('span', { class: 'cat-tag' }, el('span', { class: 'cat-dot', style: `background:${c.color}` }), c.name),
        ),
        ex.instructions && el('div', { class: 'card-sub', style: 'margin-top:8px', text: ex.instructions }),
      );
      list.append(card);
    });
  }
  renderList();
  return wrap;
}

function openExerciseEditor(ex) {
  const editing = ex && ex.id;
  const name = el('input', { type: 'text', value: editing ? ex.name : '', placeholder: 'Ex : Squat bulgare' });
  const cat = el('select', {});
  CATEGORIES.forEach((c) => cat.append(el('option', { value: c.id, text: `${c.emoji} ${c.name}`, selected: editing && ex.category === c.id })));
  const muscles = el('input', { type: 'text', value: editing ? (ex.muscles || '') : '', placeholder: 'Muscles ciblés' });
  const instr = el('textarea', { placeholder: 'Consignes d’exécution (optionnel)' }, editing ? (ex.instructions || '') : '');

  const del = editing && el('button', {
    class: 'btn btn-danger', text: 'Supprimer',
    onClick: () => confirmDialog(`Supprimer « ${ex.name} » ?`, () => {
      state.exercises = state.exercises.filter((e) => e.id !== ex.id);
      state.sessions.forEach((s) => { s.blocks = s.blocks.filter((b) => b.exerciseId !== ex.id); });
      save(); close(); render(); toast('Exercice supprimé');
    }, { danger: true, yesLabel: 'Supprimer' }),
  });
  const saveBtn = el('button', {
    class: 'btn btn-primary', text: editing ? 'Enregistrer' : 'Ajouter',
    onClick: () => {
      const nm = name.value.trim();
      if (!nm) { toast('Donne un nom à l’exercice', 'error'); return; }
      if (editing) {
        Object.assign(ex, { name: nm, category: cat.value, muscles: muscles.value.trim(), instructions: instr.value.trim() });
      } else {
        state.exercises.push({ id: uid(), name: nm, category: cat.value, muscles: muscles.value.trim(), instructions: instr.value.trim(), media: '' });
      }
      save(); close(); render(); toast(editing ? 'Exercice mis à jour' : 'Exercice ajouté', 'success');
    },
  });

  const close = openModal({
    title: editing ? 'Modifier l’exercice' : 'Nouvel exercice',
    body: el('div', {},
      el('div', { class: 'field' }, el('label', { text: 'Nom' }), name),
      el('div', { class: 'field' }, el('label', { text: 'Catégorie' }), cat),
      el('div', { class: 'field' }, el('label', { text: 'Muscles' }), muscles),
      el('div', { class: 'field' }, el('label', { text: 'Consignes' }), instr),
      el('div', { class: 'form-actions' }, del || el('span', { class: 'spacer' }), saveBtn),
    ),
  });
}

/* ------------------------------------------------------------- Vue : Séances */
function viewSeances() {
  const wrap = el('div', {});
  wrap.append(viewHead('Séances', 'Tes entraînements prêts à dérouler'));

  if (!state.sessions.length) {
    wrap.append(emptyState('📋', 'Aucune séance', 'Crée ta première séance et ajoute-lui des exercices.', 'Nouvelle séance', createSession));
    return wrap;
  }

  state.sessions.forEach((s) => {
    const totalSets = s.blocks.reduce((n, b) => n + (Number(b.sets) || 0), 0);
    const cats = [...new Set(s.blocks.map((b) => catById(exById(b.exerciseId)?.category).color))].slice(0, 5);
    const dots = el('span', { style: 'display:flex;gap:4px' }, ...cats.map((c) => el('span', { class: 'cat-dot', style: `background:${c}` })));

    const card = el('div', { class: 'card tappable', onClick: () => openSessionEditor(s.id) },
      el('div', { class: 'card-row' },
        el('div', {},
          el('div', { class: 'card-title', text: s.name }),
          s.note && el('div', { class: 'card-sub', text: s.note }),
        ),
        dots,
      ),
      el('div', { class: 'meta-line' },
        el('span', {}, el('b', { text: s.blocks.length }), ' exercices'),
        el('span', {}, el('b', { text: totalSets }), ' séries'),
      ),
      el('div', { class: 'row-actions', style: 'margin-top:14px', onClick: (e) => e.stopPropagation() },
        el('button', { class: 'btn btn-primary btn-sm', text: '▶ Démarrer', onClick: () => Guided.start(s.id) }),
        el('button', { class: 'btn btn-ghost btn-sm', text: '✎ Éditer', onClick: () => openSessionEditor(s.id) }),
      ),
    );
    wrap.append(card);
  });
  return wrap;
}

const exById = (id) => state.exercises.find((e) => e.id === id);

function createSession() {
  const s = { id: uid(), name: 'Nouvelle séance', note: '', blocks: [] };
  state.sessions.push(s);
  save();
  openSessionEditor(s.id);
}

function openSessionEditor(id) {
  ui.route = 'seances';
  ui.editSession = id;
  buildNav();
  render();
}

/* --------------------------------------------------- Vue : éditeur de séance */
function viewSessionEditor(id) {
  const s = state.sessions.find((x) => x.id === id);
  if (!s) { ui.editSession = null; return viewSeances(); }

  const wrap = el('div', {});

  const back = el('button', { class: 'btn btn-ghost btn-sm', text: '← Séances', onClick: () => { ui.editSession = null; render(); } });
  wrap.append(el('div', { style: 'margin-bottom:16px' }, back));

  const name = el('input', {
    class: 'search', style: 'font-size:1.3rem;font-weight:800;min-width:0', value: s.name,
    onchange: (e) => { s.name = e.target.value.trim() || 'Séance'; save(); },
  });
  const note = el('input', {
    class: 'search', style: 'margin-top:8px', placeholder: 'Note / objectif de la séance', value: s.note || '',
    onchange: (e) => { s.note = e.target.value.trim(); save(); },
  });
  wrap.append(name, note);
  wrap.append(el('div', { class: 'divider' }));

  const blocksWrap = el('div', {});
  wrap.append(blocksWrap);

  function renderBlocks() {
    blocksWrap.innerHTML = '';
    if (!s.blocks.length) {
      blocksWrap.append(el('p', { class: 'card-sub', style: 'text-align:center;padding:18px 0', text: 'Aucun exercice. Ajoute-en un ci-dessous.' }));
    }
    s.blocks.forEach((b, i) => blocksWrap.append(renderEditorBlock(s, b, i, renderBlocks)));
  }
  renderBlocks();

  wrap.append(el('button', {
    class: 'btn btn-ghost btn-block', style: 'margin-top:4px', text: '＋ Ajouter un exercice',
    onClick: () => pickExercise((ex) => {
      s.blocks.push({ exerciseId: ex.id, sets: 3, reps: '10', load: '', rest: 90, tempo: '', note: '' });
      save(); renderBlocks();
    }),
  }));

  wrap.append(el('div', { class: 'divider' }));
  wrap.append(el('div', { class: 'form-actions' },
    el('button', {
      class: 'btn btn-danger', text: 'Supprimer la séance',
      onClick: () => confirmDialog(`Supprimer « ${s.name} » ?`, () => {
        state.sessions = state.sessions.filter((x) => x.id !== s.id);
        save(); ui.editSession = null; render(); toast('Séance supprimée');
      }, { danger: true, yesLabel: 'Supprimer' }),
    }),
    el('button', {
      class: 'btn btn-primary', text: '▶ Démarrer la séance',
      onClick: () => { if (!s.blocks.length) { toast('Ajoute au moins un exercice', 'error'); return; } Guided.start(s.id); },
    }),
  ));

  return wrap;
}

function renderEditorBlock(s, b, i, refresh) {
  const ex = exById(b.exerciseId);
  const c = catById(ex?.category);
  const field = (label, value, key, opts = {}) => {
    const inp = el('input', {
      type: opts.type || 'text', value: value, inputmode: opts.type === 'number' ? 'numeric' : null,
      onchange: (e) => { b[key] = opts.type === 'number' ? (parseInt(e.target.value, 10) || 0) : e.target.value; save(); },
    });
    return el('div', { class: 'field' }, el('label', { text: label }), inp);
  };
  const moveBtn = (dir, label) => el('button', {
    class: 'btn btn-ghost btn-icon', text: label, disabled: (dir < 0 && i === 0) || (dir > 0 && i === s.blocks.length - 1),
    onClick: () => { const j = i + dir; [s.blocks[i], s.blocks[j]] = [s.blocks[j], s.blocks[i]]; save(); refresh(); },
  });

  return el('div', { class: 'editor-block' },
    el('div', { class: 'editor-block-head' },
      el('div', { class: 'name' }, el('span', { class: 'cat-dot', style: `background:${c.color}` }), ex ? ex.name : 'Exercice supprimé'),
      el('div', { class: 'block-move' },
        moveBtn(-1, '↑'), moveBtn(1, '↓'),
        el('button', { class: 'btn btn-danger btn-icon', text: '✕', onClick: () => { s.blocks.splice(i, 1); save(); refresh(); } }),
      ),
    ),
    el('div', { class: 'mini-grid' },
      field('Séries', b.sets, 'sets', { type: 'number' }),
      field('Reps', b.reps, 'reps'),
      field('Charge', b.load, 'load'),
      field('Repos (s)', b.rest, 'rest', { type: 'number' }),
    ),
  );
}

function pickExercise(onPick) {
  const search = el('input', { class: 'search', type: 'search', placeholder: 'Rechercher…', style: 'margin-bottom:12px' });
  const list = el('div', { style: 'max-height:50vh;overflow-y:auto' });
  let filter = 'all';

  const chips = el('div', { class: 'chips', style: 'margin-bottom:12px' });
  chips.append(el('button', { class: 'chip active', text: 'Tous', onClick: (e) => { filter = 'all'; setActive(e.target); renderPick(); } }));
  CATEGORIES.forEach((c) => chips.append(el('button', { class: 'chip', text: c.emoji + ' ' + c.name, onClick: (e) => { filter = c.id; setActive(e.target); renderPick(); } })));
  function setActive(node) { [...chips.children].forEach((ch) => ch.classList.remove('active')); node.classList.add('active'); }

  function renderPick() {
    list.innerHTML = '';
    const q = search.value.trim().toLowerCase();
    const items = state.exercises
      .filter((e) => filter === 'all' || e.category === filter)
      .filter((e) => !q || e.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!items.length) { list.append(el('p', { class: 'card-sub', style: 'text-align:center;padding:18px', text: 'Aucun exercice trouvé.' })); return; }
    items.forEach((ex) => {
      const c = catById(ex.category);
      list.append(el('div', { class: 'card tappable', style: 'margin-bottom:8px;padding:12px 14px', onClick: () => { onPick(ex); close(); toast('Ajouté à la séance', 'success'); } },
        el('div', { class: 'card-row' },
          el('div', { class: 'card-title', style: 'font-size:.95rem', text: ex.name }),
          el('span', { class: 'cat-dot', style: `background:${c.color}` }),
        ),
      ));
    });
  }
  search.oninput = renderPick;
  renderPick();
  const close = openModal({ title: 'Choisir un exercice', body: el('div', {}, search, chips, list) });
}

/* ===========================================================================
   SÉANCE GUIDÉE (overlay plein écran + chrono de repos)
   =========================================================================== */
const Guided = {
  session: null, idx: 0, done: {}, startedAt: 0, restHandle: null, restLeft: 0,

  start(id) {
    const s = state.sessions.find((x) => x.id === id);
    if (!s || !s.blocks.length) { toast('Séance vide', 'error'); return; }
    audio();
    this.session = s; this.idx = 0; this.done = {}; this.startedAt = Date.now();
    s.blocks.forEach((_, i) => { this.done[i] = []; });
    this.renderOverlay();
    closeNav();
  },

  totalSets() { return this.session.blocks.reduce((n, b) => n + (Number(b.sets) || 0), 0); },
  doneSets() { return Object.values(this.done).reduce((n, arr) => n + arr.filter(Boolean).length, 0); },

  renderOverlay() {
    const root = $('#overlay-root');
    const b = this.session.blocks[this.idx];
    const ex = exById(b.exerciseId);
    const c = catById(ex?.category);
    const nSets = Number(b.sets) || 1;

    const sets = el('div', { class: 'sets-track' });
    for (let i = 0; i < nSets; i++) {
      const isDone = !!this.done[this.idx][i];
      const row = el('div', { class: 'set-row' + (isDone ? ' done' : ''), onClick: () => this.toggleSet(i) },
        el('div', { class: 's-check', text: '✓' }),
        el('div', { class: 's-label', text: `Série ${i + 1}` }),
        el('div', { class: 's-target', text: [b.reps && `${b.reps} reps`, b.load].filter(Boolean).join(' · ') }),
      );
      sets.append(row);
    }

    const last = this.idx === this.session.blocks.length - 1;
    const body = el('div', { class: 'overlay-body' },
      el('div', { class: 'progressbar' }, el('span', { style: `width:${(this.doneSets() / this.totalSets()) * 100}%` })),
      el('div', { class: 'guide-ex' },
        el('span', { class: 'cat-tag g-cat' }, el('span', { class: 'cat-dot', style: `background:${c.color}` }), c.name),
        el('div', { class: 'g-name', text: ex ? ex.name : 'Exercice' }),
        el('div', { class: 'g-target' }, 'Objectif : ', el('b', { text: `${b.sets} × ${b.reps || '—'}` }), b.load ? ` @ ${b.load}` : ''),
        ex && ex.instructions && el('div', { class: 'g-note', text: ex.instructions }),
        sets,
        el('div', { class: 'guide-nav' },
          el('button', { class: 'btn btn-ghost', text: '← Précédent', disabled: this.idx === 0, onClick: () => this.move(-1) }),
          last
            ? el('button', { class: 'btn btn-primary', text: '✓ Terminer', onClick: () => this.finish() })
            : el('button', { class: 'btn btn-primary', text: 'Suivant →', onClick: () => this.move(1) }),
        ),
      ),
    );

    const overlay = el('div', { class: 'overlay' },
      el('div', { class: 'overlay-head' },
        el('div', { class: 'title', text: `${this.idx + 1}/${this.session.blocks.length} · ${this.session.name}` }),
        el('button', { class: 'close', html: '&times;', onClick: () => this.confirmQuit() }),
      ),
      body,
    );
    root.innerHTML = '';
    root.append(overlay);
  },

  toggleSet(i) {
    const arr = this.done[this.idx];
    arr[i] = !arr[i];
    const b = this.session.blocks[this.idx];
    const lastSet = this.idx === this.session.blocks.length - 1 && i === (Number(b.sets) - 1);
    // On (ré)affiche d'abord, PUIS on lance le repos : renderOverlay vide #overlay-root,
    // donc la bannière de repos doit être ajoutée après le rendu pour rester visible.
    this.stopRest();
    this.renderOverlay();
    if (arr[i] && Number(b.rest) > 0 && !lastSet) this.startRest(Number(b.rest));
  },

  move(dir) { this.stopRest(); this.idx = Math.min(this.session.blocks.length - 1, Math.max(0, this.idx + dir)); this.renderOverlay(); },

  /* ---- chrono de repos ---- */
  startRest(sec) {
    this.stopRest();
    this.restLeft = sec;
    const num = el('div', { class: 'r-num', text: fmtClock(this.restLeft) });
    const banner = el('div', { class: 'rest-banner' },
      el('span', { style: 'font-size:.8rem;color:var(--muted);font-weight:700', text: 'REPOS' }),
      num,
      el('button', { class: 'r-btn', text: '+15s', onClick: () => { this.restLeft += 15; num.textContent = fmtClock(this.restLeft); } }),
      el('button', { class: 'r-btn', text: 'Passer', onClick: () => this.stopRest() }),
    );
    $('#overlay-root').append(banner);
    this._restBanner = banner;
    this.restHandle = setInterval(() => {
      this.restLeft--;
      if (this.restLeft <= 3 && this.restLeft > 0) tick();
      if (this.restLeft <= 0) { goWork(); this.stopRest(); return; }
      num.textContent = fmtClock(this.restLeft);
    }, 1000);
  },
  stopRest() {
    if (this.restHandle) { clearInterval(this.restHandle); this.restHandle = null; }
    if (this._restBanner) { this._restBanner.remove(); this._restBanner = null; }
  },

  confirmQuit() {
    if (this.doneSets() === 0) { this.close(); return; }
    confirmDialog('Quitter la séance ? Ta progression ne sera pas enregistrée.', () => this.close(), { danger: true, yesLabel: 'Quitter' });
  },

  finish() {
    this.stopRest();
    const durationSec = Math.round((Date.now() - this.startedAt) / 1000);
    const stepper = makeStepper(7, 1, 10, 'RPE');
    const saveBtn = el('button', { class: 'btn btn-primary btn-block' });
    saveBtn.textContent = 'Enregistrer la séance';
    const close = openModal({
      title: 'Séance terminée 💥',
      body: el('div', {},
        el('p', { class: 'card-sub', style: 'margin-bottom:16px', text: `${this.doneSets()}/${this.totalSets()} séries · ${fmtClock(durationSec)}` }),
        el('div', { class: 'field big-num-field' }, el('label', { text: 'Intensité ressentie (RPE)' }), stepper.node),
        saveBtn,
      ),
    });
    saveBtn.onclick = () => {
      state.history.unshift({
        id: uid(), sessionId: this.session.id, name: this.session.name,
        date: new Date().toISOString(), durationSec,
        totalSets: this.totalSets(), doneSets: this.doneSets(), rpe: stepper.value(),
      });
      save(); close(); this.close(); go('historique'); toast('Séance enregistrée 💪', 'success');
    };
  },

  close() { this.stopRest(); $('#overlay-root').innerHTML = ''; this.session = null; },
};

/* Petit stepper réutilisable (valeur entière bornée) */
function makeStepper(initial, min, max, unit) {
  let v = initial;
  const val = el('div', { class: 'val' }, el('span', { text: String(v) }), el('small', { text: unit }));
  const setV = (nv) => { v = Math.max(min, Math.min(max, nv)); val.firstChild.textContent = String(v); };
  const node = el('div', { class: 'stepper' },
    el('button', { text: '–', onClick: () => setV(v - 1) }),
    val,
    el('button', { text: '+', onClick: () => setV(v + 1) }),
  );
  return { node, value: () => v, set: setV };
}

/* ===========================================================================
   MINUTEUR D'INTERVALLE (Tabata / EMOM / AMRAP / Fractionné)
   =========================================================================== */
const Timer = {
  cfg: { mode: 'tabata', work: 20, rest: 10, rounds: 8, interval: 60, amrap: 600, prep: 5 },
  phases: [], idx: 0, remaining: 0, running: false, handle: null, refs: {},

  open() { audio(); this.renderConfig(); },

  renderConfig() {
    const root = $('#overlay-root');
    const modes = [
      { id: 'tabata', name: 'Tabata' },
      { id: 'fractionne', name: 'Fractionné' },
      { id: 'emom', name: 'EMOM' },
      { id: 'amrap', name: 'AMRAP' },
    ];
    const tabs = el('div', { class: 'mode-tabs' });
    modes.forEach((m) => tabs.append(el('button', {
      class: 'chip' + (this.cfg.mode === m.id ? ' active' : ''),
      text: m.name, onClick: () => { this.applyPreset(m.id); this.renderConfig(); },
    })));

    const fields = el('div', {});
    const stepField = (label, key, step, min, max, unit) => {
      const s = makeStepper(this.cfg[key], min, max, unit);
      const orig = s.set;
      s.set = (nv) => { orig(nv); this.cfg[key] = s.value(); };
      // wrap buttons to use step
      const [minus, , plus] = s.node.children;
      minus.onclick = () => { s.set(this.cfg[key] - step); };
      plus.onclick = () => { s.set(this.cfg[key] + step); };
      return el('div', { class: 'field big-num-field', style: 'margin-bottom:18px' }, el('label', { text: label }), s.node);
    };

    const m = this.cfg.mode;
    if (m === 'tabata' || m === 'fractionne') {
      fields.append(stepField('Effort', 'work', 5, 5, 600, 'sec'));
      fields.append(stepField('Repos', 'rest', 5, 0, 600, 'sec'));
      fields.append(stepField('Rounds', 'rounds', 1, 1, 50, 'tours'));
    } else if (m === 'emom') {
      fields.append(stepField('Intervalle', 'interval', 5, 10, 600, 'sec'));
      fields.append(stepField('Rounds', 'rounds', 1, 1, 60, 'minutes'));
    } else if (m === 'amrap') {
      const s = makeStepper(Math.round(this.cfg.amrap / 60), 1, 90, 'min');
      const [minus, , plus] = s.node.children;
      minus.onclick = () => { s.set(s.value() - 1); this.cfg.amrap = s.value() * 60; };
      plus.onclick = () => { s.set(s.value() + 1); this.cfg.amrap = s.value() * 60; };
      fields.append(el('div', { class: 'field big-num-field', style: 'margin-bottom:18px' }, el('label', { text: 'Durée totale' }), s.node));
    }

    const total = this.estimateTotal();
    const overlay = el('div', { class: 'overlay' },
      el('div', { class: 'overlay-head' },
        el('div', { class: 'title', text: '⏱️ Minuteur' }),
        el('button', { class: 'close', html: '&times;', onClick: () => this.close() }),
      ),
      el('div', { class: 'overlay-body' },
        el('div', { class: 'timer-config' },
          tabs,
          fields,
          el('p', { class: 'card-sub', style: 'text-align:center;margin-bottom:18px', text: `Durée estimée : ${fmtClock(total)}` }),
          el('button', { class: 'btn btn-primary btn-block', text: '▶ Démarrer', onClick: () => this.run() }),
        ),
      ),
    );
    root.innerHTML = '';
    root.append(overlay);
  },

  applyPreset(mode) {
    this.cfg.mode = mode;
    if (mode === 'tabata') Object.assign(this.cfg, { work: 20, rest: 10, rounds: 8 });
    if (mode === 'fractionne') Object.assign(this.cfg, { work: 30, rest: 30, rounds: 10 });
    if (mode === 'emom') Object.assign(this.cfg, { interval: 60, rounds: 10 });
    if (mode === 'amrap') Object.assign(this.cfg, { amrap: 600 });
  },

  buildPhases() {
    const p = [];
    const { mode, work, rest, rounds, interval, amrap, prep } = this.cfg;
    if (prep > 0) p.push({ type: 'prep', label: 'Prêt ?', dur: prep });
    if (mode === 'tabata' || mode === 'fractionne') {
      for (let r = 1; r <= rounds; r++) {
        p.push({ type: 'work', label: `Effort ${r}/${rounds}`, dur: work });
        if (rest > 0 && r < rounds) p.push({ type: 'rest', label: `Repos ${r}/${rounds}`, dur: rest });
      }
    } else if (mode === 'emom') {
      for (let r = 1; r <= rounds; r++) p.push({ type: 'work', label: `Minute ${r}/${rounds}`, dur: interval });
    } else if (mode === 'amrap') {
      p.push({ type: 'work', label: 'AMRAP', dur: amrap });
    }
    p.push({ type: 'done', label: 'Terminé 🎉', dur: 0 });
    return p;
  },

  estimateTotal() {
    return this.buildPhases().reduce((n, ph) => n + ph.dur, 0);
  },

  run() {
    this.phases = this.buildPhases();
    this.idx = 0;
    this.remaining = this.phases[0].dur;
    this.running = true;
    this.renderStage();
    this.startTick();
  },

  renderStage() {
    const root = $('#overlay-root');
    const C = 2 * Math.PI * 45;
    const dial = el('div', { class: 'timer-dial' });
    dial.innerHTML = `<svg viewBox="0 0 100 100"><circle class="track" cx="50" cy="50" r="45"></circle><circle class="prog" cx="50" cy="50" r="45" stroke-dasharray="${C}" stroke-dashoffset="0"></circle></svg>`;
    const num = el('div', { class: 'timer-num' });
    dial.append(num);
    const phaseLabel = el('div', { class: 'timer-phase' });
    const round = el('div', { class: 'timer-round' });

    const pauseBtn = el('button', { class: 'btn btn-primary', onClick: () => this.togglePause() });
    const stage = el('div', { class: 'timer-stage' }, phaseLabel, dial, round,
      el('div', { class: 'timer-controls' },
        el('button', { class: 'btn btn-ghost', text: 'Passer', onClick: () => this.skip() }),
        pauseBtn,
        el('button', { class: 'btn btn-ghost', text: 'Stop', onClick: () => this.close() }),
      ),
    );
    const overlay = el('div', { class: 'overlay' },
      el('div', { class: 'overlay-head' },
        el('div', { class: 'title', text: '⏱️ Minuteur' }),
        el('button', { class: 'close', html: '&times;', onClick: () => this.close() }),
      ),
      el('div', { class: 'overlay-body' }, stage),
    );
    root.innerHTML = '';
    root.append(overlay);
    this.refs = { stage, num, phaseLabel, round, prog: $('.prog', dial), C, pauseBtn };
    this.paint();
  },

  paint() {
    const ph = this.phases[this.idx];
    const { num, phaseLabel, round, prog, C, stage, pauseBtn } = this.refs;
    num.textContent = ph.type === 'done' ? '✓' : fmtClock(this.remaining);
    phaseLabel.textContent = ph.label;
    round.textContent = (ph.type === 'work' || ph.type === 'rest') && (this.cfg.mode !== 'amrap')
      ? `Phase ${this.workIndex()}` : '';
    stage.className = 'timer-stage phase-' + ph.type;
    const frac = ph.dur > 0 ? this.remaining / ph.dur : 0;
    prog.setAttribute('stroke-dashoffset', String(C * (1 - frac)));
    pauseBtn.textContent = this.running ? '❚❚ Pause' : '▶ Reprendre';
  },

  workIndex() {
    // numéro lisible de la phase active sur le total
    const real = this.phases.filter((p) => p.type === 'work' || p.type === 'rest');
    const idxReal = this.phases.slice(0, this.idx + 1).filter((p) => p.type === 'work' || p.type === 'rest').length;
    return `${idxReal}/${real.length}`;
  },

  startTick() {
    clearInterval(this.handle);
    this.handle = setInterval(() => {
      if (!this.running) return;
      this.remaining--;
      if (this.remaining <= 3 && this.remaining > 0) tick();
      if (this.remaining <= 0) { this.next(); return; }
      this.paint();
    }, 1000);
  },

  next() {
    this.idx++;
    if (this.idx >= this.phases.length - 1) { // dernière = 'done'
      this.idx = this.phases.length - 1;
      this.running = false;
      clearInterval(this.handle);
      goDone();
      this.paint();
      return;
    }
    const ph = this.phases[this.idx];
    this.remaining = ph.dur;
    if (ph.type === 'work') goWork(); else if (ph.type === 'rest') goRest();
    this.paint();
  },

  skip() { if (this.phases[this.idx].type === 'done') { this.close(); return; } this.remaining = 0; this.next(); },
  togglePause() { this.running = !this.running; this.paint(); },
  close() { clearInterval(this.handle); this.running = false; $('#overlay-root').innerHTML = ''; },
};

/* ----------------------------------------------------------- Vue : Minuteur */
function viewMinuteur() {
  const wrap = el('div', {});
  wrap.append(viewHead('Minuteur', 'Intervalles pour conditionnement & explosivité'));
  const cards = [
    { mode: 'tabata', emoji: '🔥', name: 'Tabata', desc: '20 s effort / 10 s repos × 8' },
    { mode: 'fractionne', emoji: '🏃', name: 'Fractionné', desc: 'Effort / repos personnalisables' },
    { mode: 'emom', emoji: '⏲️', name: 'EMOM', desc: 'Un bloc à lancer chaque minute' },
    { mode: 'amrap', emoji: '♾️', name: 'AMRAP', desc: 'Max de tours sur un temps donné' },
  ];
  cards.forEach((c) => {
    wrap.append(el('div', { class: 'card tappable', onClick: () => { Timer.applyPreset(c.mode); Timer.open(); } },
      el('div', { class: 'card-row' },
        el('div', {},
          el('div', { class: 'card-title' }, `${c.emoji} ${c.name}`),
          el('div', { class: 'card-sub', text: c.desc }),
        ),
        el('span', { class: 'btn btn-primary btn-sm', text: '▶' }),
      ),
    ));
  });
  return wrap;
}

/* --------------------------------------------------------- Vue : Historique */
let _histChart;
function viewHistorique() {
  const wrap = el('div', {});
  wrap.append(viewHead('Historique', 'Tes séances réalisées'));

  if (!state.history.length) {
    wrap.append(emptyState('📈', 'Pas encore de séance', 'Démarre une séance et termine-la pour la retrouver ici.', 'Voir mes séances', () => go('seances')));
    return wrap;
  }

  const now = new Date();
  const weekAgo = new Date(now - 7 * 864e5);
  const thisWeek = state.history.filter((h) => new Date(h.date) >= weekAgo).length;
  wrap.append(el('div', { class: 'meta-line', style: 'margin-bottom:16px' },
    el('span', {}, el('b', { text: state.history.length }), ' séances'),
    el('span', {}, el('b', { text: thisWeek }), ' cette semaine'),
  ));

  // Graphe : séries réalisées sur les 10 dernières séances
  const recent = state.history.slice(0, 10).reverse();
  if (window.Chart && recent.length > 1) {
    const canvas = el('canvas', { height: '160' });
    wrap.append(el('div', { class: 'card', style: 'padding:14px' }, canvas));
    setTimeout(() => {
      if (_histChart) _histChart.destroy();
      _histChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: recent.map((h) => fmtDate(h.date)),
          datasets: [{ label: 'Séries', data: recent.map((h) => h.doneSets), backgroundColor: '#c8ff2e', borderRadius: 6 }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#93a0b3', font: { size: 10 } } },
            y: { grid: { color: '#26303f' }, ticks: { color: '#93a0b3', precision: 0 }, beginAtZero: true },
          },
        },
      });
    }, 0);
  }

  state.history.forEach((h) => {
    wrap.append(el('div', { class: 'card' },
      el('div', { class: 'card-row' },
        el('div', {},
          el('div', { class: 'card-title', text: h.name }),
          el('div', { class: 'card-sub', text: fmtDate(h.date) }),
        ),
        el('button', { class: 'btn btn-danger btn-icon', text: '✕', onClick: () => confirmDialog('Supprimer cette entrée ?', () => { state.history = state.history.filter((x) => x.id !== h.id); save(); render(); }, { danger: true, yesLabel: 'Supprimer' }) }),
      ),
      el('div', { class: 'meta-line' },
        el('span', {}, el('b', { text: `${h.doneSets}/${h.totalSets}` }), ' séries'),
        el('span', {}, el('b', { text: fmtClock(h.durationSec) }), ' durée'),
        h.rpe && el('span', {}, 'RPE ', el('b', { text: h.rpe })),
      ),
    ));
  });
  return wrap;
}

/* ===========================================================================
   IMPORT / EXPORT / RESET + navigation mobile
   =========================================================================== */
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: `athlyt-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast('Données exportées', 'success');
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.exercises || !data.sessions) throw new Error('format');
      state = Object.assign({ exercises: [], sessions: [], history: [], settings: {} }, data);
      save(); render(); toast('Données importées', 'success');
    } catch (e) { toast('Fichier invalide', 'error'); }
  };
  reader.readAsText(file);
}
function resetData() {
  confirmDialog('Tout réinitialiser ? Tes séances, exercices et historique seront effacés.', () => {
    state = seed(); save(); ui.editSession = null; render(); toast('Réinitialisé');
  }, { danger: true, yesLabel: 'Réinitialiser' });
}

function openNav() { document.body.classList.add('nav-open'); }
function closeNav() { document.body.classList.remove('nav-open'); }

/* --------------------------------------------------------------------- Init */
function init() {
  buildNav();
  render();

  $('#menu-toggle').onclick = openNav;
  $('#nav-backdrop').onclick = closeNav;
  $('#export-btn').onclick = exportData;
  $('#import-btn').onclick = () => $('#import-file').click();
  $('#import-file').onchange = (e) => { if (e.target.files[0]) importData(e.target.files[0]); };
  $('#reset-btn').onclick = resetData;

  // déverrouille l'audio au 1er contact
  const unlock = () => { audio(); document.removeEventListener('pointerdown', unlock); };
  document.addEventListener('pointerdown', unlock);

  setTimeout(() => $('#splash')?.classList.add('hide'), 600);
}

init();
