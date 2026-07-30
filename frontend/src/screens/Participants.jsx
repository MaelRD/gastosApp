import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripData } from '../context/TripDataContext';
import { formatCurrency, initials } from '../utils/format';
import ConfirmDialog from '../components/ConfirmDialog';

const AVATAR_COLORS = [
  'var(--color-accent-600)', 'var(--color-accent-2-600)', 'var(--color-neutral-600)',
  'var(--color-accent-800)', 'var(--color-accent-2-800)', 'var(--color-neutral-800)',
];

export default function Participants() {
  const { trip, balance, addParticipant, removeParticipant } = useTripData();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const balanceByUser = Object.fromEntries(balance.balances.map((b) => [b.userId, b]));

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addParticipant(name.trim());
    setName('');
    setAdding(false);
  };

  return (
    <div className="gc-main-anim">
      <div className="gc-screen-head">
        <h2 style={{ margin: 0 }}>Participantes</h2>
        <button type="button" className="btn btn-primary" onClick={() => setAdding((v) => !v)}>+ Agregar</button>
      </div>

      {adding && (
        <div className="card elev-sm" style={{ marginBottom: 'var(--space-3)', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <input className="input" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)}
            style={{ flex: 1 }} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} autoFocus />
          <button type="button" className="btn btn-primary" onClick={handleAdd}>Guardar</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
        {trip.participants.map((p, i) => {
          const b = balanceByUser[p.id] || { paid: 0, owed: 0, net: 0 };
          const net = Number(b.net);
          return (
            <div key={p.id} className="card elev-sm">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="gc-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>{initials(p.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: net > 0.5 ? 'var(--color-positive)' : net < -0.5 ? 'var(--color-negative)' : undefined }} className={Math.abs(net) <= 0.5 ? 'text-muted' : ''}>
                    {net > 0.5 ? `Le deben ${formatCurrency(net, trip.currency)}` : net < -0.5 ? `Debe ${formatCurrency(-net, trip.currency)}` : 'Saldado'}
                  </div>
                </div>
              </div>
              <div className="card-meta" style={{ justifyContent: 'space-between', marginTop: 4 }}>
                <span>Pagó {formatCurrency(b.paid, trip.currency)}</span>
                <span>Debe {formatCurrency(b.owed, trip.currency)}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, fontSize: 12 }} onClick={() => navigate(`/perfil/${p.id}`)}>Ver historial</button>
                <button type="button" className="btn btn-secondary btn-icon" onClick={() => setPendingDelete(p)} aria-label="Eliminar">×</button>
              </div>
            </div>
          );
        })}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Eliminar participante"
          message="Se eliminará de la lista de participantes. Los gastos ya registrados no cambian."
          confirmLabel="Eliminar"
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => { await removeParticipant(pendingDelete.id); setPendingDelete(null); }}
        />
      )}
    </div>
  );
}
