// athlyt-screens.jsx — main tabs: Accueil, Séances, Exercices, Minuteur, Activité + TabBar

/* ----------------------------------------------------------- Shared bits */
function ScreenHeader({ title, sub, trailing }) {
  const t = useTheme();
  return (
    <div style={{ padding: '58px 20px 6px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
      <div>
        {sub && <div style={{ fontSize: 14, fontWeight: 600, color: t.sub, marginBottom: 2 }}>{sub}</div>}
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.9, color: t.ink, lineHeight: 1.05 }}>{title}</h1>
      </div>
      {trailing}
    </div>
  );
}
function CircleBtn({ name, onClick, accent }) {
  const t = useTheme();
  return (
    <button onClick={onClick} style={{ width: 42, height: 42, borderRadius: 99, border: 'none', cursor: 'pointer',
      background: accent ? t.accent : t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: accent ? '0 6px 16px rgba(31,107,255,0.3)' : t.shadowSm, flexShrink: 0 }}>
      <Icon name={name} size={accent ? 22 : 21} sw={2.2} stroke={accent ? '#fff' : t.ink} />
    </button>
  );
}
function CatDots({ blocks, size = 7 }) {
  const cols = [...new Set(blocks.map((b) => catById(window.__exLookup(b.exerciseId)?.category).color))].slice(0, 5);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {cols.map((c, i) => <span key={i} style={{ width: size, height: size, borderRadius: 99, background: c }} />)}
    </div>
  );
}

function SessionCard({ session, onStart, onOpen, exercises }) {
  const t = useTheme();
  const sets = totalSets(session);
  const mins = estMinutes(session);
  const cat = catById(session.accent || window.__exLookup(session.blocks[0]?.exerciseId)?.category);
  return (
    <div onClick={onOpen} style={{ background: t.surface, borderRadius: 22, border: `1px solid ${t.line}`,
      padding: 16, marginBottom: 12, boxShadow: t.shadowSm, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: cat.color }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 740, color: t.ink, letterSpacing: -0.3 }}>{session.name}</div>
          {session.note && <div style={{ fontSize: 14, color: t.sub, marginTop: 2 }}>{session.note}</div>}
        </div>
        <CatDots blocks={session.blocks} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14 }}>
        <Meta icon="list" text={`${session.blocks.length} exos`} />
        <Meta icon="target" text={`${sets} séries`} />
        <Meta icon="clock" text={`~${mins} min`} />
      </div>
      <button onClick={(e) => { e.stopPropagation(); onStart(); }} style={{
        marginTop: 14, width: '100%', border: 'none', cursor: 'pointer', borderRadius: 14, padding: '12px',
        background: t.accent, color: '#fff', fontSize: 15.5, fontWeight: 680,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: '0 6px 16px rgba(31,107,255,0.26)' }}>
        <Icon name="play" size={18} stroke="#fff" /> Démarrer
      </button>
    </div>
  );
}
function Meta({ icon, text }) {
  const t = useTheme();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: t.sub, fontWeight: 600 }}>
      <Icon name={icon} size={16} stroke={t.faint} /> {text}
    </span>
  );
}

