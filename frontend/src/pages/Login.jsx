import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [role, setRole] = useState('student'); // 'student' or 'admin'
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setIsRegister(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password);
        navigate('/');
      } else {
        const res = await login(email, password, role);
        if (role === 'admin') {
          navigate('/admin');
        } else {
          // If redirected from a booking attempt, go back or to home
          const destination = location.state?.from?.pathname || '/';
          navigate(destination);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-blue-500/5">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20 text-xl font-bold">
            ⚡
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isRegister
              ? 'Create Student Account'
              : role === 'admin'
              ? 'Faculty & Admin Portal'
              : 'Student Portal Login'}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {isRegister
              ? 'Register with your student email for event passes'
              : role === 'admin'
              ? 'Authorized faculty & event committee access'
              : 'Sign in to reserve passes and view your bookings'}
          </p>
        </div>

        {/* Role Selection Segmented Control */}
        {!isRegister && (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'student'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🎓</span>
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🛡️</span>
              <span>Faculty / Admin</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-600 text-xs font-semibold p-3.5 rounded-xl border border-red-100 mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
              {role === 'admin' ? 'Faculty Email or Username' : 'Campus Email or Username'}
            </label>
            <input 
              type="text" 
              placeholder={role === 'admin' ? 'admin@campus.edu' : 'student@student.edu'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" 
              required 
            />
          </div>

          <div>
            <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
              Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-2 font-bold text-sm py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
              role === 'admin'
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </>
            ) : isRegister ? (
              <span>Register Student Account</span>
            ) : role === 'admin' ? (
              <span>Sign In as Administrator</span>
            ) : (
              <span>Sign In as Student</span>
            )}
          </button>
        </form>

        {/* Footer info & switch between Login / Register */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          {role === 'student' ? (
            <p className="text-xs text-slate-500 font-medium">
              {isRegister ? 'Already registered for campus events?' : "Don't have a student account?"}
              <button 
                onClick={() => { setIsRegister(!isRegister); setError(''); }} 
                className="ml-1.5 text-blue-600 font-bold hover:underline cursor-pointer"
              >
                {isRegister ? 'Sign In here' : 'Register here'}
              </button>
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 font-medium">
              Administrative credentials are authorized by the University IT & Student Council.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
