import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local storage for existing session
    const savedUser = localStorage.getItem('eventpulse_user');
    const savedToken = localStorage.getItem('eventpulse_token');

    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('eventpulse_user');
        localStorage.removeItem('eventpulse_token');
      }
    }

    // 2. Listen to Firebase auth changes if applicable
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const res = await api.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('eventpulse_user', JSON.stringify(res.data));
        } catch (e) {
          // If token verification with backend fails
        }
      }
      setLoading(false);
    });

    setLoading(false);
    return () => unsubscribe();
  }, []);

  const login = async (email, password, role = 'student') => {
    // 1. First attempt direct backend login (for seeded/custom accounts)
    try {
      const res = await api.post('/auth/login/', { email, password, role });
      const userData = res.data.user;
      const token = res.data.token;

      localStorage.setItem('eventpulse_token', token);
      localStorage.setItem('eventpulse_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (backendErr) {
      // If backend explicitly rejected due to role boundary (403), do not fallback
      if (backendErr.response?.status === 403) {
        throw new Error(backendErr.response?.data?.detail || "Access Denied.");
      }

      // 2. Try Firebase Authentication as fallback
      try {
        const fbRes = await signInWithEmailAndPassword(auth, email, password);
        const meRes = await api.get('/auth/me/');
        const fbUser = meRes.data;

        // Check role boundary if admin was requested
        if (role === 'admin' && !fbUser.is_admin) {
          await signOut(auth);
          throw new Error("Access Denied: This account does not possess Faculty/Administrator privileges.");
        }

        setUser(fbUser);
        localStorage.setItem('eventpulse_user', JSON.stringify(fbUser));
        return { success: true, user: fbUser };
      } catch (fbErr) {
        throw new Error(
          backendErr.response?.data?.detail || fbErr.message || "Invalid credentials."
        );
      }
    }
  };

  const register = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const res = await api.get('/auth/me/');
      setUser(res.data);
      localStorage.setItem('eventpulse_user', JSON.stringify(res.data));
      return { success: true, user: res.data };
    } catch (err) {
      throw new Error(err.message || "Registration failed.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    localStorage.removeItem('eventpulse_token');
    localStorage.removeItem('eventpulse_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAdmin: !!user?.is_admin,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
