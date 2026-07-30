import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTripData } from '../context/TripDataContext';
import { api } from '../api/client';
import { formatCurrency } from '../utils/format';
import { CATEGORIES, CATEGORY_LABELS } from '../utils/categories';

function blankForm(participants) {
  return {
    payerId: participants[0]?.id ?? null,
    participantIds: participants.map((p) => p.id),
    concept: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'COMIDA',
    amount: '',
    splitType: 'EQUAL',
    customSplits: {},
    notes: '',
  };
}

function computeSplits(form) {
  const amount = parseFloat(form.amount) || 0;
  const splits = {};
  if (form.splitType === 'EQUAL') {
    const share = Math.round((amount / form.participantIds.length) * 100) / 100;
    let assigned = 0;
    form.participantIds.forEach((pid, i) => {
      if (i === form.participantIds.length - 1) splits[pid] = Math.round((amount - assigned) * 100) / 100;
      else { splits[pid] = share; assigned += share; }
    });
  } else if (form.splitType === 'PERCENTAGE') {
    form.participantIds.forEach((pid) => {
      splits[pid] = Math.round(amount * (parseFloat(form.customSplits[pid]) || 0) / 100 * 100) / 100;
    });
  } else {
    form.participantIds.forEach((pid) => { splits[pid] = parseFloat(form.customSplits[pid]) || 0; });
  }
  return splits;
}

export default function ExpenseForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { trip, createExpense, updateExpense } = useTripData();
  const [form, setForm] = useState(() => blankForm(trip.participants));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      const ex = await api.getExpense(id);
      setForm({
        payerId: ex.payerId,
        participantIds: ex.splits.map((s) => s.userId),
        concept: ex.description,
        date: ex.date,
        category: ex.category,
        amount: String(ex.totalAmount),
        splitType: ex.splitType,
        customSplits: Object.fromEntries(ex.splits.map((s) => [
          s.userId,
          ex.splitType === 'PERCENTAGE' ? String(Math.round((s.amountOwed / ex.totalAmount) * 100)) : String(s.amountOwed),
        ])),
        notes: ex.notes || '',
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const splits = useMemo(() => computeSplits(form), [form]);
  const splitsSum = Object.values(splits).reduce((s, v) => s + v, 0);
  const amount = parseFloat(form.amount) || 0;

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggleParticipant = (pid) => setForm((f) => {
    const ids = f.participantIds.includes(pid) ? f.participantIds.filter((x) => x !== pid) : [...f.participantIds, pid];
    return { ...f, participantIds: ids };
  });

  const handleSubmit = async () => {
    if (!form.concept.trim() || !amount || amount <= 0 || form.participantIds.length === 0) {
      setError('Completa el concepto, un monto válido y al menos un participante.');
      return;
    }
    if (Math.abs(splitsSum - amount) > 0.02) {
      setError(`La suma de la división (${splitsSum.toFixed(2)}) no coincide con el monto total (${amount.toFixed(2)}).`);
      return;
    }
    const payload = {
      payerId: form.payerId,
      description: form.concept.trim(),
      totalAmount: amount,
      date: form.date,
      category: form.category,
      splitType: form.splitType,
      notes: form.notes || null,
      splits: form.participantIds.map((userId) => ({ userId, amountOwed: splits[userId] })),
    };
    try {
      if (isEditing) await updateExpense(id, payload);
      else await createExpense(payload);
      navigate('/historial');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 560 }}>
      <h2 className="gc-main-anim" style={{ margin: 0 }}>{isEditing ? 'Editar gasto' : 'Registrar gasto'}</h2>

      <div className="card elev-sm" style={{ alignItems: 'center', padding: 'var(--space-6) var(--space-4)' }}>
        <div className="card-kicker">Monto del gasto</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 32, color: 'var(--color-accent)' }}>{trip.currency}</span>
          <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount}
            onChange={(e) => setField('amount', e.target.value)}
            style={{ border: 'none', background: 'transparent', textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 40, width: 200, padding: 0 }} />
        </div>
      </div>

      <div className="card">
        <div className="card-kicker">Detalles</div>
        <div className="field"><label>Concepto</label>
          <input className="input" placeholder="Ej. Cena del viernes" value={form.concept} onChange={(e) => setField('concept', e.target.value)} />
        </div>
        <div className="field"><label>Fecha</label>
          <input className="input" type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} />
        </div>
        <div className="field"><label>Categoría</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => (
              <button key={c} type="button" className={`gc-chip${form.category === c ? ' selected' : ''}`} onClick={() => setField('category', c)}>
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-kicker">¿Quién pagó?</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {trip.participants.map((p) => (
            <button key={p.id} type="button" className={`gc-chip${form.payerId === p.id ? ' selected' : ''}`} onClick={() => setField('payerId', p.id)}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="card-kicker" style={{ marginTop: 'var(--space-2)' }}>Participantes</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {trip.participants.map((p) => (
            <button key={p.id} type="button" className={`gc-chip${form.participantIds.includes(p.id) ? ' selected' : ''}`} onClick={() => toggleParticipant(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-kicker">División</div>
        <div className="seg">
          <label className="seg-opt"><input type="radio" name="split" checked={form.splitType === 'EQUAL'} onChange={() => setField('splitType', 'EQUAL')} />Igual</label>
          <label className="seg-opt"><input type="radio" name="split" checked={form.splitType === 'PERCENTAGE'} onChange={() => setField('splitType', 'PERCENTAGE')} />Porcentaje</label>
          <label className="seg-opt"><input type="radio" name="split" checked={form.splitType === 'FIXED'} onChange={() => setField('splitType', 'FIXED')} />Monto fijo</label>
        </div>
        <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {form.participantIds.map((pid) => {
            const p = trip.participants.find((x) => x.id === pid);
            return (
              <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ flex: 1 }}>{p?.name}</span>
                {form.splitType === 'EQUAL' && <span className="text-muted">{formatCurrency(splits[pid] || 0, trip.currency)}</span>}
                {form.splitType === 'PERCENTAGE' && (
                  <>
                    <input className="input" type="number" min="0" max="100" style={{ width: 70, textAlign: 'right' }}
                      value={form.customSplits[pid] || ''}
                      onChange={(e) => setForm((f) => ({ ...f, customSplits: { ...f.customSplits, [pid]: e.target.value } }))} />
                    <span className="text-muted" style={{ width: 70, textAlign: 'right', display: 'inline-block' }}>{formatCurrency(splits[pid] || 0, trip.currency)}</span>
                  </>
                )}
                {form.splitType === 'FIXED' && (
                  <input className="input" type="number" min="0" style={{ width: 90, textAlign: 'right' }}
                    value={form.customSplits[pid] || ''}
                    onChange={(e) => setForm((f) => ({ ...f, customSplits: { ...f.customSplits, [pid]: e.target.value } }))} />
                )}
              </div>
            );
          })}
          <div className="text-muted" style={{ fontSize: 12 }}>
            Suma: {formatCurrency(splitsSum, trip.currency)} de {formatCurrency(amount, trip.currency)}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-kicker">Extras</div>
        <div className="field"><label>Observaciones</label>
          <textarea className="input" rows={2} placeholder="Opcional" value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
        </div>
      </div>

      {error && <p style={{ color: 'var(--color-negative)', fontSize: 13 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate(-1)}>Cancelar</button>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>Guardar gasto</button>
      </div>
    </div>
  );
}
