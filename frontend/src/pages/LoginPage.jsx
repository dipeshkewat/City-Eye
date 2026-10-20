import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Mail,
  Lock,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  Award,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import CityEyeLogo from '../components/CityEyeLogo';

const ROLE_ROUTES = {
  officer: '/officer',
  work_team: '/workteam',
  senior_officer: '/senior',
};

const DEMO_ACCOUNTS = [
  {
    roleKey: 'officer',
    name: 'Ruchika',
    title: 'Review Officer',
    email: 'officer@cityeye.gov',
    password: 'officer123',
    desc: 'Verify AI detections & dispatch municipal complaints',
    icon: ShieldCheck,
    badgeColor: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.15)'
  },
  {
    roleKey: 'senior_officer',
    name: 'Dipesh Kewat',
    title: 'Senior Officer (Oversight)',
    email: 'senior@cityeye.gov',
    password: 'senior123',
    desc: 'Geospatial master map, live telemetry & city analytics',
    icon: Award,
    badgeColor: '#38BDF8',
    badgeBg: 'rgba(56, 189, 248, 0.15)'
  },
  {
    roleKey: 'work_team',
    name: 'Vikram Patil',
    title: 'Field Operations Crew',
    email: 'vikram@cityeye.gov',
    password: 'workteam123',
    desc: 'Manage work orders & upload on-site repair proofs',
    icon: Wrench,
    badgeColor: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.15)'
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(ROLE_ROUTES[user.role] || '/');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    try {
      const user = await login(account.email, account.password);
      navigate(ROLE_ROUTES[user.role] || '/');
    } catch (err) {
      setError(err.message || 'Authentication error.');
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Light / Dark Mode Toggle */}
      <div className="login-theme-toggle">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={15} color="#FBBF24" /> : <Moon size={15} color="#0B2545" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="brand-icon">
            <CityEyeLogo size={28} />
          </div>
          <div>
            <div className="login-brand-name">CityEye</div>
            <div className="login-brand-sub">Municipal AI Surveillance</div>
          </div>
        </div>

        <p className="login-desc">
          Sign in to access your municipal infrastructure monitoring and dispatch portal.
        </p>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--color-status-rejected-bg)',
            border: '1px solid var(--color-status-rejected)',
            borderRadius: 8,
            color: '#EF4444',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label className="login-input-label">Official Email Address</label>
            <div className="login-input-box">
              <Mail size={16} className="login-input-icon" />
              <input
                className="login-input"
                type="email"
                placeholder="officer@cityeye.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label className="login-input-label">Password</label>
            <div className="login-input-box">
              <Lock size={16} className="login-input-icon" />
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* 1-Click Fast Demo Login Section */}
        <div className="login-demo-section">
          <div className="login-demo-title">
            <span>Quick Demo Accounts (1-Click Login)</span>
            <span style={{ fontSize: 10, color: 'var(--color-aquamarine)', fontWeight: 700 }}>Instant Access</span>
          </div>

          <div className="login-demo-grid">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.email}
                  onClick={() => handleDemoLogin(acc)}
                  type="button"
                  className="login-demo-card"
                  title={`Login instantly as ${acc.name} (${acc.title})`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: acc.badgeBg,
                      color: acc.badgeColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={18} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-navy)' }}>
                          {acc.name}
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: acc.badgeColor,
                          background: acc.badgeBg,
                          padding: '1px 6px',
                          borderRadius: 4
                        }}>
                          {acc.title}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {acc.desc}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--color-aquamarine)',
                    whiteSpace: 'nowrap',
                    marginLeft: 8
                  }}>
                    Login →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Stamp */}
        <div className="login-footer-stamp">
          <ShieldAlert size={12} color="var(--color-aquamarine)" />
          <span>Secured Municipal Infrastructure Intelligence • BMC AI Portal</span>
        </div>
      </div>
    </div>
  );
}
