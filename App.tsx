import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { getCurrentUser, logout } from './services/storage';
import Auth from './components/Auth';
import ManufacturerView from './components/ManufacturerView';
import SellerView from './components/SellerView';
import BuyerView from './components/BuyerView';
import ProfileModal from './components/ProfileModal';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowProfile(false);
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center text-slate-500">Loading...</div>;

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.MANUFACTURER:
        return <ManufacturerView user={user} />;
      case UserRole.SELLER:
        return <SellerView user={user} />;
      case UserRole.BUYER:
        return <BuyerView user={user} />;
      default:
        return <div>Unknown Role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">C</div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">ChainTrack</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              {user.role} Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
            >
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{user.name}</span>
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100"
              title="Log Out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {renderDashboard()}
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfile(false)} 
          onUpdate={(updatedUser) => setUser(updatedUser)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;