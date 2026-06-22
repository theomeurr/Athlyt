// athlyt-onboarding.jsx — first-launch flow (welcome → disciplines → goal → level → reminders → ready)

function OnbProgress({ step, total }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 4, borderRadius: 99, flex: i === step ? '0 0 22px' : '0 0 7px',
          width: i === step ? 22 : 7,
          background: i <= step ? t.accent : t.line,
          transition: 'all .35s cubic-bezier(.2,.8,.2,1)',
        }} />
      ))}
    </div>
  );
}

function OnbShell({ step, total, onBack, children, footer }) {
  const t = useTheme();
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: t.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '64px 22px 14px' }}>
        <button onClick={onBack} style={{
          width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: t.surface, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: t.shadowSm, opacity: step === 0 ? 0 : 1, pointerEvents: step === 0 ? 'none' : 'auto',
        }}>
          <Icon name="chevron-l" size={20} sw={2.2} />
        </button>
        <OnbProgress step={step} total={total} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 12px' }}>{children}</div>
      <div style={{ padding: '10px 22px calc(26px + env(safe-area-inset-bottom))', background: t.bg }}>{footer}</div>
    </div>
  );
}

function BigBtn({ label, onClick, disabled, sub }) {
  const t = useTheme();
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', border: 'none', cursor: disabled ? 'default' : 'pointer',
      borderRadius: 18, padding: sub ? '14px 20px' : '17px 20px',
      background: disabled ? t.fill : t.accent, color: disabled ? t.faint : t.accentInk,
      fontSize: 17, fontWeight: 650, letterSpacing: -0.2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: disabled ? 'none' : '0 8px 22px rgba(31,107,255,0.30)',
      transition: 'background .2s, box-shadow .2s, transform .1s',
    }}>
      <span>{label}</span>
      <Icon name="arrow" size={19} sw={2.1} stroke={disabled ? t.faint : t.accentInk} />
    </button>
  );
}

function SelectCard({ active, color, title, sub, onClick, check = true }) {
  const t = useTheme();
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer',
      border: `1.5px solid ${active ? (color || t.accent) : t.line}`,
      background: active ? (color ? color + '14' : t.accentSoft) : t.surface,
      borderRadius: 18, padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 14,
      transition: 'all .18s', boxShadow: active ? 'none' : t.shadowSm,
    }}>
      {color && <span style={{ width: 12, height: 12, borderRadius: 4, background: color, flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 640, color: t.ink, letterSpacing: -0.2 }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: t.sub, marginTop: 2 }}>{sub}</div>}
      </div>
      {check && (
        <span style={{
          width: 24, height: 24, borderRadius: 99, flexShrink: 0,
          border: `2px solid ${active ? (color || t.accent) : t.lineStrong}`,
          background: active ? (color || t.accent) : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {active && <Icon name="check" size={14} sw={3} stroke="#fff" />}
        </span>
      )}
    </button>
  );
}

