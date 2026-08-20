import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, switchPersona } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPersona = async (persona: 'candidate' | 'recruiter' | 'admin') => {
    await switchPersona(persona);
    if (persona === 'candidate') navigate('/candidate');
    else if (persona === 'recruiter') navigate('/recruiter');
    else if (persona === 'admin') navigate('/admin');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-card rounded-3xl p-8 max-w-md w-full border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to PROOFLY</h2>
          <p className="text-xs text-slate-400">
            Access your evidence-first recruitment dashboard.
          </p>
        </div>

        {/* 1-Click Demo Login Bar */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <p className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Instant Hackathon Demo Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoPersona('candidate')}
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-center"
            >
              Candidate
            </button>
            <button
              onClick={() => handleDemoPersona('recruiter')}
              className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-[11px] font-semibold text-blue-300 text-center"
            >
              Recruiter
            </button>
            <button
              onClick={() => handleDemoPersona('admin')}
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex.rivera@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-xs text-center text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
