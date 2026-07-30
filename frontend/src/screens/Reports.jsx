import { useMemo } from 'react';
import { useTripData } from '../context/TripDataContext';
import { formatCurrency, formatDate, initials } from '../utils/format';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/categories';

export default function Reports() {
  const { trip, expenses, balance } = useTripData();

  const totalSpent = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

  const categoryLegend = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => { totals[e.category] = (totals[e.category] || 0) + e.totalAmount; });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([category, amount]) => ({
      category, name: CATEGORY_LABELS[category], color: CATEGORY_COLORS[category], amount,
    }));
  }, [expenses]);

  const pieBackground = useMemo(() => {
    if (!categoryLegend.length) return 'var(--color-divider)';
    let acc = 0;
    const stops = categoryLegend.map(({ color, amount }) => {
      const pct = totalSpent ? (amount / totalSpent) * 100 : 0;
      const start = acc;
      acc += pct;
      return `${color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [categoryLegend, totalSpent]);

  const participantBars = useMemo(() => {
    const max = Math.max(1, ...balance.balances.map((b) => Number(b.paid)));
    return balance.balances.map((b) => ({ ...b, heightPct: Math.max(4, Math.round((Number(b.paid) / max) * 100)) }));
  }, [balance]);

  const byDay = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => { totals[e.date] = (totals[e.date] || 0) + e.totalAmount; });
    return Object.entries(totals).sort(([a], [b]) => a.localeCompare(b));
  }, [expenses]);

  const linePoints = useMemo(() => {
    if (byDay.length === 0) return '';
    const max = Math.max(...byDay.map(([, v]) => v), 1);
    const step = byDay.length > 1 ? 300 / (byDay.length - 1) : 0;
    return byDay.map(([, v], i) => `${(step * i).toFixed(1)},${(100 - (v / max) * 95).toFixed(1)}`).join(' ');
  }, [byDay]);

  const top5 = [...expenses].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5);
  const dailyAvg = byDay.length ? totalSpent / byDay.length : 0;

  return (
    <div className="gc-main-anim">
      <h2 style={{ margin: '0 0 var(--space-4)' }}>Reportes</h2>

      <div className="gc-charts-row">
        <div className="card elev-sm" style={{ flex: 1, minWidth: 240 }}>
          <div className="card-kicker" style={{ marginBottom: 8 }}>Distribución por categoría</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="gc-pie" style={{ background: pieBackground }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {categoryLegend.map((c) => (
                <div key={c.category} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span className="gc-dot" style={{ background: c.color }} /><span style={{ flex: 1 }}>{c.name}</span>
                  <span className="text-muted">{formatCurrency(c.amount, trip.currency)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card elev-sm" style={{ flex: 1, minWidth: 240 }}>
          <div className="card-kicker" style={{ marginBottom: 8 }}>Gastos por usuario</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {participantBars.map((b) => (
              <div key={b.userId} className="gc-bar-col">
                <div className="gc-bar-wrap"><div className="gc-bar gc-bar-fill" style={{ height: `${b.heightPct}%`, background: 'var(--color-accent)' }} /></div>
                <span style={{ fontSize: 10, marginTop: 4 }}>{initials(b.name)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card elev-sm" style={{ marginTop: 'var(--space-4)' }}>
        <div className="card-kicker" style={{ marginBottom: 8 }}>Evolución del gasto</div>
        <svg viewBox="0 0 300 100" width="100%" height="100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <polyline points={linePoints} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {byDay.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4 }} className="text-muted">
            <span>{formatDate(byDay[0][0])}</span><span>{formatDate(byDay[byDay.length - 1][0])}</span>
          </div>
        )}
      </div>

      <div className="gc-charts-row" style={{ marginTop: 'var(--space-4)' }}>
        <div className="card elev-sm" style={{ flex: 1, minWidth: 220 }}>
          <div className="card-kicker" style={{ marginBottom: 8 }}>Top 5 mayores gastos</div>
          {top5.map((e) => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
              <span>{e.description}</span><span className="text-muted">{formatCurrency(e.totalAmount, trip.currency)}</span>
            </div>
          ))}
          {top5.length === 0 && <p className="text-muted">Sin datos aún.</p>}
        </div>
        <div className="card elev-sm" style={{ flex: 1, minWidth: 220 }}>
          <div className="card-kicker" style={{ marginBottom: 8 }}>Promedio diario</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 26 }}>{formatCurrency(dailyAvg, trip.currency)}</div>
          <p className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>{byDay.length} día(s) con gastos registrados</p>
        </div>
      </div>
    </div>
  );
}
