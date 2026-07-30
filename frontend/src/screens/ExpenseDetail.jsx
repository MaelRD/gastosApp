import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTripData } from '../context/TripDataContext';
import { api } from '../api/client';
import { formatCurrency, formatDate, initials } from '../utils/format';
import { CATEGORY_LABELS } from '../utils/categories';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ExpenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trip, deleteExpense } = useTripData();
  const [expense, setExpense] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    api.getExpense(id).then(setExpense);
  }, [id]);

  if (!expense) return <p className="text-muted">Cargando…</p>;

  return (
    <div className="gc-main-anim">
      <div className="gc-screen-head">
        <h2 style={{ margin: 0 }}>{expense.description}</h2>
        <span className="tag tag-accent">{CATEGORY_LABELS[expense.category]}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 36, marginBottom: 'var(--space-4)' }}>
        {formatCurrency(expense.totalAmount, trip.currency)}
      </div>
      <div className="card elev-sm" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card-meta" style={{ justifyContent: 'space-between' }}><span>Pagó</span><span style={{ color: 'var(--color-text)' }}>{expense.payerName}</span></div>
        <div className="card-meta" style={{ justifyContent: 'space-between' }}><span>Fecha</span><span style={{ color: 'var(--color-text)' }}>{formatDate(expense.date)}</span></div>
        {expense.notes && (
          <div className="card-meta" style={{ justifyContent: 'space-between' }}><span>Notas</span><span style={{ color: 'var(--color-text)' }}>{expense.notes}</span></div>
        )}
      </div>

      <h4 style={{ margin: '0 0 var(--space-2)' }}>Cuánto corresponde a cada uno</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 'var(--space-4)' }}>
        {expense.splits.map((s) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <div className="gc-avatar" style={{ width: 28, height: 28, fontSize: 11, background: 'var(--color-accent-600)' }}>{initials(s.userName)}</div>
            <span style={{ flex: 1 }}>{s.userName}</span>
            <span className="text-muted">{formatCurrency(s.amountOwed, trip.currency)}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate(`/gastos/${id}/editar`)}>Editar</button>
        <button type="button" className="btn btn-secondary" style={{ flex: 1, color: 'var(--color-negative)' }} onClick={() => setConfirmingDelete(true)}>Eliminar</button>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Eliminar gasto"
          message="¿Seguro que quieres eliminar este gasto? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={async () => { await deleteExpense(id); navigate('/historial'); }}
        />
      )}
    </div>
  );
}