function Onboarding({ onDone }) {
  const t = useTheme();
  const [step, setStep] = React.useState(0);
  const [disc, setDisc] = React.useState(['force', 'vitesse']);
  const [goal, setGoal] = React.useState('explosivite');
  const [level, setLevel] = React.useState('Intermédiaire');
  const [freq, setFreq] = React.useState(4);
  const [reminders, setReminders] = React.useState(true);
  const [days, setDays] = React.useState([1, 3, 5]);
  const TOTAL = 5;

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const back = () => setStep((s) => Math.max(0, s - 1));
  const next = () => setStep((s) => s + 1);

  const goals = [
    { id: 'performance', title: 'Performance', sub: 'Progresser sur mes charges & chronos' },
    { id: 'explosivite', title: 'Explosivité', sub: 'Gagner en vitesse et en puissance' },
    { id: 'endurance', title: 'Endurance', sub: 'Tenir l’effort plus longtemps' },
    { id: 'forme', title: 'Remise en forme', sub: 'Bouger régulièrement, me sentir bien' },
  ];
  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // Step 0 — welcome (no shell, full bleed hero)
  if (step === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: t.bg,
        padding: '0 26px calc(28px + env(safe-area-inset-bottom))' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Wordmark big />
          <h1 style={{ margin: '26px 0 0', fontSize: 40, lineHeight: 1.04, fontWeight: 760, letterSpacing: -1.4, color: t.ink }}>
            Prépare.<br />Exécute.<br /><span style={{ color: t.accent }}>Progresse.</span>
          </h1>
          <p style={{ margin: '20px 0 0', fontSize: 17, lineHeight: 1.45, color: t.sub, maxWidth: 300 }}>
            Ton coach de prépa physique. Construis tes séances, déroule-les en mode guidé, minute tes intervalles.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 26, flexWrap: 'wrap' }}>
            {['Force', 'Vitesse', 'Pliométrie', 'Endurance', 'Gainage', 'Mobilité'].map((x) => (
              <span key={x} style={{ fontSize: 13, fontWeight: 600, color: t.sub,
                background: t.surface, border: `1px solid ${t.line}`, borderRadius: 99, padding: '6px 12px' }}>{x}</span>
            ))}
          </div>
        </div>
        <BigBtn label="Commencer" onClick={next} />
        <p style={{ textAlign: 'center', fontSize: 13, color: t.faint, margin: '14px 0 0' }}>
          Déjà un compte ? <span style={{ color: t.accent, fontWeight: 600 }}>Se connecter</span>
        </p>
      </div>
    );
  }

  let body, footer, valid = true;

  if (step === 1) {
    body = (
      <>
        <StepTitle k="Tes disciplines" s="Choisis ce que tu travailles. On adaptera ta bibliothèque et tes séances." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {CATEGORIES.map((c) => (
            <SelectCard key={c.id} color={c.color} title={c.name} active={disc.includes(c.id)}
              onClick={() => toggle(disc, setDisc, c.id)} />
          ))}
        </div>
      </>
    );
    valid = disc.length > 0;
    footer = <BigBtn label="Continuer" onClick={next} disabled={!valid} />;
  }

  if (step === 2) {
    body = (
      <>
        <StepTitle k="Ton objectif principal" s="Pour orienter l’intensité et le type de séances proposées." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
          {goals.map((g) => (
            <SelectCard key={g.id} title={g.title} sub={g.sub} active={goal === g.id}
              onClick={() => setGoal(g.id)} />
          ))}
        </div>
      </>
    );
    footer = <BigBtn label="Continuer" onClick={next} />;
  }

  if (step === 3) {
    body = (
      <>
        <StepTitle k="Ton niveau & rythme" s="On calibre le volume pour que ça reste tenable." />
        <div style={{ marginTop: 22 }}>
          <Label text="Niveau" />
          <Segmented options={['Débutant', 'Intermédiaire', 'Avancé']} value={level} onChange={setLevel} />
        </div>
        <div style={{ marginTop: 24 }}>
          <Label text="Séances par semaine" />
          <FreqStepper value={freq} onChange={setFreq} />
        </div>
      </>
    );
    footer = <BigBtn label="Continuer" onClick={next} />;
  }

  if (step === 4) {
    body = (
      <>
        <StepTitle k="Rappels d’entraînement" s="Un petit coup de pouce pour ne rien lâcher." />
        <div style={{ marginTop: 20, background: t.surface, borderRadius: 18, border: `1px solid ${t.line}`,
          padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: t.shadowSm }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: t.accentSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="bell" size={21} stroke={t.accent} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 640, color: t.ink }}>Activer les rappels</div>
            <div style={{ fontSize: 13, color: t.sub, marginTop: 1 }}>Notification les jours d’entraînement</div>
          </div>
          <Switch on={reminders} onClick={() => setReminders(!reminders)} />
        </div>
        {reminders && (
          <div style={{ marginTop: 22 }}>
            <Label text="Jours" />
            <div style={{ display: 'flex', gap: 8 }}>
              {dayLabels.map((d, i) => {
                const on = days.includes(i);
                return (
                  <button key={i} onClick={() => toggle(days, setDays, i)} style={{
                    flex: 1, aspectRatio: '1', borderRadius: 14, cursor: 'pointer',
                    border: `1.5px solid ${on ? t.accent : t.line}`,
                    background: on ? t.accent : t.surface, color: on ? '#fff' : t.sub,
                    fontSize: 15, fontWeight: 700, transition: 'all .15s',
                  }}>{d}</button>
                );
              })}
            </div>
            <div style={{ marginTop: 16 }}>
              <Label text="Heure" />
              <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
                padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: t.shadowSm }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: t.ink, fontWeight: 600, fontSize: 16 }}>
                  <Icon name="clock" size={19} stroke={t.sub} /> Rappel
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: t.accent }}>18:30</div>
              </div>
            </div>
          </div>
        )}
      </>
    );
    footer = <BigBtn label="Terminer" onClick={next} />;
  }

  if (step === 5) {
    const names = disc.map((d) => catById(d).name);
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: t.bg,
        padding: '0 26px calc(28px + env(safe-area-inset-bottom))' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Ring size={130} stroke={12} value={1} gradient={[t.energy1, t.energy2]} track={t.fill}>
            <Icon name="check" size={52} sw={2.6} stroke={t.accent} />
          </Ring>
          <h1 style={{ margin: '30px 0 0', fontSize: 30, fontWeight: 740, letterSpacing: -0.8, color: t.ink }}>
            Tout est prêt
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 16, lineHeight: 1.5, color: t.sub, maxWidth: 290 }}>
            On a préparé <b style={{ color: t.ink }}>3 séances</b> sur mesure pour ton objectif
            {goal === 'explosivite' ? ' d’explosivité' : ''}, {freq}× par semaine.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {names.map((n) => (
              <span key={n} style={{ fontSize: 13, fontWeight: 600, color: t.ink,
                background: t.surface, border: `1px solid ${t.line}`, borderRadius: 99, padding: '6px 12px' }}>{n}</span>
            ))}
          </div>
        </div>
        <BigBtn label="Entrer dans Athlyt" onClick={onDone} />
      </div>
    );
  }

  return <OnbShell step={step - 1} total={TOTAL - 1} onBack={back} footer={footer}>{body}</OnbShell>;
}

