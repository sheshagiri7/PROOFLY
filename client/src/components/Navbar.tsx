import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  ShieldCheck, 
  Briefcase, 
  FlaskConical, 
  Layers, 
  Bell, 
  User as UserIcon, 
  ChevronDown, 
  Sparkles, 
  CheckCheck,
  Building2,
  Lock,
  LogOut,
  ExternalLink
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, switchPersona, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifsMenu, setShowNotifsMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070B14]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-wider text-white">PROOFLY</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  EVIDENCE-FIRST
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block -mt-0.5 font-medium">
                Don’t just rank candidates. Prove why.
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {user?.role === 'CANDIDATE' && (
              <Link
                to="/candidate"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/candidate')
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                My Dashboard
              </Link>
            )}

            {user?.role === 'RECRUITER' && (
              <Link
                to="/recruiter"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/recruiter')
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                Recruiter Portal
              </Link>
            )}

            <Link
              to="/jobs"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive('/jobs')
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Briefcase className="w-4 h-4 text-slate-400" />
              Jobs & Requirements
            </Link>

            <Link
              to="/lab"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive('/lab')
                  ? 'bg-purple-600/15 text-purple-400 border border-purple-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-purple-400" />
              Parser Reliability Lab
            </Link>

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                Admin Telemetry
              </Link>
            )}
          </nav>
        </div>

        {/* Right Menu Controls */}
        <div className="flex items-center gap-3">
          {/* Persona Switcher for Hackathon Live Demo */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 transition-all shadow-sm"
              title="Switch demo role instantly"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-slate-400">Demo Persona:</span>
              <span className="font-semibold text-white">
                {user?.role === 'RECRUITER' ? 'Recruiter Elena' : user?.role === 'ADMIN' ? 'System Admin' : 'Candidate Alex'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showPersonaMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Demo Switcher
                  </p>
                </div>
                <button
                  onClick={() => {
                    switchPersona('recruiter');
                    setShowPersonaMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200"
                >
                  <div>
                    <p className="font-medium text-white">Elena Rostova (Recruiter)</p>
                    <p className="text-[11px] text-slate-400">Synthetix Cloud Labs</p>
                  </div>
                  {user?.role === 'RECRUITER' && <CheckCheck className="w-4 h-4 text-blue-400" />}
                </button>
                <button
                  onClick={() => {
                    switchPersona('candidate');
                    setShowPersonaMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200"
                >
                  <div>
                    <p className="font-medium text-white">Alex Rivera (Candidate)</p>
                    <p className="text-[11px] text-slate-400">Senior Backend Engineer (87% Match)</p>
                  </div>
                  {user?.role === 'CANDIDATE' && <CheckCheck className="w-4 h-4 text-blue-400" />}
                </button>
                <button
                  onClick={() => {
                    switchPersona('admin');
                    setShowPersonaMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-xs flex items-center justify-between text-slate-200"
                >
                  <div>
                    <p className="font-medium text-white">System Admin</p>
                    <p className="text-[11px] text-slate-400">Telemetry & Audit Logs</p>
                  </div>
                  {user?.role === 'ADMIN' && <CheckCheck className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifsMenu(!showNotifsMenu)}
              className="relative p-2 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifsMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-white">Live Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 my-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 text-xs hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors ${
                          n.read === 0 ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-200">{n.title}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-300">
              {user?.name?.charAt(0) || 'P'}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-medium text-white leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-mono capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
