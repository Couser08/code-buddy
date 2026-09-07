import React from 'react';
import { Search, Bell, ChevronDown, Code2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface NavbarProps {
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, profile, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-18 px-8 flex items-center justify-between border-b border-slate-200/60 bg-[#F8F9FA]/80 backdrop-blur-md sticky top-0 z-30">
      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search sessions, tasks, or C topics..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#F1F5F9]/80 hover:bg-[#E2E8F0]/60 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-2xl border border-transparent focus:border-blue-500/40 focus:ring-3 focus:ring-blue-500/10 focus:outline-none transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Link to C Playground */}
        <button
          onClick={() => navigate('/playground')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5 text-blue-600" />
          <span>C Sandbox</span>
        </button>

        {/* Notification Bell */}
        <button 
          className="relative p-2.5 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Pill / Profile / Sign In Trigger */}
        {user ? (
          <div 
            onClick={onOpenAuth}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-full shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
            title="Manage Profile & Account"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {profile?.name ? profile.name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <span className="text-sm font-semibold text-slate-800">
              {profile?.name || user.email?.split('@')[0] || 'Account'}
            </span>
            {isAdmin && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                Admin
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
