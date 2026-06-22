// athlyt-ui-kit.jsx — primitives partagées (réutilisées par l'écran Paramètres).
// L'ancien flux d'onboarding/connexion a été retiré : l'app démarre directement.

function BigBtn({ label, onClick, disabled, sub, icon = 'arrow' }) {
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
      {icon && <Icon name={icon} size={19} sw={2.1} stroke={disabled ? t.faint : t.accentInk} />}
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

Object.assign(window, { Switch, Segmented, Label, FreqStepper, SelectCard, BigBtn, Wordmark });
