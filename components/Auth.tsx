import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { saveUser, findUserByEmail, login, generateId, resetPassword } from '../services/storage';
import PasswordStrength from './PasswordStrength';

interface Props {
  onLogin: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'RECOVERY_VERIFY' | 'RECOVERY_RESET';

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // New Fields for Signup & Recovery
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  
  // Reset Password Specifics
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Validation States
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    setSuccessMsg('');
    setAuthMode('LOGIN');
    resetForm();
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setDob('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleRecoveryVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const user = findUserByEmail(email);
    
    // Strict Verification: Check if User exists AND Phone matches AND DOB matches
    if (user && user.phone === phone && user.dob === dob) {
        setSuccessMsg('Identity verified. Please set a new password.');
        setAuthMode('RECOVERY_RESET');
    } else {
        // Generic error for security
        setError('Verification failed. Details do not match our records.');
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!isPasswordValid) {
          setError('New password does not meet strength requirements.');
          return;
      }
      if (newPassword !== confirmNewPassword) {
          setError('Passwords do not match.');
          return;
      }

      const user = findUserByEmail(email);
      if (user) {
          resetPassword(user.id, newPassword);
          setSuccessMsg('Password reset successful. Please login.');
          setAuthMode('LOGIN');
          setPassword(''); // Clear fields
      } else {
          setError('An unexpected error occurred.');
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (authMode === 'LOGIN') {
      const user = findUserByEmail(email);
      if (user && user.password === password) {
        if (selectedRole && user.role !== selectedRole) {
            setError(`Account found, but it is registered as ${user.role}. Please switch portals.`);
            return;
        }
        login(user);
        onLogin(user);
      } else {
        setError('Invalid credentials.');
      }
    } else if (authMode === 'SIGNUP') {
      if (!isPasswordValid) {
        setError('Password strength requirement not met.');
        return;
      }
      if (findUserByEmail(email)) {
        setError('Email already registered.');
        return;
      }

      // Basic Validation for new mandatory fields
      if (!phone || !dob) {
          setError('Phone number and Date of Birth are required.');
          return;
      }

      const newUser: User = {
        id: generateId(),
        email,
        password,
        role: selectedRole!,
        name,
        phone,
        dob
      };

      saveUser(newUser);
      setAuthMode('LOGIN');
      setSuccessMsg('Registration successful. Welcome to Lallan Shop.');
      resetForm();
    }
  };

  const renderHeader = () => {
      switch(authMode) {
          case 'LOGIN': return 'Welcome Back';
          case 'SIGNUP': return 'Join Our Group';
          case 'RECOVERY_VERIFY': return 'Identity Verification';
          case 'RECOVERY_RESET': return 'Reset Credentials';
          default: return '';
      }
  }

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

        {/* Right: Interaction Side */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-black/40">
          
          {!selectedRole ? (
             // --- PORTAL SELECTION VIEW ---
             <div className="animate-in slide-in-from-right-8 duration-500">
                <h2 className="text-2xl font-display font-semibold text-white mb-2">Select Portal</h2>
                <p className="text-neutral-500 text-sm mb-8">Choose your specialized access point.</p>
                
                <div className="space-y-3">
                    <button onClick={() => handleRoleSelect(UserRole.MANUFACTURER)} className="w-full group bg-neutral-900/50 border border-white/5 hover:border-white/20 hover:bg-white/5 p-4 rounded-xl flex items-center gap-4 transition-all">
                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h3 className="text-white font-medium">Manufacturer</h3>
                            <p className="text-xs text-neutral-500">Production & Distribution</p>
                        </div>
                    </button>

                    <button onClick={() => handleRoleSelect(UserRole.SELLER)} className="w-full group bg-neutral-900/50 border border-white/5 hover:border-white/20 hover:bg-white/5 p-4 rounded-xl flex items-center gap-4 transition-all">
                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h3 className="text-white font-medium">Seller</h3>
                            <p className="text-xs text-neutral-500">Retail & Inventory</p>
                        </div>
                    </button>

                     <button onClick={() => handleRoleSelect(UserRole.BUYER)} className="w-full group bg-neutral-900/50 border border-white/5 hover:border-white/20 hover:bg-white/5 p-4 rounded-xl flex items-center gap-4 transition-all">
                        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h3 className="text-white font-medium">Buyer</h3>
                            <p className="text-xs text-neutral-500">Shopping & Orders</p>
                        </div>
                    </button>
                </div>
             </div>
          ) : (
            // --- AUTH & RECOVERY FORM VIEW ---
            <div className="animate-in slide-in-from-right-8 duration-500">
              
              {/* Navigation Back Buttons */}
              <div className="flex justify-between items-center mb-6">
                  <button onClick={() => setSelectedRole(null)} className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition-colors group">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Switch Portal
                  </button>

                  {(authMode === 'RECOVERY_VERIFY' || authMode === 'RECOVERY_RESET') && (
                      <button onClick={() => { setAuthMode('LOGIN'); resetForm(); }} className="text-xs text-neutral-400 hover:text-white transition-colors">
                          Back to Login
                      </button>
                  )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-display font-semibold text-white">
                        {renderHeader()}
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">{selectedRole} Portal</p>
                </div>
                
                {(authMode === 'LOGIN' || authMode === 'SIGNUP') && (
                    <div className="flex bg-neutral-900 rounded-full p-1 border border-white/10">
                    <button
                        onClick={() => { setAuthMode('LOGIN'); setError(''); setSuccessMsg(''); }}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${authMode === 'LOGIN' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setAuthMode('SIGNUP'); setError(''); setSuccessMsg(''); }}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${authMode === 'SIGNUP' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Sign Up
                    </button>
                    </div>
                )}
              </div>

              {/* RECOVERY VERIFICATION FORM */}
              {authMode === 'RECOVERY_VERIFY' && (
                  <form onSubmit={handleRecoveryVerify} className="space-y-5 animate-in fade-in duration-300">
                      <p className="text-sm text-neutral-400">To reset your password, please verify your identity using your registered details.</p>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Registered Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 text-white rounded-xl focus:border-white/40 focus:ring-0 outline-none transition"
                            placeholder="name@lallanshop.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Phone Number</label>
                              <input
                                  type="tel"
                                  required
                                  className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 text-white rounded-xl focus:border-white/40 focus:ring-0 outline-none transition"
                                  placeholder="1234567890"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Date of Birth</label>
                              <input
                                  type="date"
                                  required
                                  className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 text-white rounded-xl focus:border-white/40 focus:ring-0 outline-none transition [color-scheme:dark]"
                                  value={dob}
                                  onChange={(e) => setDob(e.target.value)}
                              />
                          </div>
                      </div>
                      
                      {error && <p className="text-red-400 text-xs text-center py-2 bg-red-900/10 border border-red-500/20 rounded-lg">{error}</p>}
                      
                      <button type="submit" className="w-full py-4 bg-white text-black font-bold font-display rounded-xl hover:bg-neutral-200 transition-all transform active:scale-[0.99] tracking-wide">
                        Verify Identity
                      </button>
                  </form>
              )}

              {/* RECOVERY RESET FORM */}
              {authMode === 'RECOVERY_RESET' && (
                  <form onSubmit={handlePasswordReset} className="space-y-5 animate-in fade-in duration-300">
                      <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl mb-4">
                          <p className="text-emerald-400 text-xs text-center">{successMsg}</p>
                      </div>

                      <div>
                          <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">New Password</label>
                          <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 text-white rounded-xl focus:border-white/40 focus:ring-0 outline-none transition"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <div className="mt-3">
                              <PasswordStrength password={newPassword} onValidationChange={setIsPasswordValid} />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 text-white rounded-xl focus:border-white/40 focus:ring-0 outline-none transition"
                            placeholder="••••••••"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                          />
                      </div>

                      {error && <p className="text-red-400 text-xs text-center py-2 bg-red-900/10 border border-red-500/20 rounded-lg">{error}</p>}

                      <button type="submit" className="w-full py-4 bg-white text-black font-bold font-display rounded-xl hover:bg-neutral-200 transition-all transform active:scale-[0.99] tracking-wide">
                        Reset Password
                      </button>
                  </form>
              )}


              {/* LOGIN & SIGNUP FORMS */}
              {(authMode === 'LOGIN' || authMode === 'SIGNUP') && (
                  <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
                    {authMode === 'SIGNUP' && (
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
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 text-white rounded-xl focus:border-white/40 focus:ring-0 outline-none transition placeholder-neutral-600"
                                    placeholder="123 456 7890"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                             </div>
                             <div>
                                <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-2">Date of Birth</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 text-white rounded-xl focus:border-white/40 focus:ring-0 outline-none transition [color-scheme:dark]"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
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
                      {authMode === 'SIGNUP' ? (
                        <div className="mt-3">
                          <PasswordStrength password={password} onValidationChange={setIsPasswordValid} />
                        </div>
                      ) : (
                          <div className="flex justify-end mt-2">
                              <button 
                                type="button" 
                                onClick={() => { setAuthMode('RECOVERY_VERIFY'); setError(''); setSuccessMsg(''); }}
                                className="text-xs text-neutral-500 hover:text-white transition-colors"
                              >
                                  Forgot Password?
                              </button>
                          </div>
                      )}
                    </div>

                    {error && <p className="text-red-400 text-xs text-center py-2 bg-red-900/10 border border-red-500/20 rounded-lg">{error}</p>}
                    {successMsg && <p className="text-emerald-400 text-xs text-center py-2 bg-emerald-900/10 border border-emerald-500/20 rounded-lg">{successMsg}</p>}

                    <button
                      type="submit"
                      className="w-full py-4 bg-white text-black font-bold font-display rounded-xl hover:bg-neutral-200 transition-all transform active:scale-[0.99] tracking-wide"
                    >
                      {authMode === 'LOGIN' ? `Enter ${selectedRole} Portal` : 'Create Account'}
                    </button>
                  </form>
              )}
            </div>
          )}
          
          <div className="mt-8 text-center">
             <p className="text-xs text-neutral-600">By accessing Lallan Shop, you agree to our Terms of Service.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;