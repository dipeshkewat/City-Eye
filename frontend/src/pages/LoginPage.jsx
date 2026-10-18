import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Eye, Mail, Lock, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

const ROLE_ROUTES = {
  officer: '/officer',
  work_team: '/workteam',
  senior_officer: '/senior',
};

const DEMO_ACCOUNTS = [
  { label: 'Officer Reviewer', email: 'officer@cityeye.gov', password: 'officer123', desc: 'Approve & assign verified complaints' },
  { label: 'Field Work Team', email: 'vikram@cityeye.gov', password: 'workteam123', desc: 'Manage repair tasks & submit proof' },
  { label: 'Senior Oversight', email: 'senior@cityeye.gov', password: 'senior123', desc: 'Geospatial map & system analytics' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(ROLE_ROUTES[user.role] || '/');
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#359B73', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
            <Eye size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.02em' }}>CityEye</h1>
            <div style={{ fontSize: 11, color: '#6EE7B7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Municipal AI Surveillance
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          Sign in to access your municipal infrastructure monitoring portal
        </p>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--color-status-rejected-bg)', border: '1px solid var(--color-status-rejected)', borderRadius: 6, color: '#F87171', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
              OFFICIAL EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
              <input
                className="form-control"
                style={{ paddingLeft: 38 }}
                type="email"
                placeholder="officer@cityeye.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
              <input
                className="form-control"
                style={{ paddingLeft: 38 }}
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
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px 16px', marginTop: 4 }}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Quick Demo Accounts (1-Click Login)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleDemoLogin(acc)}
                type="button"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'var(--color-navy-dark)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#F8FAFC' }}>{acc.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{acc.desc}</div>
                </div>
                <span style={{ fontSize: 11, color: '#6EE7B7', fontWeight: 600 }}>Login &rarr;</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