/* small onboarding primitives */
function StepTitle({ k, s }) {
  const t = useTheme();
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 740, letterSpacing: -0.7, color: t.ink, lineHeight: 1.1 }}>{k}</h1>
      {s && <p style={{ margin: '10px 0 0', fontSize: 15.5, lineHeight: 1.45, color: t.sub }}>{s}</p>}
    </div>
  );
}
function Label({ text }) {
  const t = useTheme();
  return <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', color: t.faint, marginBottom: 10 }}>{text}</div>;
}
function Segmented({ options, value, onChange }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', background: t.fill, borderRadius: 14, padding: 4, gap: 4 }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} style={{
          flex: 1, border: 'none', cursor: 'pointer', borderRadius: 10, padding: '10px 4px',
          background: value === o ? t.surface : 'transparent',
          color: value === o ? t.ink : t.sub, fontSize: 14.5, fontWeight: 640,
          boxShadow: value === o ? t.shadowSm : 'none', transition: 'all .18s',
        }}>{o}</button>
      ))}
    </div>
  );
}
function FreqStepper({ value, onChange }) {
  const t = useTheme();
  const btn = (label, fn, disabled) => (
    <button onClick={fn} disabled={disabled} style={{
      width: 52, height: 52, borderRadius: 16, cursor: disabled ? 'default' : 'pointer',
      border: `1px solid ${t.line}`, background: t.surface, color: disabled ? t.faint : t.ink,
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadowSm,
    }}>
      <Icon name={label} size={22} sw={2.4} stroke={disabled ? t.faint : t.ink} />
    </button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 18, padding: '14px 16px', boxShadow: t.shadowSm }}>
      {btn('minus', () => onChange(Math.max(1, value - 1)), value <= 1)}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 780, color: t.ink, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        <div style={{ fontSize: 12.5, color: t.sub, marginTop: 4, fontWeight: 600 }}>jours / semaine</div>
      </div>
      {btn('plus', () => onChange(Math.min(7, value + 1)), value >= 7)}
    </div>
  );
}
function Switch({ on, onClick }) {
  const t = useTheme();
  return (
    <button onClick={onClick} style={{
      width: 52, height: 31, borderRadius: 99, border: 'none', cursor: 'pointer', flexShrink: 0,
      background: on ? t.accent : t.lineStrong, position: 'relative', transition: 'background .2s', padding: 0,
    }}>
      <span style={{ position: 'absolute', top: 2.5, left: on ? 23.5 : 2.5, width: 26, height: 26,
        borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left .2s cubic-bezier(.2,.8,.2,1)' }} />
    </button>
  );
}
function Wordmark({ big }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <span style={{ width: big ? 44 : 32, height: big ? 44 : 32, borderRadius: big ? 13 : 10,
        background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 16px rgba(31,107,255,0.35)' }}>
        <Icon name="bolt" size={big ? 26 : 19} stroke="#fff" />
      </span>
      <span style={{ fontSize: big ? 27 : 21, fontWeight: 800, letterSpacing: -0.8, color: t.ink }}>Athlyt</span>
    </div>
  );
}

Object.assign(window, { Onboarding, Switch, Segmented, Label, Wordmark, BigBtn, SelectCard, StepTitle });
