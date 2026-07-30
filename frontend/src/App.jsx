import { Navigate, Route, Routes } from 'react-router-dom';
import { TripDataProvider, useTripData } from './context/TripDataContext';
import AppShell from './components/AppShell';
import Dashboard from './screens/Dashboard';
import Participants from './screens/Participants';
import ExpenseForm from './screens/ExpenseForm';
import History from './screens/History';
import ExpenseDetail from './screens/ExpenseDetail';
import Balance from './screens/Balance';
import Reports from './screens/Reports';
import Profile from './screens/Profile';
import Settings from './screens/Settings';

function AppRoutes() {
  const { loading, error } = useTripData();

  if (loading) {
    return <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Cargando…</div>;
  }
  if (error) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <p>No se pudo conectar con el servidor.</p>
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="participantes" element={<Participants />} />
        <Route path="gastos/nuevo" element={<ExpenseForm />} />
        <Route path="gastos/:id/editar" element={<ExpenseForm />} />
        <Route path="gastos/:id" element={<ExpenseDetail />} />
        <Route path="historial" element={<History />} />
        <Route path="balance" element={<Balance />} />
        <Route path="reportes" element={<Reports />} />
        <Route path="perfil" element={<Profile />} />
        <Route path="perfil/:id" element={<Profile />} />
        <Route path="configuracion" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <TripDataProvider>
      <AppRoutes />
    </TripDataProvider>
  );
}
