import { useTripData } from '../context/TripDataContext';
import { formatCurrency, initials } from '../utils/format';
import { ArrowRightIcon } from '../components/icons';

export default function Balance() {
  const { trip, balance, paidSettlements, toggleSettlementPaid } = useTripData();
  const { settlements } = balance;

  return (
    <div className="gc-main-anim">
      <h2 style={{ margin: '0 0 4px' }}>Balance</h2>
      <p className="text-muted" style={{ margin: '0 0 var(--space-4)' }}>¿Quién debe pagar, a quién y cuánto?</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--space-6)' }}>
        {settlements.map((s) => {
          const key = `${s.fromUserId}-${s.toUserId}`;
          const isPaid = paidSettlements.has(key);
          return (
            <div key={key} className="card elev-sm gc-settlement-row">
              <div className="gc-avatar" style={{ background: 'var(--color-accent-600)' }}>{initials(s.fromName)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{s.fromName}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>Debe pagar a {s.toName}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 18 }}>{formatCurrency(s.amount, trip.currency)}</div>
              <button type="button" className={isPaid ? 'btn btn-secondary' : 'btn btn-primary'} onClick={() => toggleSettlementPaid(key)}>
                {isPaid ? 'Pagado' : 'Marcar pagado'}
              </button>
            </div>
          );
        })}
        {settlements.length === 0 && <p className="text-muted">Todo está saldado. Nadie debe nada 🎉</p>}
      </div>

      {settlements.length > 0 && (
        <>
          <h4 style={{ margin: '0 0 var(--space-2)' }}>Transferencias optimizadas</h4>
          <p className="text-muted" style={{ fontSize: 13, margin: '0 0 var(--space-2)' }}>
            {settlements.length} {settlements.length === 1 ? 'transferencia' : 'transferencias'} para saldar todo el grupo.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {settlements.map((s) => (
              <div key={`${s.fromUserId}-${s.toUserId}-line`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span>{s.fromName}</span>
                <ArrowRightIcon size={14} />
                <span>{s.toName}</span>
                <span className="text-muted" style={{ marginLeft: 'auto' }}>{formatCurrency(s.amount, trip.currency)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
