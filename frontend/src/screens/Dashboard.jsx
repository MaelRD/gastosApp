import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripData } from '../context/TripDataContext';
import { formatCurrency, formatDate, initials } from '../utils/format';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/categories';

export default function Dashboard() {
  const { trip, expenses, balance, currentUserId, paidSettlements, toggleSettlementPaid } = useTripData();
  const navigate = useNavigate();

  const iOwe = useMemo(
    () => balance.settlements.filter((s) => s.fromUserId === currentUserId),
    [balance, currentUserId],
  );
  const owedToMe = useMemo(
    () => balance.settlements.filter((s) => s.toUserId === currentUserId),
    [balance, currentUserId],
  );

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.totalAmount, 0), [expenses]);

  const categoryLegend = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => { totals[e.category] = (totals[e.category] || 0) + e.totalAmount; });
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return entries.map(([category, amount]) => ({
      category,
      name: CATEGORY_LABELS[category],
      color: CATEGORY_COLORS[category],
      amount,
      pct: totalSpent ? Math.round((amount / totalSpent) * 100) : 0,
    }));
  }, [expenses, totalSpent]);

  const pieBackground = useMemo(() => {
    if (!categoryLegend.length) return 'var(--color-divider)';
    let acc = 0;
    const stops = categoryLegend.map(({ color, pct }) => {
      const start = acc;
      acc += pct;
      return `${color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [categoryLegend]);

  const participantBars = useMemo(() => {
    const max = Math.max(1, ...balance.balances.map((b) => Number(b.paid)));
    return balance.balances.map((b) => ({
      ...b,
      heightPct: Math.max(4, Math.round((Number(b.paid) / max) * 100)),
    }));
  }, [balance]);

  const totalPending = balance.settlements.reduce((sum, s) => sum + Number(s.amount), 0);
  const recent = expenses.slice(0, 4);

  return (
    <div className="gc-main-anim">
      <div className="gc-screen-head">
        <h2 style={{ margin: 0 }}>{trip.name}</h2>
        <span className="tag tag-outline">{trip.participants.length} participantes</span>
      </div>

      {(iOwe.length > 0 || owedToMe.length > 0) && (
        <div className="gc-charts-row" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card elev-sm" style={{ flex: 1, minWidth: 240 }}>
            <div className="card-kicker" style={{ color: 'var(--color-negative)' }}>Le debés a</div>
            {iOwe.length === 0 && <p className="text-muted" style={{ margin: '8px 0 0', fontSize: 13 }}>No le debés a nadie 🎉</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {iOwe.map((s) => {
                const key = `${s.fromUserId}-${s.toUserId}`;
                const isPaid = paidSettlements.has(key);
                return (
                  <div key={key} className="gc-settlement-row">
                    <div className="gc-avatar" style={{ background: 'var(--color-accent-600)' }}>{initials(s.toName)}</div>
                    <div style={{ flex: 1 }}>{s.toName}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{formatCurrency(s.amount, trip.currency)}</div>
                    <button type="button" className={isPaid ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => toggleSettlementPaid(key)}>
                      {isPaid ? 'Pagado' : 'Marcar pagado'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card elev-sm" style={{ flex: 1, minWidth: 240 }}>
            <div className="card-kicker" style={{ color: 'var(--color-positive)' }}>Te deben</div>
            {owedToMe.length === 0 && <p className="text-muted" style={{ margin: '8px 0 0', fontSize: 13 }}>Nadie te debe nada.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {owedToMe.map((s) => {
                const key = `${s.fromUserId}-${s.toUserId}`;
                const isPaid = paidSettlements.has(key);
                return (
                  <div key={key} className="gc-settlement-row">
                    <div className="gc-avatar" style={{ background: 'var(--color-accent-600)' }}>{initials(s.fromName)}</div>
                    <div style={{ flex: 1 }}>{s.fromName}</div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{formatCurrency(s.amount, trip.currency)}</div>
                    <button type="button" className={isPaid ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => toggleSettlementPaid(key)}>
                      {isPaid ? 'Cobrado' : 'Marcar cobrado'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="gc-kpi-grid">
        <div className="card elev-sm">
          <div className="card-kicker">Total gastado</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 28 }}>{formatCurrency(totalSpent, trip.currency)}</div>
        </div>
        <div className="card elev-sm">
          <div className="card-kicker">Participantes</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 28 }}>{trip.participants.length}</div>
        </div>
        <div className="card elev-sm">
          <div className="card-kicker">Gastos registrados</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 28 }}>{expenses.length}</div>
        </div>
        <div className="card elev-sm">
          <div className="card-kicker">Balance general</div>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20,
            color: totalPending > 0 ? 'var(--color-negative)' : 'var(--color-positive)',
          }}>
            {totalPending > 0 ? formatCurrency(totalPending, trip.currency) + ' pendiente' : 'Todo saldado'}
          </div>
        </div>
      </div>

      {categoryLegend.length > 0 && (
        <>
          <h4 style={{ margin: 'var(--space-6) 0 var(--space-3)' }}>Gastos por categoría</h4>
          <div className="gc-charts-row">
            <div className="card elev-sm" style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div className="gc-pie" style={{ background: pieBackground }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  {categoryLegend.map((c) => (
                    <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <span className="gc-dot" style={{ background: c.color }} />
                      <span style={{ flex: 1 }}>{c.name}</span>
                      <span className="text-muted">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card elev-sm" style={{ flex: 1, minWidth: 240 }}>
              <div className="card-kicker" style={{ marginBottom: 8 }}>Gastos por participante</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                {participantBars.map((b) => (
                  <div key={b.userId} className="gc-bar-col">
                    <div className="gc-bar-wrap">
                      <div className="gc-bar gc-bar-fill" style={{ height: `${b.heightPct}%`, background: 'var(--color-accent)' }} />
                    </div>
                    <span style={{ fontSize: 10, marginTop: 4 }}>{initials(b.name)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <h4 style={{ margin: 'var(--space-6) 0 var(--space-3)' }}>Últimos movimientos</h4>
      <div>
        {recent.map((ex) => (
          <div key={ex.id} className="gc-movement-row" onClick={() => navigate(`/gastos/${ex.id}`)}>
            <span className="gc-dot" style={{ background: CATEGORY_COLORS[ex.category] }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{ex.description}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{ex.payerName} · {formatDate(ex.date)}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{formatCurrency(ex.totalAmount, trip.currency)}</div>
          </div>
        ))}
        {recent.length === 0 && <p className="text-muted">Aún no hay gastos registrados.</p>}
      </div>
    </div>
  );
}
