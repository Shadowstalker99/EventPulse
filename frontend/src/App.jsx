import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>

          {/* College Campus Footer */}
          <footer className="bg-white border-t border-slate-100 py-10 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  ⚡
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">EventPulse Campus</p>
                  <p className="text-xs text-slate-500">Official Student Body Event & Ticket Booking System</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
                <Link to="/" className="hover:text-blue-600 transition">Campus Events</Link>
                <Link to="/dashboard" className="hover:text-blue-600 transition">Student Passes</Link>
                <Link to="/login" className="hover:text-blue-600 transition">Portal Login</Link>
                <a href="#rules" className="hover:text-blue-600 transition">Campus Code of Conduct</a>
              </div>

              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} EventPulse. Built for Campus Life.
              </p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
