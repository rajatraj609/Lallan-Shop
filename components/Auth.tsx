import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { saveUser, findUserByEmail, login, generateId } from '../services/storage';
import PasswordStrength from './PasswordStrength';

interface Props {
  onLogin: (user: User) => void;
}

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.MANUFACTURER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for signup
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isLogin) {
      const user = findUserByEmail(email);
      if (user && user.password === password) { // Simple mock password check
        login(user);
        onLogin(user);
      } else {
        setError('Invalid email or password');
      }
    } else {
      if (!isPasswordValid) {
        setError('Password does not meet strength requirements.');
        return;
      }
      if (findUserByEmail(email)) {
        setError('Email already registered');
        return;
      }

      const newUser: User = {
        id: generateId(),
        email,
        password,
        role,
        name
      };

      saveUser(newUser);
      
      // Redirect to login instead of auto-login
      setIsLogin(true);
      setSuccessMsg('Registration successful! Please log in.');
      setPassword(''); // Clear password for security
      // Keep email populated for convenience
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-6 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">ChainTrack</h1>
          <p className="text-indigo-100 text-sm">Supply Chain Verification System</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="flex justify-center mb-6 bg-slate-700 p-1 rounded-lg">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-slate-600 shadow text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-slate-600 shadow text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition placeholder-slate-400"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">I am a</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(UserRole).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 text-xs font-medium border rounded-lg transition-colors ${role === r ? 'bg-indigo-900/50 border-indigo-500 text-indigo-300' : 'border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition placeholder-slate-400"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition placeholder-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!isLogin && (
                <PasswordStrength 
                  password={password} 
                  onValidationChange={setIsPasswordValid} 
                />
              )}
            </div>

            {error && <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-900/50 p-2 rounded">{error}</p>}
            {successMsg && <p className="text-green-400 text-sm text-center bg-green-900/20 border border-green-900/50 p-2 rounded">{successMsg}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-900/50 transition-all transform active:scale-95"
            >
              {isLogin ? 'Access Account' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;