// athlyt-overlays.jsx — full-screen guided session + interval timer

/* ===================================================================== */
/* Guided session                                                        */
/* ===================================================================== */
function GuidedSession({ session, exercises, onClose, onFinish }) {
  const t = useTheme();
  const exById = (id) => exercises.find((e) => e.id === id);
  const [idx, setIdx] = React.useState(0);
  const [done, setDone] = React.useState(() => session.blocks.map((b) => Array(Number(b.sets) || 1).fill(false)));
  const [rest, setRest] = React.useState(0);
  const [restMax, setRestMax] = React.useState(0);
  const [showFinish, setShowFinish] = React.useState(false);
  const [rpe, setRpe] = React.useState(7);
  const startedAt = React.useRef(Date.now());
  const restRef = React.useRef(null);

  const block = session.blocks[idx];
  const ex = exById(block.exerciseId);
  const cat = catById(ex?.category);
  const nSets = Number(block.sets) || 1;
  const total = session.blocks.reduce((n, b) => n + (Number(b.sets) || 1), 0);
  const doneCount = done.reduce((n, arr) => n + arr.filter(Boolean).length, 0);
  const isLast = idx === session.blocks.length - 1;

  const stopRest = () => { if (restRef.current) { clearInterval(restRef.current); restRef.current = null; } setRest(0); };
  React.useEffect(() => () => stopRest(), []);

  const startRest = (sec) => {
    stopRest();
    setRest(sec); setRestMax(sec);
    restRef.current = setInterval(() => {
      setRest((r) => {
        if (r <= 1) { sWork(); clearInterval(restRef.current); restRef.current = null; return 0; }
        if (r <= 4) sTick();
        return r - 1;
      });
    }, 1000);
  };

  const toggleSet = (i) => {
    setDone((prev) => {
      const next = prev.map((a) => a.slice());
      next[idx][i] = !next[idx][i];
      const lastSet = isLast && i === nSets - 1;
      if (next[idx][i] && Number(block.rest) > 0 && !lastSet) startRest(Number(block.rest));
      return next;
    });
  };

  const move = (d) => { stopRest(); setIdx((v) => Math.min(session.blocks.length - 1, Math.max(0, v + d))); };

  const finish = () => {
    stopRest();
    const durationSec = Math.round((Date.now() - startedAt.current) / 1000);
    onFinish({ id: uid(), name: session.name, date: new Date().toISOString(), durationSec, totalSets: total, doneSets: doneCount, rpe });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: t.bg, display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ padding: '60px 20px 8px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onClose} style={iconBtn(t)}><Icon name="close" size={20} sw={2.2} stroke={t.ink} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.sub }}>{session.name}</div>
          <div style={{ fontSize: 12, color: t.faint }}>Exercice {idx + 1} sur {session.blocks.length}</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>{doneCount}/{total}</div>
      </div>
      {/* progress */}
      <div style={{ padding: '6px 20px 0' }}>
        <div style={{ height: 6, borderRadius: 99, background: t.fill, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(doneCount / total) * 100}%`, borderRadius: 99,
            background: `linear-gradient(90deg, ${t.energy1}, ${t.energy2})`, transition: 'width .4s' }} />
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 20px', display: 'flex', flexDirection: 'column' }}>
        <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 7,
          background: cat.color + '18', color: cat.color, borderRadius: 99, padding: '6px 12px', fontSize: 13, fontWeight: 700 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: cat.color }} /> {cat.name}
        </span>
        <h1 style={{ margin: '14px 0 0', fontSize: 32, fontWeight: 780, letterSpacing: -0.8, color: t.ink, lineHeight: 1.08 }}>
          {ex ? ex.name : 'Exercice'}
        </h1>
        <div style={{ marginTop: 10, fontSize: 17, color: t.sub }}>
          Objectif <b style={{ color: t.ink }}>{block.sets} × {block.reps || '—'}</b>
          {block.load && block.load !== 'PdC' ? <span> · <b style={{ color: t.accent }}>{block.load}</b></span> : null}
        </div>
        {ex && ex.instructions && (
          <div style={{ marginTop: 14, background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
            padding: '13px 15px', fontSize: 14.5, lineHeight: 1.5, color: t.sub, boxShadow: t.shadowSm }}>
            {ex.instructions}
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: nSets }).map((_, i) => {
            const on = done[idx][i];
            return (
              <button key={i} onClick={() => toggleSet(i)} style={{
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left',
                border: `1.5px solid ${on ? t.good : t.line}`,
                background: on ? (t.dark ? 'rgba(16,185,129,0.12)' : '#ECFDF5') : t.surface,
                borderRadius: 16, padding: '15px 16px', transition: 'all .15s', boxShadow: t.shadowSm,
              }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  border: `2px solid ${on ? t.good : t.lineStrong}`, background: on ? t.good : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {on && <Icon name="check" size={17} sw={3} stroke="#fff" />}
                </span>
                <span style={{ flex: 1, fontSize: 16, fontWeight: 680, color: t.ink }}>Série {i + 1}</span>
                <span style={{ fontSize: 14, color: t.sub, fontWeight: 500 }}>
                  {[block.reps && `${block.reps} reps`, block.load && block.load !== 'PdC' ? block.load : null].filter(Boolean).join(' · ') || 'PdC'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* rest banner */}
      {rest > 0 && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 104, zIndex: 90,
          background: t.ink, color: t.bg, borderRadius: 99, padding: '11px 12px 11px 18px',
          display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 12px 28px rgba(0,0,0,0.28)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, opacity: 0.7 }}>REPOS</span>
          <span style={{ fontSize: 20, fontWeight: 800, fontVariantNumeric: 'tabular-nums', minWidth: 52, textAlign: 'center' }}>{fmtClock(rest)}</span>
          <button onClick={() => setRest((r) => r + 15)} style={{ border: 'none', background: 'rgba(255,255,255,0.16)', color: 'inherit',
            borderRadius: 99, padding: '7px 11px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+15s</button>
          <button onClick={stopRest} style={{ border: 'none', background: 'transparent', color: 'inherit', opacity: 0.7,
            padding: '7px 9px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Passer</button>
        </div>
      )}

      {/* nav */}
      <div style={{ display: 'flex', gap: 12, padding: '8px 20px calc(24px + env(safe-area-inset-bottom))' }}>
        <button onClick={() => move(-1)} disabled={idx === 0} style={{
          ...navBtn(t, false), opacity: idx === 0 ? 0.4 : 1, flex: '0 0 auto', width: 56, padding: 0 }}>
          <Icon name="chevron-l" size={22} sw={2.2} stroke={t.ink} />
        </button>
        {isLast ? (
          <button onClick={() => setShowFinish(true)} style={navBtn(t, true)}>
            <Icon name="check" size={20} sw={2.6} stroke="#fff" /> Terminer
          </button>
        ) : (
          <button onClick={() => move(1)} style={navBtn(t, true)}>
            Suivant <Icon name="chevron" size={20} sw={2.4} stroke="#fff" />
          </button>
        )}
      </div>

      {/* finish sheet */}
      {showFinish && (
        <Sheet onClose={() => setShowFinish(false)} title="Séance terminée">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <Ring size={104} stroke={11} value={doneCount / total} gradient={[t.energy1, t.energy2]} track={t.fill}>
              <Icon name="trophy" size={40} stroke={t.accent} />
            </Ring>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            <Stat big label="Séries" value={`${doneCount}/${total}`} />
            <Stat big label="Durée" value={fmtClock(Math.round((Date.now() - startedAt.current) / 1000))} />
          </div>
          <Label text="Intensité ressentie (RPE)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <button onClick={() => setRpe((v) => Math.max(1, v - 1))} style={stepBtn(t)}><Icon name="minus" size={20} sw={2.4} stroke={t.ink} /></button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: 34, fontWeight: 800, color: t.ink, fontVariantNumeric: 'tabular-nums' }}>{rpe}</span>
              <span style={{ fontSize: 16, color: t.faint, fontWeight: 600 }}> / 10</span>
            </div>
            <button onClick={() => setRpe((v) => Math.min(10, v + 1))} style={stepBtn(t)}><Icon name="plus" size={20} sw={2.4} stroke={t.ink} /></button>
          </div>
          <button onClick={finish} style={navBtn(t, true)}>Enregistrer la séance</button>
        </Sheet>
      )}
    </div>
  );
}

/* ===================================================================== */
/* Interval timer                                                        */
/* ===================================================================== */
const TIMER_PRESETS = {
  tabata: { mode: 'tabata', work: 20, rest: 10, rounds: 8, prep: 5 },
  fractionne: { mode: 'fractionne', work: 30, rest: 30, rounds: 10, prep: 5 },
  emom: { mode: 'emom', interval: 60, rounds: 10, prep: 5 },
  amrap: { mode: 'amrap', amrap: 600, prep: 5 },
};

function buildPhases(cfg) {
  const p = [];
  if (cfg.prep > 0) p.push({ type: 'prep', label: 'Prêt ?', dur: cfg.prep });
  if (cfg.mode === 'tabata' || cfg.mode === 'fractionne') {
    for (let r = 1; r <= cfg.rounds; r++) {
      p.push({ type: 'work', label: `Effort ${r}/${cfg.rounds}`, dur: cfg.work });
      if (cfg.rest > 0 && r < cfg.rounds) p.push({ type: 'rest', label: `Repos ${r}/${cfg.rounds}`, dur: cfg.rest });
    }
  } else if (cfg.mode === 'emom') {
    for (let r = 1; r <= cfg.rounds; r++) p.push({ type: 'work', label: `Minute ${r}/${cfg.rounds}`, dur: cfg.interval });
  } else if (cfg.mode === 'amrap') {
    p.push({ type: 'work', label: 'AMRAP', dur: cfg.amrap });
  }
  p.push({ type: 'done', label: 'Terminé', dur: 0 });
  return p;
}

function IntervalTimer({ initialMode, onClose }) {
  const t = useTheme();
  const [cfg, setCfg] = React.useState(() => ({ ...TIMER_PRESETS[initialMode || 'tabata'] }));
  const [phase, setPhase] = React.useState('config'); // config | run
  const [phases, setPhases] = React.useState([]);
  const [pi, setPi] = React.useState(0);
  const [rem, setRem] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const tickRef = React.useRef(null);

  const phaseColor = (type) => ({ work: t.accent, rest: t.energy1, prep: '#F59E0B', done: t.good }[type] || t.accent);

  React.useEffect(() => () => clearInterval(tickRef.current), []);

  const start = () => {
    const ph = buildPhases(cfg);
    setPhases(ph); setPi(0); setRem(ph[0].dur); setRunning(true); setPhase('run');
  };

  React.useEffect(() => {
    if (phase !== 'run' || !running) { clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => {
      setRem((r) => {
        if (r <= 1) return 0;
        if (r <= 4) sTick();
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [phase, running, pi]);

  React.useEffect(() => {
    if (phase === 'run' && rem === 0 && running) {
      const nextI = pi + 1;
      if (nextI >= phases.length - 1) { setPi(phases.length - 1); setRunning(false); sDone(); }
      else {
        const np = phases[nextI];
        if (np.type === 'work') sWork(); else if (np.type === 'rest') sRest();
        setPi(nextI); setRem(np.dur);
      }
    }
  }, [rem]);

  const totalEst = buildPhases(cfg).reduce((n, p) => n + p.dur, 0);

  if (phase === 'config') {
    const modes = [['tabata', 'Tabata'], ['fractionne', 'Fractionné'], ['emom', 'EMOM'], ['amrap', 'AMRAP']];
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: t.bg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '60px 20px 8px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onClose} style={iconBtn(t)}><Icon name="close" size={20} sw={2.2} stroke={t.ink} /></button>
          <div style={{ fontSize: 19, fontWeight: 740, color: t.ink, letterSpacing: -0.4 }}>Minuteur</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 20px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {modes.map(([id, name]) => (
              <button key={id} onClick={() => setCfg({ ...TIMER_PRESETS[id] })} style={{
                flex: '1 0 calc(50% - 4px)', border: `1.5px solid ${cfg.mode === id ? t.accent : t.line}`,
                background: cfg.mode === id ? t.accent : t.surface, color: cfg.mode === id ? '#fff' : t.ink,
                borderRadius: 14, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
              }}>{name}</button>
            ))}
          </div>
          {(cfg.mode === 'tabata' || cfg.mode === 'fractionne') && (
            <>
              <BigStepper label="Effort" unit="sec" value={cfg.work} step={5} min={5} max={600} onChange={(v) => setCfg({ ...cfg, work: v })} />
              <BigStepper label="Repos" unit="sec" value={cfg.rest} step={5} min={0} max={600} onChange={(v) => setCfg({ ...cfg, rest: v })} />
              <BigStepper label="Rounds" unit="tours" value={cfg.rounds} step={1} min={1} max={50} onChange={(v) => setCfg({ ...cfg, rounds: v })} />
            </>
          )}
          {cfg.mode === 'emom' && (
            <>
              <BigStepper label="Intervalle" unit="sec" value={cfg.interval} step={5} min={10} max={600} onChange={(v) => setCfg({ ...cfg, interval: v })} />
              <BigStepper label="Rounds" unit="minutes" value={cfg.rounds} step={1} min={1} max={60} onChange={(v) => setCfg({ ...cfg, rounds: v })} />
            </>
          )}
          {cfg.mode === 'amrap' && (
            <BigStepper label="Durée totale" unit="min" value={Math.round(cfg.amrap / 60)} step={1} min={1} max={90} onChange={(v) => setCfg({ ...cfg, amrap: v * 60 })} />
          )}
        </div>
        <div style={{ padding: '8px 20px calc(24px + env(safe-area-inset-bottom))' }}>
          <div style={{ textAlign: 'center', fontSize: 14, color: t.sub, marginBottom: 12 }}>Durée estimée · <b style={{ color: t.ink }}>{fmtClock(totalEst)}</b></div>
          <button onClick={start} style={navBtn(t, true)}><Icon name="play" size={20} stroke="#fff" /> Démarrer</button>
        </div>
      </div>
    );
  }

  // run
  const ph = phases[pi];
  const col = phaseColor(ph.type);
  const frac = ph.dur > 0 ? rem / ph.dur : ph.type === 'done' ? 1 : 0;
  const isDone = ph.type === 'done';
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, background: t.dark ? '#000' : t.ink, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '60px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'capitalize' }}>{cfg.mode}</span>
        <button onClick={onClose} style={{ ...iconBtn(t), background: 'rgba(255,255,255,0.12)' }}><Icon name="close" size={20} sw={2.2} stroke="#fff" /></button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', color: col }}>{ph.label}</div>
        <div style={{ position: 'relative', width: 280, height: 280 }}>
          <Ring size={280} stroke={14} value={frac} color={col} track="rgba(255,255,255,0.12)">
            <div style={{ fontSize: 84, fontWeight: 820, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: -3, lineHeight: 1 }}>
              {isDone ? <Icon name="check" size={88} sw={2.4} stroke={t.good} /> : fmtClock(rem)}
            </div>
          </Ring>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
          {!isDone && (ph.type === 'prep' ? 'Préparation' : cfg.mode === 'amrap' ? 'En cours' : phaseCount(phases, pi))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '8px 20px calc(28px + env(safe-area-inset-bottom))' }}>
        {isDone ? (
          <button onClick={onClose} style={{ ...navBtn(t, true), maxWidth: 240 }}>Terminer</button>
        ) : (
          <>
            <button onClick={() => { setRem(0); }} style={darkBtn()}><Icon name="skip" size={20} stroke="#fff" /></button>
            <button onClick={() => setRunning((r) => !r)} style={{ ...darkBtn(), width: 92, background: col }}>
              <Icon name={running ? 'pause' : 'play'} size={22} stroke="#fff" />
            </button>
            <button onClick={onClose} style={darkBtn()}><Icon name="close" size={20} sw={2.2} stroke="#fff" /></button>
          </>
        )}
      </div>
    </div>
  );
}

function phaseCount(phases, pi) {
  const real = phases.filter((p) => p.type === 'work' || p.type === 'rest');
  const upto = phases.slice(0, pi + 1).filter((p) => p.type === 'work' || p.type === 'rest').length;
  return real.length ? `Phase ${upto} / ${real.length}` : '';
}

function BigStepper({ label, unit, value, step, min, max, onChange }) {
  const t = useTheme();
  return (
    <div style={{ marginBottom: 14 }}>
      <Label text={label} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: t.surface, border: `1px solid ${t.line}`, borderRadius: 18, padding: '12px 14px', boxShadow: t.shadowSm }}>
        <button onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} style={{ ...stepBtn(t), opacity: value <= min ? 0.4 : 1 }}>
          <Icon name="minus" size={20} sw={2.4} stroke={t.ink} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 30, fontWeight: 800, color: t.ink, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
          <span style={{ fontSize: 13, color: t.sub, fontWeight: 600 }}> {unit}</span>
        </div>
        <button onClick={() => onChange(Math.min(max, value + step))} disabled={value >= max} style={{ ...stepBtn(t), opacity: value >= max ? 0.4 : 1 }}>
          <Icon name="plus" size={20} sw={2.4} stroke={t.ink} />
        </button>
      </div>
    </div>
  );
}

/* ===================================================================== */
/* Shared bits                                                           */
/* ===================================================================== */
function Sheet({ title, children, onClose }) {
  const t = useTheme();
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', animation: 'athFade .2s ease' }}>
      <div style={{ width: '100%', background: t.surface, borderRadius: '26px 26px 0 0',
        padding: '10px 22px calc(26px + env(safe-area-inset-bottom))', animation: 'athUp .28s cubic-bezier(.2,.85,.25,1)',
        maxHeight: '88%', overflowY: 'auto' }}>
        <div style={{ width: 38, height: 5, borderRadius: 99, background: t.lineStrong, margin: '0 auto 16px' }} />
        {title && <h3 style={{ margin: '0 0 16px', fontSize: 21, fontWeight: 760, color: t.ink, letterSpacing: -0.4 }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
function Stat({ label, value, big }) {
  const t = useTheme();
  return (
    <div style={{ flex: 1, background: t.fill, borderRadius: 14, padding: big ? '14px 16px' : '11px 13px' }}>
      <div style={{ fontSize: big ? 26 : 20, fontWeight: 800, color: t.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: t.sub, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

const iconBtn = (t) => ({ width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
  background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadowSm, flexShrink: 0 });
const stepBtn = (t) => ({ width: 50, height: 50, borderRadius: 14, border: `1px solid ${t.line}`, cursor: 'pointer',
  background: t.dark ? t.fill : t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });
const navBtn = (t, primary) => ({ flex: 1, border: 'none', cursor: 'pointer', borderRadius: 16, padding: '16px',
  background: primary ? t.accent : t.surface, color: primary ? '#fff' : t.ink, fontSize: 16.5, fontWeight: 680,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  boxShadow: primary ? '0 8px 20px rgba(31,107,255,0.28)' : t.shadowSm });
const darkBtn = () => ({ width: 64, height: 64, borderRadius: 99, border: 'none', cursor: 'pointer',
  background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });

Object.assign(window, { GuidedSession, IntervalTimer, Sheet, Stat, iconBtn, stepBtn, navBtn, darkBtn });
