import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Camera,
  ClipboardList,
  BarChart3,
  MapPin,
  LogOut,
  Sun,
  Moon,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useReports } from '../context/ReportsContext';
import { useTheme } from '../context/ThemeContext';
import CityEyeLogo from './CityEyeLogo';

const ROLE_NAV = {
  officer: {
    title: 'Review Officer',
    links: [
      { to: '/officer', icon: LayoutDashboard, label: 'Dashboard Overview', end: true },
      { to: '/officer/map', icon: MapPin, label: 'Live Incident Map' },
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

  return (
    <div className="app-shell">
      {/* Sidebar Only */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <CityEyeLogo width={36} height={36} />
          <div>
            <div className="brand-name">CITYEYE</div>
            <div className="brand-sub">Municipal AI Vision</div>
          </div>
        </div>

        {/* User profile card */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{currentNav.title}</div>
            {user?.team_name && <div className="sidebar-user-team">{user.team_name}</div>}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">NAVIGATION</div>
          {currentNav.links.map((link) => {
            const Icon = link.icon;
            const isActive = link.end
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive: active }) =>
                  `sidebar-link ${active || isActive ? 'active' : ''}`
                }
                end={link.end}
              >
                <Icon size={18} className="sidebar-link-icon" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Switch Role Fast Bar */}
        <div className="sidebar-role-switcher">
          <div className="sidebar-section-title">SWITCH ROLE</div>
          <div className="role-switch-buttons">
            <button
              className={`role-btn ${user?.role === 'officer' ? 'active' : ''}`}
              onClick={() => handleFastSwitch('officer')}
              title="Review Officer"
            >
              Officer
            </button>
            <button
              className={`role-btn ${user?.role === 'work_team' ? 'active' : ''}`}
              onClick={() => handleFastSwitch('work_team')}
              title="Work Team"
            >
              Crew
            </button>
            <button
              className={`role-btn ${user?.role === 'senior_officer' ? 'active' : ''}`}
              onClick={() => handleFastSwitch('senior_officer')}
              title="Senior Officer"
            >
              Senior
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-actions">
            <button
              className="sidebar-action-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              className="sidebar-action-btn"
              onClick={resetData}
              title="Reset state to initial mock data"
            >
              <RotateCcw size={17} />
              <span>Reset Data</span>
            </button>

            <button
              className="sidebar-action-btn sidebar-logout-btn"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
