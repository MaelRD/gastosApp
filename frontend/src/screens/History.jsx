import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripData } from '../context/TripDataContext';
import { formatCurrency, formatDate } from '../utils/format';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/categories';
import ConfirmDialog from '../components/ConfirmDialog';
import { EditIcon, TrashIcon } from '../components/icons';

export default function History() {
  const { trip, expenses, deleteExpense } = useTripData();
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  const [participant, setParticipant] = useState('all');
  const [pendingDelete, setPendingDelete] = useState(null);

  const filtered = useMemo(() => expenses.filter((ex) => {
    if (category !== 'all' && ex.category !== category) return false;
    if (participant !== 'all') {
      const involved = ex.payerId === Number(participant) || ex.splits.some((s) => s.userId === Number(participant));
      if (!involved) return false;
    }
    return true;
  }), [expenses, category, participant]);

  return (
    <div className="gc-main-anim">
      <div className="gc-screen-head"><h2 style={{ margin: 0 }}>Historial</h2></div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <select className="input" style={{ maxWidth: 180 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 180 }} value={participant} onChange={(e) => setParticipant(e.target.value)}>
          <option value="all">Todos los usuarios</option>
          {trip.participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div>
        {filtered.map((ex) => (
          <div key={ex.id} className="gc-movement-row">
            <span className="gc-dot" style={{ background: CATEGORY_COLORS[ex.category] }} />
            <div style={{ flex: 1, minWidth: 0 }} onClick={() => navigate(`/gastos/${ex.id}`)}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{ex.description}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{CATEGORY_LABELS[ex.category]} · {ex.payerName} · {formatDate(ex.date)}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{formatCurrency(ex.totalAmount, trip.currency)}</div>
            <button type="button" className="btn btn-ghost btn-icon" onClick={() => navigate(`/gastos/${ex.id}/editar`)} aria-label="Editar"><EditIcon size={14} /></button>
            <button type="button" className="btn btn-ghost btn-icon" onClick={() => setPendingDelete(ex)} aria-label="Eliminar"><TrashIcon size={14} /></button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted" style={{ padding: 'var(--space-4) 0' }}>No hay gastos con estos filtros.</p>}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Eliminar gasto"
          message="¿Seguro que quieres eliminar este gasto? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => { await deleteExpense(pendingDelete.id); setPendingDelete(null); }}
        />
      )}
    </div>
  );
}
