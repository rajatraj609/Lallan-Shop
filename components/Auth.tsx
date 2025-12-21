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
  const [name, setName] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isLogin) {
      const user = findUserByEmail(email);
      if (user && user.password === password) {
        login(user);
        onLogin(user);
      } else {
        setError('Invalid credentials.');
      }
    } else {
      if (!isPasswordValid) {
        setError('Password strength requirement not met.');
        return;
      }
      if (findUserByEmail(email)) {
        setError('Email already registered.');
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
      setIsLogin(true);
      setSuccessMsg('Registration successful. Welcome to Lallan Shop.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 shadow-2xl rounded-3xl overflow-hidden border border-white/5 bg-neutral-900/40 backdrop-blur-xl animate-in fade-in zoom-in duration-500 mx-4">
        
        {/* Left: Brand / Artistic Side */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-neutral-900/60 relative">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
           <div className="relative z-10">
             <h1 className="text-5xl font-display font-bold text-white tracking-tight mb-4">Lallan<br/>Shop.</h1>
             <p className="text-neutral-400 text-lg font-light leading-relaxed">
               Curating the exceptional. Bridging the gap between master craftsmanship and discerning collectors.
             </p>
           </div>
           <div className="relative z-10">
             <div className="flex gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-white"></div>
               <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
               <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
             </div>
             <p className="text-xs text-neutral-500 tracking-widest uppercase">Premium Supply Chain</p>
           </div>
        </div>

        {/* Right: Form Side */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-black/40">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-display font-semibold text-white">
              {isLogin ? 'Welcome Back' : 'Join the Atelier'}
            </h2>
            <div className="flex bg-neutral-900 rounded-full p-1 border border-white/10">
              <button
                onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${isLogin ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${!isLogin ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 text-white rounded-xl focus:border-white/40 focus:ring-0 outline-none transition placeholder-neutral-600"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Select Role</label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.values(UserRole).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-3 text-xs font-medium border rounded-xl transition-all duration-300 ${role === r ? 'bg-white text-black border-white' : 'bg-neutral-900/50 border-white/10 text-neutral-400 hover:border-white/30'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 text-white rounded-xl focus:border-white/40 focus:ring-0 outline-none transition placeholder-neutral-600"
                placeholder="name@lallanshop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 text-white rounded-xl focus:border-white/40 focus:ring-0 outline-none transition placeholder-neutral-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!isLogin && (
                <div className="mt-3">
                   <PasswordStrength password={password} onValidationChange={setIsPasswordValid} />
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-xs text-center py-2 bg-red-900/10 border border-red-500/20 rounded-lg">{error}</p>}
            {successMsg && <p className="text-emerald-400 text-xs text-center py-2 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">{successMsg}</p>}

            <button
              type="submit"
              className="w-full py-4 bg-white text-black font-bold font-display rounded-xl hover:bg-neutral-200 transition-all transform active:scale-[0.99] tracking-wide"
            >
              {isLogin ? 'Enter Portal' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
             <p className="text-xs text-neutral-600">By accessing Lallan Shop, you agree to our Terms of Service.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;