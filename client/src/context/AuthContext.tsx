import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchPersona: (persona: 'candidate' | 'recruiter' | 'admin' | 'candidate_sarah' | 'candidate_marcus') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('proofly_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const data = await api.getMe();
      if (data && data.user) {
        setUser(data.user);
      } else {
        // Auto demo fallback
        await switchPersona('recruiter');
      }
    } catch (err) {
      console.warn('Session refresh error, loading default persona');
      await switchPersona('recruiter');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('proofly_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('proofly_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('proofly_token');
    setToken(null);
    setUser(null);
  };

  const switchPersona = async (persona: 'candidate' | 'recruiter' | 'admin' | 'candidate_sarah' | 'candidate_marcus') => {
    try {
      const res = await api.switchPersona(persona);
      localStorage.setItem('proofly_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      console.error('Failed to switch persona:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchPersona, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
