import React, { useState } from 'react';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      // Make a dummy request to sync user in Django DB
      await api.get('/auth/me/');
      
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">{isRegister ? 'Register' : 'Login'}</h1>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded" 
            required 
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded" 
            required 
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">
          {isRegister ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}
        <button onClick={() => setIsRegister(!isRegister)} className="ml-1 text-blue-600 hover:underline">
          {isRegister ? 'Login here' : 'Register here'}
        </button>
      </p>
    </div>
  );
}

export default Login;