/* ----------------------------------------------------------- Accueil */
function HomeScreen({ data, actions, prefs }) {
  const t = useTheme();
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = data.history.filter((h) => new Date(h.date).getTime() >= weekAgo);
  const goalWk = (prefs && prefs.freq) || 4;
  // série réelle : nb de jours consécutifs (jusqu'à aujourd'hui) avec ≥1 séance
  const dayKeys = new Set(data.history.map((h) => new Date(h.date).toDateString()));
  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    if (dayKeys.has(d.toDateString())) streak++;
    else if (i > 0) break; // une absence aujourd'hui (i=0) n'interrompt pas la série
  }
  const suggested = data.sessions[0];

  return (
    <div style={{ paddingBottom: 16 }}>
      <ScreenHeader title={greet} sub="Prêt à te dépasser ?" trailing={
        <button onClick={() => actions.openSettings()} aria-label="Paramètres" style={{
          width: 42, height: 42, borderRadius: 99, background: t.fill, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="settings" size={21} stroke={t.ink} />
        </button>
      } />

      <div style={{ padding: '14px 20px 0' }}>
        {/* weekly progress hero */}
        <div style={{ background: t.surface, borderRadius: 24, border: `1px solid ${t.line}`, padding: 18,
          boxShadow: t.shadowSm, display: 'flex', alignItems: 'center', gap: 18 }}>
          <Ring size={96} stroke={11} value={thisWeek.length / goalWk} gradient={[t.energy1, t.energy2]} track={t.fill}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 820, color: t.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{thisWeek.length}</div>
              <div style={{ fontSize: 11, color: t.sub, fontWeight: 600 }}>/ {goalWk}</div>
            </div>
          </Ring>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.accent, letterSpacing: 0.2 }}>CETTE SEMAINE</div>
            <div style={{ fontSize: 19, fontWeight: 740, color: t.ink, marginTop: 3, letterSpacing: -0.3 }}>
              {thisWeek.length >= goalWk ? 'Objectif atteint 💪' : `${goalWk - thisWeek.length} séance${goalWk - thisWeek.length > 1 ? 's' : ''} restante${goalWk - thisWeek.length > 1 ? 's' : ''}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 13.5, color: t.sub, fontWeight: 600 }}>
              <Icon name="flame" size={16} stroke="#F59E0B" /> {streak > 0 ? `Série de ${streak} jour${streak > 1 ? 's' : ''}` : 'Commence ta série'}
            </div>
          </div>
        </div>

        {/* suggested session (ou invite si aucune séance) */}
        {suggested ? (
          <>
            <div style={{ margin: '22px 0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={sectionTitle(t)}>Séance du jour</h2>
              <button onClick={() => actions.goTab('sessions')} style={linkBtn(t)}>Tout voir</button>
            </div>
            <div style={{ borderRadius: 24, overflow: 'hidden', background: t.ink, position: 'relative', boxShadow: t.shadow }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 120% at 85% 0%, ${t.accent}55, transparent 60%)` }} />
              <div style={{ position: 'relative', padding: 20 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.14)',
                  color: '#fff', borderRadius: 99, padding: '5px 11px', fontSize: 12.5, fontWeight: 700 }}>
                  <Icon name="bolt" size={14} stroke="#fff" /> RECOMMANDÉ
                </span>
                <div style={{ fontSize: 25, fontWeight: 800, color: '#fff', marginTop: 14, letterSpacing: -0.5 }}>{suggested.name}</div>
                <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>{suggested.note}</div>
                <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
                  <DarkMeta value={suggested.blocks.length} label="exercices" />
                  <DarkMeta value={totalSets(suggested)} label="séries" />
                  <DarkMeta value={`~${estMinutes(suggested)}'`} label="durée" />
                </div>
                <button onClick={() => actions.startGuided(suggested.id)} style={{ marginTop: 18, width: '100%', border: 'none',
                  cursor: 'pointer', borderRadius: 14, padding: '14px', background: '#fff', color: t.ink, fontSize: 16, fontWeight: 720,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Icon name="play" size={19} stroke={t.ink} /> Démarrer la séance
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ ...sectionTitle(t), margin: '22px 0 10px' }}>Commencer</h2>
            <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 24, padding: '24px 20px', textAlign: 'center', boxShadow: t.shadowSm }}>
              <span style={{ width: 52, height: 52, borderRadius: 15, background: t.accentSoft, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon name="dumbbell" size={26} stroke={t.accent} />
              </span>
              <div style={{ fontSize: 17, fontWeight: 740, color: t.ink }}>Crée ta première séance</div>
              <div style={{ fontSize: 14, color: t.sub, marginTop: 4, lineHeight: 1.45 }}>Ajoute des exercices, puis lance-toi en mode guidé.</div>
              <button onClick={() => actions.goTab('sessions')} style={{ marginTop: 16, border: 'none', cursor: 'pointer', borderRadius: 14,
                padding: '12px 22px', background: t.accent, color: '#fff', fontSize: 15.5, fontWeight: 680, boxShadow: '0 6px 16px rgba(31,107,255,0.26)' }}>
                Nouvelle séance
              </button>
            </div>
          </>
        )}

        {/* quick actions */}
        <h2 style={{ ...sectionTitle(t), margin: '24px 0 10px' }}>Accès rapide</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <QuickAction icon="timer" color="#F59E0B" title="Minuteur" sub="Tabata, EMOM…" onClick={() => actions.goTab('timer')} />
          <QuickAction icon="dumbbell" color={t.accent} title="Exercices" sub="Bibliothèque" onClick={() => actions.goTab('exercises')} />
        </div>

        {/* recent */}
        {data.history.length > 0 && (
          <>
            <div style={{ margin: '24px 0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={sectionTitle(t)}>Activité récente</h2>
              <button onClick={() => actions.goTab('activity')} style={linkBtn(t)}>Tout voir</button>
            </div>
            {data.history.slice(0, 2).map((h) => <HistoryRow key={h.id} h={h} />)}
          </>
        )}
      </div>
    </div>
  );
}
function DarkMeta({ value, label }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: -0.4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{label}</div>
    </div>
  );
}
function QuickAction({ icon, color, title, sub, onClick }) {
  const t = useTheme();
  return (
    <button onClick={onClick} style={{ flex: 1, textAlign: 'left', cursor: 'pointer', border: `1px solid ${t.line}`,
      background: t.surface, borderRadius: 20, padding: 16, boxShadow: t.shadowSm }}>
      <span style={{ width: 40, height: 40, borderRadius: 12, background: color + '18', display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} stroke={color} />
      </span>
      <div style={{ fontSize: 16, fontWeight: 720, color: t.ink, marginTop: 12, letterSpacing: -0.2 }}>{title}</div>
      <div style={{ fontSize: 13, color: t.sub, marginTop: 1 }}>{sub}</div>
    </button>
  );
}

/* ----------------------------------------------------------- Séances */
function SessionsScreen({ data, actions, onNew, onImport }) {
  const t = useTheme();
  return (
    <div style={{ paddingBottom: 16 }}>
      <ScreenHeader title="Séances" sub="Tes entraînements" trailing={
        <div style={{ display: 'flex', gap: 10 }}>
          <CircleBtn name="scan" onClick={onImport} />
          <CircleBtn name="plus" accent onClick={onNew} />
        </div>
      } />
      <div style={{ padding: '16px 20px 0' }}>
        {data.sessions.length === 0 ? (
          <>
            <Empty icon="list" title="Aucune séance" text="Crée ta première séance, ou importe-la depuis un texte / un modèle." action="Nouvelle séance" onAction={onNew} />
            <button onClick={onImport} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '0 auto',
              border: `1px solid ${t.line}`, background: t.surface, color: t.ink, cursor: 'pointer', borderRadius: 14,
              padding: '12px 20px', fontSize: 15, fontWeight: 680, boxShadow: t.shadowSm }}>
              <Icon name="scan" size={18} stroke={t.accent} /> Importer une séance
            </button>
          </>
        ) : (
          data.sessions.map((s) => (
            <SessionCard key={s.id} session={s} exercises={data.exercises}
              onStart={() => actions.startGuided(s.id)} onOpen={() => actions.openSession(s.id)} />
          ))
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Exercices */
function ExercisesScreen({ data, onOpenExercise, onNew }) {
  const t = useTheme();
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const items = data.exercises
    .filter((e) => filter === 'all' || e.category === filter)
    .filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase()) || (e.muscles || '').toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{ paddingBottom: 16 }}>
      <ScreenHeader title="Exercices" sub={`${data.exercises.length} mouvements`} trailing={<CircleBtn name="plus" accent onClick={onNew} />} />
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.fill, borderRadius: 14, padding: '11px 14px' }}>
          <Icon name="search" size={19} stroke={t.faint} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un exercice…" style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: t.ink, fontFamily: 'inherit' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 20px 4px', scrollbarWidth: 'none' }}>
        {[{ id: 'all', name: 'Tous', color: t.accent }, ...CATEGORIES].map((c) => {
          const on = filter === c.id;
          return (
            <button key={c.id} onClick={() => setFilter(c.id)} style={{ flexShrink: 0, cursor: 'pointer',
              border: `1.5px solid ${on ? c.color : t.line}`, background: on ? c.color : t.surface,
              color: on ? '#fff' : t.sub, borderRadius: 99, padding: '8px 15px', fontSize: 14, fontWeight: 680, transition: 'all .15s' }}>
              {c.name}
            </button>
          );
        })}
      </div>
      <div style={{ padding: '10px 20px 0' }}>
        {items.length === 0 ? (
          data.exercises.length === 0
            ? <Empty icon="dumbbell" title="Aucun exercice" text="Ajoute ton premier mouvement à ta bibliothèque." action="Nouvel exercice" onAction={onNew} />
            : <Empty icon="search" title="Aucun résultat" text="Modifie ta recherche ou essaie une autre catégorie." />
        ) : (
          items.map((ex) => {
            const c = catById(ex.category);
            return (
              <button key={ex.id} onClick={() => onOpenExercise(ex)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer',
                background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, padding: '14px 16px', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 14, boxShadow: t.shadowSm }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: c.color + '18', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="dumbbell" size={22} stroke={c.color} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.ink, letterSpacing: -0.2 }}>{ex.name}</div>
                  {ex.muscles && <div style={{ fontSize: 13.5, color: t.sub, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.muscles}</div>}
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: c.color, background: c.color + '14', borderRadius: 99, padding: '4px 9px', flexShrink: 0 }}>{c.name}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Minuteur */
function TimerScreen({ onOpenTimer }) {
  const t = useTheme();
  const cards = [
    { mode: 'tabata', color: '#FF5A5F', title: 'Tabata', desc: '20 s effort / 10 s repos × 8' },
    { mode: 'fractionne', color: t.accent, title: 'Fractionné', desc: 'Effort / repos personnalisables' },
    { mode: 'emom', color: '#10B981', title: 'EMOM', desc: 'Un bloc à lancer chaque minute' },
    { mode: 'amrap', color: '#8B5CF6', title: 'AMRAP', desc: 'Max de tours sur un temps donné' },
  ];
  return (
    <div style={{ paddingBottom: 16 }}>
      <ScreenHeader title="Minuteur" sub="Intervalles & conditionnement" />
      <div style={{ padding: '16px 20px 0' }}>
        {cards.map((c) => (
          <button key={c.mode} onClick={() => onOpenTimer(c.mode)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer',
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 20, padding: 18, marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 16, boxShadow: t.shadowSm }}>
            <span style={{ width: 52, height: 52, borderRadius: 15, background: c.color + '18', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="timer" size={26} stroke={c.color} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 740, color: t.ink, letterSpacing: -0.3 }}>{c.title}</div>
              <div style={{ fontSize: 13.5, color: t.sub, marginTop: 2 }}>{c.desc}</div>
            </div>
            <span style={{ width: 38, height: 38, borderRadius: 99, background: c.color, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="play" size={18} stroke="#fff" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Activité */
function ActivityScreen({ data, t: tt }) {
  const t = useTheme();
  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = data.history.filter((h) => new Date(h.date).getTime() >= weekAgo).length;
  const totalMin = Math.round(data.history.reduce((n, h) => n + h.durationSec, 0) / 60);
  const recent = data.history.slice(0, 8).slice().reverse();
  const max = Math.max(1, ...recent.map((h) => h.doneSets));

  return (
    <div style={{ paddingBottom: 16 }}>
      <ScreenHeader title="Activité" sub="Ta progression" />
      <div style={{ padding: '16px 20px 0' }}>
        {data.history.length === 0 ? (
          <Empty icon="chart" title="Pas encore de séance" text="Démarre une séance et termine-la pour la retrouver ici." />
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <BigStat value={data.history.length} label="séances" />
              <BigStat value={thisWeek} label="cette semaine" accent />
              <BigStat value={totalMin >= 60 ? `${Math.round(totalMin / 60)}h` : `${totalMin}'`} label="temps total" />
            </div>

            {recent.length > 1 && (
              <div style={{ background: t.surface, borderRadius: 22, border: `1px solid ${t.line}`, padding: 18, marginBottom: 18, boxShadow: t.shadowSm }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.sub, marginBottom: 16 }}>Séries par séance</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 110 }}>
                  {recent.map((h, i) => (
                    <div key={h.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: '100%', maxWidth: 26, height: `${(h.doneSets / max) * 86}px`, borderRadius: 7,
                        background: `linear-gradient(180deg, ${t.energy1}, ${t.energy2})`, minHeight: 6 }} />
                      <span style={{ fontSize: 10.5, color: t.faint, fontWeight: 600 }}>{new Date(h.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 style={{ ...sectionTitle(t), margin: '4px 0 10px' }}>Historique</h2>
            {data.history.map((h) => <HistoryRow key={h.id} h={h} />)}
          </>
        )}
      </div>
    </div>
  );
}
function BigStat({ value, label, accent }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, background: accent ? t.accent : t.surface, border: `1px solid ${accent ? t.accent : t.line}`,
      borderRadius: 18, padding: '14px 12px', boxShadow: t.shadowSm }}>
      <div style={{ fontSize: 25, fontWeight: 820, color: accent ? '#fff' : t.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.6 }}>{value}</div>
      <div style={{ fontSize: 12, color: accent ? 'rgba(255,255,255,0.8)' : t.sub, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}
function HistoryRow({ h }) {
  const t = useTheme();
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, padding: '14px 16px',
      marginBottom: 10, boxShadow: t.shadowSm }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 720, color: t.ink, letterSpacing: -0.2 }}>{h.name}</div>
          <div style={{ fontSize: 13, color: t.sub, marginTop: 1, textTransform: 'capitalize' }}>{fmtDateShort(h.date)}</div>
        </div>
        {h.rpe && (
          <span style={{ fontSize: 12.5, fontWeight: 700, color: t.accent, background: t.accentSoft, borderRadius: 99, padding: '5px 10px' }}>RPE {h.rpe}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <Meta icon="target" text={`${h.doneSets}/${h.totalSets} séries`} />
        <Meta icon="clock" text={fmtClock(h.durationSec)} />
      </div>
    </div>
  );
}

function Empty({ icon, title, text, action, onAction }) {
  const t = useTheme();
  return (
    <div style={{ textAlign: 'center', padding: '50px 24px' }}>
      <span style={{ width: 64, height: 64, borderRadius: 20, background: t.fill, display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon name={icon} size={30} stroke={t.faint} />
      </span>
      <div style={{ fontSize: 18, fontWeight: 740, color: t.ink }}>{title}</div>
      <div style={{ fontSize: 14.5, color: t.sub, marginTop: 6, lineHeight: 1.45 }}>{text}</div>
      {action && (
        <button onClick={onAction} style={{ marginTop: 18, border: 'none', cursor: 'pointer', borderRadius: 14, padding: '12px 22px',
          background: t.accent, color: '#fff', fontSize: 15.5, fontWeight: 680, boxShadow: '0 6px 16px rgba(31,107,255,0.26)' }}>{action}</button>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- Tab bar */
function TabBar({ tab, onTab }) {
  const t = useTheme();
  const tabs = [
    { id: 'home', icon: 'home', label: 'Accueil' },
    { id: 'sessions', icon: 'dumbbell', label: 'Séances' },
    { id: 'exercises', icon: 'list', label: 'Exos' },
    { id: 'timer', icon: 'timer', label: 'Minuteur' },
    { id: 'activity', icon: 'chart', label: 'Activité' },
  ];
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 40,
      paddingBottom: 'calc(20px + env(safe-area-inset-bottom))', paddingTop: 8,
      background: t.barBg, backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `0.5px solid ${t.line}`, display: 'flex' }}>
      {tabs.map((tb) => {
        const on = tab === tb.id;
        return (
          <button key={tb.id} onClick={() => onTab(tb.id)} style={{ flex: 1, border: 'none', background: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '2px 0' }}>
            <Icon name={on ? tb.icon + '-fill' : tb.icon} size={25} stroke={on ? t.accent : t.faint} sw={2} />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: on ? t.accent : t.faint, letterSpacing: -0.1 }}>{tb.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const sectionTitle = (t) => ({ margin: 0, fontSize: 19, fontWeight: 780, color: t.ink, letterSpacing: -0.4 });
const linkBtn = (t) => ({ border: 'none', background: 'none', cursor: 'pointer', color: t.accent, fontSize: 14.5, fontWeight: 650 });

Object.assign(window, {
  HomeScreen, SessionsScreen, ExercisesScreen, TimerScreen, ActivityScreen, TabBar,
  ScreenHeader, CircleBtn, SessionCard, HistoryRow, Empty, Meta,
});
