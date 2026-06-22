// athlyt-settings.jsx — écran Paramètres.
// Regroupe les réglages que proposait l'ancien écran de démarrage (disciplines,
// objectif, niveau, fréquence, rappels) + l'apparence (thème, accent) + données.

const ACCENT_OPTIONS = ['#1F6BFF', '#06B6D4', '#FF5A3C', '#7C5CFF', '#10B981'];
const GOAL_OPTIONS = [
  { id: 'performance', title: 'Performance', sub: 'Progresser sur mes charges & chronos' },
  { id: 'explosivite', title: 'Explosivité', sub: 'Gagner en vitesse et en puissance' },
  { id: 'endurance', title: 'Endurance', sub: 'Tenir l’effort plus longtemps' },
  { id: 'forme', title: 'Remise en forme', sub: 'Bouger régulièrement, me sentir bien' },
];
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function SettingsSection({ title, children }) {
  const t = useTheme();
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: t.faint, margin: '0 4px 12px' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
    </div>
  );
}

function RowCard({ icon, iconColor, title, sub, children }) {
  const t = useTheme();
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 14, boxShadow: t.shadowSm }}>
      {icon && (
        <span style={{ width: 38, height: 38, borderRadius: 11, background: (iconColor || t.accent) + '18', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={20} stroke={iconColor || t.accent} />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 640, color: t.ink }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: t.sub, marginTop: 1 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function SettingsScreen({ dark, setDark, accent, setAccent, prefs, setPrefs, onReset, onClose }) {
  const t = useTheme();
  const [confirm, setConfirm] = React.useState(false);
  const setP = (k, v) => setPrefs((p) => ({ ...p, [k]: v }));
  const toggleIn = (key, v) => setPrefs((p) => {
    const arr = p[key] || [];
    return { ...p, [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] };
  });

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 110, background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '58px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onClose} style={iconBtn(t)}><Icon name="chevron-l" size={20} sw={2.2} stroke={t.ink} /></button>
        <div style={{ flex: 1, fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: t.ink }}>Paramètres</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 20px calc(28px + env(safe-area-inset-bottom))' }}>

        {/* Apparence */}
        <SettingsSection title="Apparence">
          <RowCard icon="bolt" title="Mode sombre" sub="Suivre le système ou forcer">
            <Switch on={dark} onClick={() => setDark(!dark)} />
          </RowCard>
          <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, padding: '14px 16px', boxShadow: t.shadowSm }}>
            <Label text="Couleur d’accent" />
            <div style={{ display: 'flex', gap: 12 }}>
              {ACCENT_OPTIONS.map((c) => {
                const on = c.toLowerCase() === accent.toLowerCase();
                return (
                  <button key={c} onClick={() => setAccent(c)} aria-label={c} style={{
                    width: 40, height: 40, borderRadius: 99, background: c, cursor: 'pointer',
                    border: on ? `3px solid ${t.surface}` : 'none',
                    boxShadow: on ? `0 0 0 2px ${c}` : t.shadowSm,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {on && <Icon name="check" size={18} sw={3} stroke="#fff" />}
                  </button>
                );
              })}
            </div>
          </div>
        </SettingsSection>

        {/* Entraînement */}
        <SettingsSection title="Entraînement">
          <Label text="Mes disciplines" />
          {CATEGORIES.map((c) => (
            <SelectCard key={c.id} color={c.color} title={c.name} active={(prefs.disciplines || []).includes(c.id)}
              onClick={() => toggleIn('disciplines', c.id)} />
          ))}
          <div style={{ height: 4 }} />
          <Label text="Objectif principal" />
          {GOAL_OPTIONS.map((g) => (
            <SelectCard key={g.id} title={g.title} sub={g.sub} active={prefs.goal === g.id}
              onClick={() => setP('goal', g.id)} />
          ))}
          <div style={{ height: 8 }} />
          <Label text="Niveau" />
          <Segmented options={['Débutant', 'Intermédiaire', 'Avancé']} value={prefs.level} onChange={(v) => setP('level', v)} />
          <div style={{ height: 8 }} />
          <Label text="Séances par semaine" />
          <FreqStepper value={prefs.freq} onChange={(v) => setP('freq', v)} />
        </SettingsSection>

        {/* Rappels */}
        <SettingsSection title="Rappels">
          <RowCard icon="bell" title="Activer les rappels" sub="Les jours d’entraînement">
            <Switch on={prefs.reminders} onClick={() => setP('reminders', !prefs.reminders)} />
          </RowCard>
          {prefs.reminders && (
            <>
              <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, padding: '14px 16px', boxShadow: t.shadowSm }}>
                <Label text="Jours" />
                <div style={{ display: 'flex', gap: 8 }}>
                  {DAY_LABELS.map((d, i) => {
                    const on = (prefs.days || []).includes(i);
                    return (
                      <button key={i} onClick={() => toggleIn('days', i)} style={{
                        flex: 1, aspectRatio: '1', borderRadius: 13, cursor: 'pointer',
                        border: `1.5px solid ${on ? t.accent : t.line}`,
                        background: on ? t.accent : t.bg, color: on ? '#fff' : t.sub,
                        fontSize: 15, fontWeight: 700, transition: 'all .15s' }}>{d}</button>
                    );
                  })}
                </div>
              </div>
              <RowCard icon="clock" iconColor={t.sub} title="Heure du rappel">
                <input type="time" value={prefs.time} onChange={(e) => setP('time', e.target.value)} style={{
                  border: `1px solid ${t.line}`, background: t.bg, color: t.ink, borderRadius: 10,
                  padding: '8px 10px', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', outline: 'none' }} />
              </RowCard>
            </>
          )}
        </SettingsSection>

        {/* Données */}
        <SettingsSection title="Données">
          <button onClick={() => setConfirm(true)} style={{ width: '100%', textAlign: 'left', cursor: 'pointer',
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 14, boxShadow: t.shadowSm }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,90,95,0.14)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" size={18} sw={2.4} stroke="#FF5A5F" />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 640, color: '#FF5A5F' }}>Réinitialiser les données</div>
              <div style={{ fontSize: 13, color: t.sub, marginTop: 1 }}>Restaure les données d’exemple</div>
            </div>
          </button>
        </SettingsSection>

        <div style={{ textAlign: 'center', color: t.faint, fontSize: 12.5, marginTop: 4 }}>Athlyt · v1</div>
      </div>

      {confirm && (
        <Sheet title="Réinitialiser ?" onClose={() => setConfirm(false)}>
          <p style={{ margin: '0 0 18px', fontSize: 15, lineHeight: 1.5, color: t.sub }}>
            Tes séances, exercices et historique seront remplacés par les données d’exemple. Action irréversible.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setConfirm(false)} style={{ flex: 1, border: `1px solid ${t.line}`, cursor: 'pointer',
              background: t.surface, color: t.ink, borderRadius: 14, padding: '15px', fontSize: 16, fontWeight: 680 }}>Annuler</button>
            <button onClick={() => { onReset(); setConfirm(false); onClose(); }} style={{ flex: 1, border: 'none', cursor: 'pointer',
              background: '#FF5A5F', color: '#fff', borderRadius: 14, padding: '15px', fontSize: 16, fontWeight: 700 }}>Réinitialiser</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

Object.assign(window, { SettingsScreen });
