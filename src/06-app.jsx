// athlyt-app.jsx — application root.
// Adapté du design Claude pour une vraie PWA plein écran : le cadre « iPhone »
// de la maquette, le panneau d'édition et l'onboarding/connexion ont été retirés.
// Les réglages de l'onboarding sont désormais dans l'écran Paramètres.

const { useState, useEffect, useMemo } = React;

const STORE = 'athlyt-v3'; // bump = on repart d'un état vierge (purge des données de test)
const ACCENT = '#1F6BFF'; // accent par défaut (modifiable dans Paramètres)
const DEFAULT_PREFS = {
  disciplines: ['force', 'vitesse'],
  goal: 'explosivite',
  level: 'Intermédiaire',
  freq: 4,
  reminders: false,
  days: [1, 3, 5],
  time: '18:30',
};

function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function buildTheme(dark, accent) {
  const base = makeTheme(dark);
  return { ...base, accent, accentSoft: hexA(accent, dark ? 0.18 : 0.10), energy2: accent };
}
function loadStore() {
  try { const r = localStorage.getItem(STORE); if (r) return JSON.parse(r); } catch (e) {}
  return null;
}
function prefersDark() {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; }
}

function App() {
  const persisted = useMemo(loadStore, []);
  const [data, setData] = useState(() => persisted?.data || seedData());
  const [tab, setTab] = useState(() => persisted?.tab || 'home');
  const [dark, setDark] = useState(() => persisted?.dark ?? prefersDark());
  const [accent, setAccent] = useState(() => persisted?.accent || ACCENT);
  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, ...(persisted?.prefs || {}) }));

  // overlays / sheets
  const [guidedId, setGuidedId] = useState(null);
  const [timerMode, setTimerMode] = useState(null);
  const [editSessionId, setEditSessionId] = useState(null);
  const [exDetail, setExDetail] = useState(null);
  const [exEdit, setExEdit] = useState(undefined); // undefined = fermé, null = nouveau, obj = édition
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const theme = useMemo(() => buildTheme(dark, accent), [dark, accent]);

  // recherche d'exercice exposée aux helpers d'écran
  useEffect(() => { window.__exLookup = (id) => data.exercises.find((e) => e.id === id); }, [data]);
  window.__exLookup = window.__exLookup || ((id) => data.exercises.find((e) => e.id === id));

  // persistance
  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify({ data, tab, dark, accent, prefs })); } catch (e) {}
  }, [data, tab, dark, accent, prefs]);

  // fond + couleur de barre système alignés sur le thème
  useEffect(() => {
    document.documentElement.style.background = theme.bg2;
    document.body.style.background = theme.bg2;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.bg);
  }, [theme]);

  const toast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 2200); };

  // data ops
  const upsertExercise = (ex) => setData((d) => {
    const exists = d.exercises.some((e) => e.id === ex.id);
    return { ...d, exercises: exists ? d.exercises.map((e) => e.id === ex.id ? ex : e) : [...d.exercises, ex] };
  });
  const deleteExercise = (id) => setData((d) => ({ ...d,
    exercises: d.exercises.filter((e) => e.id !== id),
    sessions: d.sessions.map((s) => ({ ...s, blocks: s.blocks.filter((b) => b.exerciseId !== id) })) }));
  const updateSession = (s) => setData((d) => ({ ...d, sessions: d.sessions.map((x) => x.id === s.id ? s : x) }));
  const deleteSession = (id) => setData((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) }));
  const newSession = () => {
    const s = { id: uid(), name: 'Nouvelle séance', note: '', accent: 'force', blocks: [] };
    setData((d) => ({ ...d, sessions: [...d.sessions, s] }));
    setEditSessionId(s.id);
  };
  const addHistory = (h) => setData((d) => ({ ...d, history: [h, ...d.history] }));
  const resetAll = () => { setData(seedData()); setTab('home'); toast('Données effacées'); };

  // Import : crée les exercices manquants (dédoublonnage par nom) + la séance.
  const importWorkout = ({ name, note, items }) => {
    if (!items || !items.length) return;
    const sid = uid();
    setData((d) => {
      const exercises = [...d.exercises];
      const findByName = (nm) => exercises.find((e) => e.name.toLowerCase() === nm.trim().toLowerCase());
      const blocks = items.map((it) => {
        let ex = findByName(it.name);
        if (!ex) { ex = { id: uid(), name: it.name.trim(), category: it.category || 'force', muscles: '', instructions: '' }; exercises.push(ex); }
        return { exerciseId: ex.id, sets: Number(it.sets) || 1, reps: String(it.reps || ''), load: it.load || '', rest: Number(it.rest) || 90 };
      });
      const session = { id: sid, name: name || 'Séance importée', note: note || '', accent: items[0]?.category || 'force', blocks };
      return { ...d, exercises, sessions: [...d.sessions, session] };
    });
    setImportOpen(false);
    setEditSessionId(sid);
    toast('Séance importée ✅');
  };

  const actions = {
    goTab: setTab,
    startGuided: (id) => setGuidedId(id),
    openSession: (id) => setEditSessionId(id),
    openTimer: (mode) => setTimerMode(mode),
    openSettings: () => setSettingsOpen(true),
    openImport: () => setImportOpen(true),
  };

  const guidedSession = guidedId && data.sessions.find((s) => s.id === guidedId);
  const editSession = editSessionId && data.sessions.find((s) => s.id === editSessionId);

  let screen;
  if (tab === 'home') screen = <HomeScreen data={data} actions={actions} prefs={prefs} />;
  else if (tab === 'sessions') screen = <SessionsScreen data={data} actions={actions} onNew={newSession} onImport={actions.openImport} />;
  else if (tab === 'exercises') screen = <ExercisesScreen data={data} onOpenExercise={setExDetail} onNew={() => setExEdit(null)} />;
  else if (tab === 'timer') screen = <TimerScreen onOpenTimer={actions.openTimer} />;
  else screen = <ActivityScreen data={data} />;

  return (
    <ThemeCtx.Provider value={theme}>
      <div className="app-shell" style={{ position: 'relative', width: '100%', maxWidth: 460, margin: '0 auto',
        background: theme.bg, color: theme.ink, overflow: 'hidden',
        boxShadow: theme.dark ? 'none' : '0 0 0 1px rgba(12,16,25,0.06)' }}>
        <div key={tab} style={{ position: 'absolute', inset: 0, overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(96px + env(safe-area-inset-bottom))', animation: 'athScreen .25s ease' }}>
          {screen}
        </div>
        <TabBar tab={tab} onTab={setTab} />

        {guidedSession && (
          <GuidedSession session={guidedSession} exercises={data.exercises}
            onClose={() => setGuidedId(null)}
            onFinish={(h) => { addHistory(h); setGuidedId(null); setTab('activity'); toast('Séance enregistrée 💪'); }} />
        )}
        {timerMode && <IntervalTimer initialMode={timerMode} onClose={() => setTimerMode(null)} />}
        {editSession && (
          <SessionEditor session={editSession} exercises={data.exercises}
            onChange={updateSession} onDelete={(id) => { deleteSession(id); setEditSessionId(null); }}
            onStart={(id) => { setEditSessionId(null); setGuidedId(id); }}
            onClose={() => setEditSessionId(null)} />
        )}
        {exDetail && (
          <ExerciseDetail exercise={exDetail} onClose={() => setExDetail(null)}
            onEdit={() => { const e = exDetail; setExDetail(null); setExEdit(e); }} />
        )}
        {exEdit !== undefined && (
          <ExerciseEditor exercise={exEdit} onSave={upsertExercise} onDelete={deleteExercise} onClose={() => setExEdit(undefined)} />
        )}
        {settingsOpen && (
          <SettingsScreen dark={dark} setDark={setDark} accent={accent} setAccent={setAccent}
            prefs={prefs} setPrefs={setPrefs} onReset={resetAll} onClose={() => setSettingsOpen(false)} />
        )}
        {importOpen && (
          <ImportScreen existing={data.exercises} onImport={importWorkout} onClose={() => setImportOpen(false)} />
        )}

        {toastMsg && (
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 104, zIndex: 130,
            background: theme.ink, color: theme.bg, borderRadius: 99, padding: '12px 20px', fontSize: 14.5, fontWeight: 650,
            boxShadow: '0 12px 28px rgba(0,0,0,0.3)', animation: 'athUp .25s ease' }}>{toastMsg}</div>
        )}
      </div>
    </ThemeCtx.Provider>
  );
}
