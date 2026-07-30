import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTripData } from '../context/TripDataContext';
import {
  DashboardIcon, ParticipantsIcon, HistoryIcon, BalanceIcon, ReportsIcon,
  ProfileIcon, SettingsIcon, BackIcon, SunIcon, MoonIcon, PlusIcon,
} from './icons';

const PRIMARY_PATHS = ['/dashboard', '/participantes', '/historial', '/balance', '/reportes', '/perfil', '/configuracion'];

const SIDEBAR_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { path: '/participantes', label: 'Participantes', Icon: ParticipantsIcon },
  { path: '/historial', label: 'Historial', Icon: HistoryIcon },
  { path: '/balance', label: 'Balance', Icon: BalanceIcon },
  { path: '/reportes', label: 'Reportes', Icon: ReportsIcon },
  { path: '/perfil', label: 'Perfil', Icon: ProfileIcon },
  { path: '/configuracion', label: 'Configuración', Icon: SettingsIcon },
];

const BOTTOM_NAV_ITEMS = [
  { path: '/dashboard', label: 'Inicio', Icon: DashboardIcon },
  { path: '/historial', label: 'Gastos', Icon: HistoryIcon },
  { path: '/balance', label: 'Balance', Icon: BalanceIcon },
  { path: '/reportes', label: 'Reportes', Icon: ReportsIcon },
  { path: '/configuracion', label: 'Config', Icon: SettingsIcon },
];

const TITLES = [
  { test: (p) => p.startsWith('/gastos/nuevo'), title: 'Registrar gasto' },
  { test: (p) => /\/gastos\/.+\/editar/.test(p), title: 'Editar gasto' },
  { test: (p) => /\/gastos\/[^/]+$/.test(p), title: 'Detalle del gasto' },
  { test: (p) => /\/perfil\/.+/.test(p), title: 'Perfil' },
  { test: (p) => p.startsWith('/dashboard'), title: 'Dashboard' },
  { test: (p) => p.startsWith('/participantes'), title: 'Participantes' },
  { test: (p) => p.startsWith('/historial'), title: 'Historial' },
  { test: (p) => p.startsWith('/balance'), title: 'Balance' },
  { test: (p) => p.startsWith('/reportes'), title: 'Reportes' },
  { test: (p) => p.startsWith('/perfil'), title: 'Perfil' },
  { test: (p) => p.startsWith('/configuracion'), title: 'Configuración' },
];

export default function AppShell() {
  const { trip, dark, setDark, currentUserId, setCurrentUserId } = useTripData();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const isPrimary = PRIMARY_PATHS.some((p) => pathname === p);
  const title = TITLES.find((t) => t.test(pathname))?.title || 'Gastos Compartidos';

  return (
    <div className="gc-app">
      <aside className="gc-sidebar">
        <div className="gc-sidebar-brand">
          <span className="gc-sidebar-dot" />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19 }}>{trip?.name}</span>
        </div>
        <div className="field" style={{ marginBottom: 'var(--space-4)' }}>
          <label style={{ fontSize: 11 }}>Yo soy</label>
          <select className="input" value={currentUserId || ''} onChange={(e) => setCurrentUserId(Number(e.target.value))}>
            {trip?.participants.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <NavLink to="/gastos/nuevo" className="btn btn-primary btn-block" style={{ marginBottom: 'var(--space-4)' }}>
          <PlusIcon size={14} />Registrar gasto
        </NavLink>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SIDEBAR_ITEMS.map(({ path, label, Icon }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `gc-navbtn${isActive ? ' active' : ''}`}>
              <Icon /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" className="btn btn-secondary btn-icon" onClick={() => setDark(!dark)} aria-label="Tema">
            {dark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
          <span className="tag tag-outline">{trip?.currency}</span>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header className="gc-mobile-header">
          {!isPrimary && (
            <button type="button" className="btn btn-ghost btn-icon" onClick={() => navigate(-1)} aria-label="Volver">
              <BackIcon size={18} />
            </button>
          )}
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17, flex: 1 }}>{title}</span>
          <select
            className="input"
            style={{ width: 'auto', maxWidth: 96, fontSize: 12, padding: '4px 6px' }}
            value={currentUserId || ''}
            onChange={(e) => setCurrentUserId(Number(e.target.value))}
            aria-label="Yo soy"
          >
            {trip?.participants.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button type="button" className="btn btn-ghost btn-icon" onClick={() => setDark(!dark)} aria-label="Tema">
            {dark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
        </header>

        <main className="gc-main gc-scroll">
          <Outlet />
        </main>

        <nav className="gc-bottom-nav">
          {BOTTOM_NAV_ITEMS.map(({ path, label, Icon }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `gc-navbtn${isActive ? ' active' : ''}`} style={{ flex: 1 }}>
              <Icon size={20} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
