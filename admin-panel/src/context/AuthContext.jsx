import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const data = await api.get('/api/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (localStorage.getItem('accessToken')) loadMe();
    else setLoading(false);
  }, []);

  async function login(phone, password) {
    const data = await api.post('/api/auth/login', { phone, password });
    setToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    setCafe(data.cafe || null);
    return data;
  }

  async function register(payload) {
    const data = await api.post('/api/auth/register', payload);
    setToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    setCafe(data.cafe || null);
    return data;
  }

  function logout() {
    setToken(null);
    localStorage.removeItem('refreshToken');
    setUser(null);
    setCafe(null);
  }

  function loginAs(accessToken, impersonatedUser) {
    setToken(accessToken);
    localStorage.removeItem('refreshToken');
    setUser(impersonatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, cafe, loading, login, register, logout, loginAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
