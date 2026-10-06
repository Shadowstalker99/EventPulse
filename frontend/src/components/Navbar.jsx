import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">EventPulse</Link>
        <div className="space-x-4">
          <Link to="/" className="text-gray-600 hover:text-blue-600">Events</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">My Bookings</Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
