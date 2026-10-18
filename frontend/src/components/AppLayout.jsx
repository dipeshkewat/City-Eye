import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, FileText, Camera, ClipboardList, MapPin, BarChart3,
  LogOut, Search, Bell, RotateCcw, Sun, Moon, ChevronRight, ShieldCheck
} from 'lucide-react';
import CityEyeLogo from './CityEyeLogo';

const ROLE_NAV = {
  officer: {
    title: 'Review Officer',
    links: [
      { to: '/officer', icon: LayoutDashboard, label: 'Dashboard Overview', end: true },
      { to: '/officer/reports', icon: FileText, label: 'Incident Reports' },
      { to: '/officer/cameras', icon: Camera, label: 'CCTV Cameras' },
    ],
  },
  work_team: {
    title: 'Field Operations',
    links: [
      { to: '/workteam', icon: LayoutDashboard, label: 'Work Orders', end: true },
      { to: '/workteam/assignments', icon: ClipboardList, label: 'Field Assignments' },
    ],
  },
  senior_officer: {
    title: 'Executive Oversight',
    links: [
      { to: '/senior', icon: LayoutDashboard, label: 'System Overview', end: true },
      { to: '/senior/map', icon: MapPin, label: 'Geospatial Map' },
      { to: '/senior/reports', icon: FileText, label: 'Master Registry' },
      { to: '/senior/analytics', icon: BarChart3, label: 'Performance Analytics' },
    ],
  },
};

export default function AppLayout() {
  const { user, login, logout } = useAuth();
  const { resetData } = useReports();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const currentNav = ROLE_NAV[user?.role || 'officer'] || ROLE_NAV.officer;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFastSwitch = async (role) => {
    const creds = {
      officer: { email: 'officer@cityeye.gov', pass: 'officer123', path: '/officer' },
      work_team: { email: 'vikram@cityeye.gov', pass: 'workteam123', path: '/workteam' },
      senior_officer: { email: 'senior@cityeye.gov', pass: 'senior123', path: '/senior' }
    }[role];

    if (creds) {
      await login(creds.email, creds.pass);
      navigate(creds.path);
    }
  };

  const getInitials = (name) =>
    (name || 'User').split(' ').map((n) => n[0]).join('').toUpperCase();

  const formatRole = (role) =>
    (role || 'officer').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="sidebar-app-layout">
      {/* FULL LEFT SIDEBAR WITH ALL NAVIGATIONS */}
      <aside className="main-sidebar">
        {/* Sidebar Brand Header */}
        <div className="sidebar-brand-box">
          <div className="brand-icon"><CityEyeLogo size={36} /></div>
          <div>
            <div className="brand-name">CityEye</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-aquamarine)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Municipal AI
            </div>
          </div>
        </div>

        {/* 1-Click Role Switcher inside Sidebar */}
        <div className="sidebar-role-selector">
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Switch Portal Role
          </div>
          <div className="segmented-pill-control" style={{ width: '100%', display: 'flex' }}>
            <button
              className={`segmented-pill-btn ${user?.role === 'officer' ? 'active' : ''}`}
              style={{ flex: 1, padding: '6px 0', fontSize: 11 }}
              onClick={() => handleFastSwitch('officer')}
            >
              Officer
            </button>
            <button
              className={`segmented-pill-btn ${user?.role === 'work_team' ? 'active' : ''}`}
              style={{ flex: 1, padding: '6px 0', fontSize: 11 }}
              onClick={() => handleFastSwitch('work_team')}
            >
              Crew
            </button>
            <button
              className={`segmented-pill-btn ${user?.role === 'senior_officer' ? 'active' : ''}`}
              style={{ flex: 1, padding: '6px 0', fontSize: 11 }}
              onClick={() => handleFastSwitch('senior_officer')}
            >
              Senior
            </button>
          </div>
        </div>

        {/* All Navigation Links Only in Sidebar */}
        <nav className="sidebar-nav-container">
          <div className="sidebar-nav-section-title">
            {currentNav.title} Navigation
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {currentNav.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `sidebar-nav-link${isActive ? ' active' : ''}`
                }
              >
                <div className="nav-link-icon-box">
                  <link.icon size={18} />
                </div>
                <span className="nav-link-text">{link.label}</span>
                <ChevronRight size={14} className="nav-link-chevron" />
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="sidebar-bottom-actions">
          <button
            className="sidebar-action-btn"
            onClick={resetData}
            title="Reset Mock Demo Data"
          >
            <RotateCcw size={15} />
            <span>Reset Demo Data</span>
          </button>

          {/* User Info & Logout */}
          <div className="sidebar-user-card">
            <div className="user-avatar-circle">{getInitials(user?.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Officer'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {formatRole(user?.role)}
              </div>
            </div>
            <button
              className="icon-btn-circle"
              style={{ width: 32, height: 32, border: 'none', background: 'transparent' }}
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut size={16} color="var(--color-text-muted)" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT WITH TOPBAR (NO DUPLICATE NAVS) */}
      <div className="main-viewport-wrapper">
        {/* Top Header Bar (Only Utilities: Title/Breadcrumb, Dark Mode, Notifications) */}
        <header className="topbar-utility-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>Portal</span>
            <ChevronRight size={14} color="#94A3B8" />
            <span style={{ fontSize: 13, color: 'var(--color-navy)', fontWeight: 700 }}>
              {currentNav.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Dark Mode Button */}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color="#0B2545" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              className="icon-btn-circle"
              title="Search Reports"
              onClick={() => navigate(user?.role === 'officer' ? '/officer/reports' : '/senior/reports')}
            >
              <Search size={16} />
            </button>

            <button className="icon-btn-circle" title="Notifications" style={{ position: 'relative' }}>
              <Bell size={16} />
              <span style={{ position: 'absolute', top: 9, right: 9, width: 7, height: 7, background: '#DC2626', borderRadius: '50%' }} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

