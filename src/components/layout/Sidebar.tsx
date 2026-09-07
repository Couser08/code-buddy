import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Video,
  FileCode2,
  Code2,
  CheckSquare,
  HelpCircle,
  Users,
  FolderGit2,
  ArrowUpRight,
  MoreVertical,
  LogOut,
  LogIn,
  User
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';

interface SidebarProps {
  onOpenQuickDoubt?: () => void;
  onOpenAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQuickDoubt, onOpenAuth }) => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuthStore();
  const { doubts } = useSessionStore();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const openDoubtsCount = doubts.filter((d) => d.status === 'open').length;

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Live Class', href: '/live', icon: Video, badge: 'LIVE', badgeColor: 'bg-red-500 text-white' },
    { name: 'C Playground', href: '/playground', icon: Code2, badge: 'Free IDE', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { name: 'Tasks', href: '/tasks', icon: FileCode2 },
    { name: 'Submissions', href: '/submissions', icon: CheckSquare },
    { name: 'Doubts', href: '/doubts', icon: HelpCircle, badge: openDoubtsCount || 3 },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Resources', href: '/resources', icon: FolderGit2 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-5 select-none shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group mb-8 px-2"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            C/
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
              CodeClass
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Learn • Code • Grow
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-blue-600' : 'text-slate-500'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          item.badgeColor || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        {/* "Practice in Playground" Widget Card */}
        <div 
          onClick={() => navigate('/playground')}
          className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-blue-100/70 transition-colors group"
        >
          <div>
            <h4 className="text-xs font-bold text-blue-950 leading-snug">
              C Sandbox IDE
            </h4>
            <p className="text-[11px] text-blue-600/90 leading-tight mt-0.5">
              Practice C code with stdin & GCC.
            </p>
          </div>
          <div className="w-7 h-7 rounded-full bg-white border border-blue-200 flex items-center justify-center text-blue-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 shadow-xs">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* User Profile Bar / Sign In Prompt */}
        {user ? (
          <div className="relative">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/70 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {profile?.name ? profile.name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {profile?.name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    <p className="text-xs text-slate-500 capitalize">
                      {isAdmin ? 'Teacher (Admin)' : 'Student'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors cursor-pointer"
                title="Account Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Role & Account Menu */}
            {showRoleMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-slate-900">Signed in as</p>
                  <p className="text-xs text-slate-500 truncate">{user.email || profile?.email}</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isAdmin ? 'Admin • Instructor' : 'Student'}
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  {onOpenAuth && (
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setShowRoleMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50/50 hover:bg-blue-50 rounded-lg transition-colors mb-1 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Manage Profile</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      signOut();
                      setShowRoleMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">Not Logged In</p>
                <p className="text-[10px] text-slate-400">Join to ask doubts & submit</p>
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
