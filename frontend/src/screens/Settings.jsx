import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripData } from '../context/TripDataContext';
import { CURRENCIES } from '../utils/categories';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Settings() {
  const { trip, dark, setDark, updateTripSettings, deleteTrip } = useTripData();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(() => localStorage.getItem('gastosapp:notifications') !== 'false');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const toggleNotifications = () => {
    setNotifications((prev) => {
      const next = !prev;
      localStorage.setItem('gastosapp:notifications', String(next));
      return next;
    });
  };

  return (
    <div className="gc-main-anim">
      <h2 style={{ margin: '0 0 var(--space-4)' }}>Configuración</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 480 }}>
        <div className="field">
          <label>Moneda</label>
          <select className="input" value={trip.currency} onChange={(e) => updateTripSettings({ name: trip.name, currency: e.target.value })}>
            {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Tema</label>
          <div className="seg">
            <label className="seg-opt"><input type="radio" name="theme" checked={!dark} onChange={() => setDark(false)} />Claro</label>
            <label className="seg-opt"><input type="radio" name="theme" checked={dark} onChange={() => setDark(true)} />Oscuro</label>
          </div>
        </div>
        <label className="radio" style={{ cursor: 'pointer' }}>
          <input type="checkbox" checked={notifications} onChange={toggleNotifications} style={{ position: 'absolute', opacity: 0 }} />
          <span className="dot" />
          Notificaciones de deudas pendientes
        </label>
        <div>
          <h4 style={{ margin: '0 0 var(--space-2)' }}>Miembros del grupo</h4>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {trip.participants.map((p) => <span key={p.id} className="tag tag-neutral">{p.name}</span>)}
          </div>
        </div>
        <button type="button" className="btn btn-secondary" style={{ color: 'var(--color-negative)', alignSelf: 'flex-start' }} onClick={() => setConfirmingDelete(true)}>
          Eliminar grupo
        </button>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          title="Eliminar grupo"
          message={`Se eliminará "${trip.name}" junto con todos sus gastos. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar grupo"
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={async () => { await deleteTrip(); setConfirmingDelete(false); navigate('/dashboard'); }}
        />
      )}
    </div>
  );
}
