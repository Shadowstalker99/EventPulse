import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition">
              EventPulse
            </span>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase -mt-0.5">
              Campus
            </span>
          </div>
        </Link>

        {/* Dynamic Navigation Links based on Authentication & Role */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`text-sm font-semibold transition ${
              isActive('/') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Events
          </Link>

          <a
            href="/#clubs"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Clubs
          </a>

          {/* Student Pass Link: ONLY visible when logged in as Student */}
          {user && !isAdmin && (
            <Link
              to="/dashboard"
              className={`text-sm font-semibold transition ${
                isActive('/dashboard') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Passes
            </Link>
          )}

          {/* Admin Portal Link: ONLY visible when logged in as Admin */}
          {user && isAdmin && (
            <Link
              to="/admin"
              className={`text-sm font-semibold flex items-center gap-1.5 transition ${
                isActive('/admin') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>

        {/* Right Action: Sign In or User Profile */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-100 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-full">
                <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-blue-600' : 'bg-emerald-500'}`}></span>
                <span className="font-bold text-slate-900">
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-white shadow-2xs">
                  {isAdmin ? 'Faculty/Admin' : 'Student'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-full transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-md shadow-blue-500/20 flex items-center space-x-2 transition"
            >
              <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
