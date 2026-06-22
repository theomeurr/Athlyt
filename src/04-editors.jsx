// athlyt-editors.jsx — exercise editor, session editor, exercise picker

function Field({ label, children }) {
  const t = useTheme();
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', color: t.faint, marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}
function inputStyle(t) {
  return { width: '100%', boxSizing: 'border-box', border: `1px solid ${t.line}`, background: t.dark ? t.fill : t.bg,
    borderRadius: 12, padding: '12px 14px', fontSize: 16, color: t.ink, fontFamily: 'inherit', outline: 'none' };
}

/* --------------------------------------------------- Exercise editor */
function ExerciseEditor({ exercise, onSave, onDelete, onClose }) {
  const t = useTheme();
  const editing = !!exercise;
  const [name, setName] = React.useState(exercise?.name || '');
  const [cat, setCat] = React.useState(exercise?.category || 'force');
  const [muscles, setMuscles] = React.useState(exercise?.muscles || '');
  const [instr, setInstr] = React.useState(exercise?.instructions || '');

  const save = () => {
    if (!name.trim()) return;
    onSave({ id: exercise?.id || uid(), name: name.trim(), category: cat, muscles: muscles.trim(), instructions: instr.trim() });
    onClose();
  };

  return (
    <Sheet title={editing ? 'Modifier l’exercice' : 'Nouvel exercice'} onClose={onClose}>
      <Field label="Nom">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Squat bulgare" style={inputStyle(t)} autoFocus />
      </Field>
      <Field label="Catégorie">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map((c) => {
            const on = cat === c.id;
            return (
              <button key={c.id} onClick={() => setCat(c.id)} style={{ cursor: 'pointer', border: `1.5px solid ${on ? c.color : t.line}`,
                background: on ? c.color : t.surface, color: on ? '#fff' : t.sub, borderRadius: 99, padding: '8px 14px',
                fontSize: 13.5, fontWeight: 680, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: on ? '#fff' : c.color }} /> {c.name}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Muscles ciblés">
        <input value={muscles} onChange={(e) => setMuscles(e.target.value)} placeholder="Quadriceps · Fessiers" style={inputStyle(t)} />
      </Field>
      <Field label="Consignes">
        <textarea value={instr} onChange={(e) => setInstr(e.target.value)} placeholder="Consignes d’exécution (optionnel)"
          style={{ ...inputStyle(t), minHeight: 80, resize: 'vertical', lineHeight: 1.45 }} />
      </Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {editing && (
          <button onClick={() => { onDelete(exercise.id); onClose(); }} style={{ border: 'none', cursor: 'pointer',
            background: t.dark ? 'rgba(255,90,95,0.14)' : '#FFF1F1', color: '#FF5A5F', borderRadius: 14, padding: '15px 18px', fontSize: 15.5, fontWeight: 680 }}>
            Supprimer
          </button>
        )}
        <button onClick={save} disabled={!name.trim()} style={{ flex: 1, border: 'none', cursor: 'pointer',
          background: name.trim() ? t.accent : t.fill, color: name.trim() ? '#fff' : t.faint, borderRadius: 14, padding: '15px',
          fontSize: 16, fontWeight: 700, boxShadow: name.trim() ? '0 8px 20px rgba(31,107,255,0.26)' : 'none' }}>
          {editing ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </Sheet>
  );
}

/* --------------------------------------------------- Exercise detail (read) */
function ExerciseDetail({ exercise, onEdit, onClose }) {
  const t = useTheme();
  const c = catById(exercise.category);
  return (
    <Sheet onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <span style={{ width: 52, height: 52, borderRadius: 15, background: c.color + '18', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="dumbbell" size={26} stroke={c.color} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 780, color: t.ink, letterSpacing: -0.4 }}>{exercise.name}</div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: c.color, background: c.color + '14', borderRadius: 99, padding: '4px 10px', display: 'inline-block', marginTop: 5 }}>{c.name}</span>
        </div>
      </div>
      {exercise.muscles && (
        <div style={{ background: t.fill, borderRadius: 14, padding: '13px 15px', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.faint, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Muscles</div>
          <div style={{ fontSize: 15.5, color: t.ink, fontWeight: 600 }}>{exercise.muscles}</div>
        </div>
      )}
      {exercise.instructions && (
        <div style={{ background: t.fill, borderRadius: 14, padding: '13px 15px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.faint, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Exécution</div>
          <div style={{ fontSize: 15, color: t.sub, lineHeight: 1.5 }}>{exercise.instructions}</div>
        </div>
      )}
      <button onClick={onEdit} style={{ width: '100%', border: `1px solid ${t.line}`, cursor: 'pointer', background: t.surface,
        color: t.ink, borderRadius: 14, padding: '14px', fontSize: 15.5, fontWeight: 680, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Icon name="pencil" size={18} stroke={t.ink} /> Modifier
      </button>
    </Sheet>
  );
}

/* --------------------------------------------------- Exercise picker */
function ExercisePicker({ exercises, onPick, onClose }) {
  const t = useTheme();
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const items = exercises
    .filter((e) => filter === 'all' || e.category === filter)
    .filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Sheet title="Ajouter un exercice" onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.fill, borderRadius: 12, padding: '10px 13px', marginBottom: 12 }}>
        <Icon name="search" size={18} stroke={t.faint} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" autoFocus style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: t.ink, fontFamily: 'inherit' }} />
      </div>
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', marginBottom: 12, paddingBottom: 2, scrollbarWidth: 'none' }}>
        {[{ id: 'all', name: 'Tous', color: t.accent }, ...CATEGORIES].map((c) => {
          const on = filter === c.id;
          return (
            <button key={c.id} onClick={() => setFilter(c.id)} style={{ flexShrink: 0, cursor: 'pointer', border: `1.5px solid ${on ? c.color : t.line}`,
              background: on ? c.color : t.surface, color: on ? '#fff' : t.sub, borderRadius: 99, padding: '7px 13px', fontSize: 13, fontWeight: 650 }}>{c.name}</button>
          );
        })}
      </div>
      <div style={{ maxHeight: '46vh', overflowY: 'auto', margin: '0 -4px', padding: '0 4px' }}>
        {items.map((ex) => {
          const c = catById(ex.category);
          return (
            <button key={ex.id} onClick={() => { onPick(ex); onClose(); }} style={{ width: '100%', textAlign: 'left', cursor: 'pointer',
              background: t.surface, border: `1px solid ${t.line}`, borderRadius: 13, padding: '12px 14px', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: c.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 15.5, fontWeight: 650, color: t.ink }}>{ex.name}</span>
              <Icon name="plus" size={19} sw={2.2} stroke={t.accent} />
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/* --------------------------------------------------- Session editor (full screen) */
function SessionEditor({ session, exercises, onChange, onDelete, onStart, onClose }) {
  const t = useTheme();
  const exById = (id) => exercises.find((e) => e.id === id);
  const [draft, setDraft] = React.useState(() => JSON.parse(JSON.stringify(session)));
  const [picking, setPicking] = React.useState(false);
  const commit = (d) => { setDraft(d); onChange(d); };

  const setField = (k, v) => commit({ ...draft, [k]: v });
  const setBlock = (i, k, v) => { const blocks = draft.blocks.map((b, j) => j === i ? { ...b, [k]: v } : b); commit({ ...draft, blocks }); };
  const removeBlock = (i) => commit({ ...draft, blocks: draft.blocks.filter((_, j) => j !== i) });
  const moveBlock = (i, d) => {
    const j = i + d; if (j < 0 || j >= draft.blocks.length) return;
    const blocks = draft.blocks.slice(); [blocks[i], blocks[j]] = [blocks[j], blocks[i]]; commit({ ...draft, blocks });
  };
  const addBlock = (ex) => commit({ ...draft, blocks: [...draft.blocks, { exerciseId: ex.id, sets: 3, reps: '10', load: 'PdC', rest: 90 }] });

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, background: t.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '58px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onClose} style={iconBtn(t)}><Icon name="chevron-l" size={20} sw={2.2} stroke={t.ink} /></button>
        <div style={{ flex: 1, fontSize: 17, fontWeight: 700, color: t.sub }}>Modifier la séance</div>
        <button onClick={() => { onDelete(draft.id); onClose(); }} style={{ ...iconBtn(t), background: t.dark ? 'rgba(255,90,95,0.14)' : '#FFF1F1' }}>
          <Icon name="close" size={18} sw={2.2} stroke="#FF5A5F" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 20px' }}>
        <input value={draft.name} onChange={(e) => setField('name', e.target.value)} placeholder="Nom de la séance"
          style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', background: 'transparent',
            fontSize: 28, fontWeight: 800, letterSpacing: -0.6, color: t.ink, fontFamily: 'inherit', padding: 0 }} />
        <input value={draft.note || ''} onChange={(e) => setField('note', e.target.value)} placeholder="Note / objectif…"
          style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', background: 'transparent',
            fontSize: 15.5, color: t.sub, fontFamily: 'inherit', padding: '6px 0 0' }} />

        <div style={{ height: 1, background: t.line, margin: '16px 0' }} />

        {draft.blocks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: t.faint, fontSize: 14.5 }}>Aucun exercice. Ajoute-en un ci-dessous.</div>
        )}
        {draft.blocks.map((b, i) => {
          const ex = exById(b.exerciseId); const c = catById(ex?.category);
          return (
            <div key={i} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16, padding: 14, marginBottom: 10, boxShadow: t.shadowSm }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: c.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: t.ink }}>{ex ? ex.name : 'Exercice supprimé'}</span>
                <button onClick={() => moveBlock(i, -1)} disabled={i === 0} style={miniBtn(t, i === 0)}><Icon name="chevron-l" size={16} sw={2.4} stroke={t.sub} style={{ transform: 'rotate(90deg)' }} /></button>
                <button onClick={() => moveBlock(i, 1)} disabled={i === draft.blocks.length - 1} style={miniBtn(t, i === draft.blocks.length - 1)}><Icon name="chevron" size={16} sw={2.4} stroke={t.sub} style={{ transform: 'rotate(90deg)' }} /></button>
                <button onClick={() => removeBlock(i)} style={miniBtn(t)}><Icon name="close" size={15} sw={2.4} stroke="#FF5A5F" /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <MiniField label="Séries" value={b.sets} onChange={(v) => setBlock(i, 'sets', parseInt(v) || 0)} num />
                <MiniField label="Reps" value={b.reps} onChange={(v) => setBlock(i, 'reps', v)} />
                <MiniField label="Charge" value={b.load} onChange={(v) => setBlock(i, 'load', v)} />
                <MiniField label="Repos" value={b.rest} onChange={(v) => setBlock(i, 'rest', parseInt(v) || 0)} num />
              </div>
            </div>
          );
        })}

        <button onClick={() => setPicking(true)} style={{ width: '100%', border: `1.5px dashed ${t.lineStrong}`, cursor: 'pointer',
          background: 'transparent', color: t.accent, borderRadius: 14, padding: '14px', fontSize: 15.5, fontWeight: 680,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
          <Icon name="plus" size={19} sw={2.2} stroke={t.accent} /> Ajouter un exercice
        </button>
      </div>

      <div style={{ padding: '8px 20px calc(24px + env(safe-area-inset-bottom))' }}>
        <button onClick={() => { if (draft.blocks.length) onStart(draft.id); }} disabled={!draft.blocks.length} style={{ ...navBtn(t, true), opacity: draft.blocks.length ? 1 : 0.5 }}>
          <Icon name="play" size={19} stroke="#fff" /> Démarrer la séance
        </button>
      </div>

      {picking && <ExercisePicker exercises={exercises} onPick={addBlock} onClose={() => setPicking(false)} />}
    </div>
  );
}

function MiniField({ label, value, onChange, num }) {
  const t = useTheme();
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: t.faint, textTransform: 'uppercase', letterSpacing: 0.2, marginBottom: 5, textAlign: 'center' }}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode={num ? 'numeric' : 'text'}
        style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${t.line}`, background: t.dark ? t.fill : t.bg,
          borderRadius: 10, padding: '9px 4px', fontSize: 14.5, fontWeight: 600, color: t.ink, fontFamily: 'inherit', outline: 'none', textAlign: 'center' }} />
    </div>
  );
}
const miniBtn = (t, disabled) => ({ width: 32, height: 32, borderRadius: 9, border: `1px solid ${t.line}`, cursor: disabled ? 'default' : 'pointer',
  background: t.dark ? t.fill : t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: disabled ? 0.4 : 1 });

Object.assign(window, { ExerciseEditor, ExerciseDetail, ExercisePicker, SessionEditor, Field, inputStyle });
