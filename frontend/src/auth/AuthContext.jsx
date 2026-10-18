import { createContext, useContext, useState, useCallback } from 'react';
import { DEMO_CREDENTIALS } from '../data/mockData';
import { apiLogin } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cityeye_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);

    try {
      // 1. Try real backend login
      const data = await apiLogin(email, password);
      localStorage.setItem('cityeye_user', JSON.stringify(data.user));
      localStorage.setItem('cityeye_token', data.access_token);
      setUser(data.user);
      setIsLoading(false);
      return data.user;
    } catch (err) {
      // 2. Graceful fallback to demo credentials if backend has network issue
      const account = DEMO_CREDENTIALS[email];
      if (account && account.password === password) {
        const userData = account.user;
        localStorage.setItem('cityeye_user', JSON.stringify(userData));
        localStorage.setItem('cityeye_token', `mock-jwt-${userData.role}-${Date.now()}`);
        setUser(userData);
        setIsLoading(false);
        return userData;
      }
      setIsLoading(false);
      throw new Error(err.message || 'Invalid email or password');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cityeye_user');
    localStorage.removeItem('cityeye_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
