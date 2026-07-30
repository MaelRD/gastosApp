import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTripData } from '../context/TripDataContext';
import { formatCurrency, formatDate, initials } from '../utils/format';
import { CATEGORY_COLORS } from '../utils/categories';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trip, expenses, balance } = useTripData();

  useEffect(() => {
    if (!id && trip.participants[0]) navigate(`/perfil/${trip.participants[0].id}`, { replace: true });
  }, [id, trip.participants, navigate]);

  const selectedId = Number(id);
  const selected = trip.participants.find((p) => p.id === selectedId);
  const selectedBalance = balance.balances.find((b) => b.userId === selectedId);

  const history = useMemo(() => expenses
    .filter((e) => e.payerId === selectedId || e.splits.some((s) => s.userId === selectedId))
    .map((e) => ({
      ...e,
      roleLabel: e.payerId === selectedId ? 'Pagó' : 'Participó',
    })), [expenses, selectedId]);

  if (!selected) return null;

  const net = Number(selectedBalance?.net || 0);

  return (
    <div>
      <div className="gc-main-anim" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
        {trip.participants.map((p) => (
          <button key={p.id} type="button" className={`gc-chip${p.id === selectedId ? ' selected' : ''}`} onClick={() => navigate(`/perfil/${p.id}`)}>
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)' }}>
        <div className="gc-avatar gc-avatar-lg" style={{ background: 'var(--color-accent-600)' }}>{initials(selected.name)}</div>
        <div>
          <h2 style={{ margin: 0 }}>{selected.name}</h2>
          <span style={{ color: net > 0.5 ? 'var(--color-positive)' : net < -0.5 ? 'var(--color-negative)' : 'inherit' }}>
            {net > 0.5 ? `Le deben ${formatCurrency(net, trip.currency)}` : net < -0.5 ? `Debe ${formatCurrency(-net, trip.currency)}` : 'Saldado'}
          </span>
        </div>
      </div>

      <div className="gc-kpi-grid">
        <div className="card elev-sm"><div className="card-kicker">Total pagado</div><div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 22 }}>{formatCurrency(selectedBalance?.paid || 0, trip.currency)}</div></div>
        <div className="card elev-sm"><div className="card-kicker">Total adeudado</div><div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 22 }}>{formatCurrency(selectedBalance?.owed || 0, trip.currency)}</div></div>
        <div className="card elev-sm"><div className="card-kicker">Gastos en los que participa</div><div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 22 }}>{history.length}</div></div>
      </div>

      <h4 style={{ margin: 'var(--space-6) 0 var(--space-3)' }}>Historial personal</h4>
      <div>
        {history.map((ex) => (
          <div key={ex.id} className="gc-movement-row" onClick={() => navigate(`/gastos/${ex.id}`)}>
            <span className="gc-dot" style={{ background: CATEGORY_COLORS[ex.category] }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{ex.description}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{ex.roleLabel} · {formatDate(ex.date)}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{formatCurrency(ex.totalAmount, trip.currency)}</div>
          </div>
        ))}
        {history.length === 0 && <p className="text-muted">Sin movimientos todavía.</p>}
      </div>
    </div>
  );
}
