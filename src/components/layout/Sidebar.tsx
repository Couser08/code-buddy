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
  User,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('codeclass_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('codeclass_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const openDoubtsCount = doubts.filter((d) => d.status === 'open').length;

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Live Class', href: '/live', icon: Video, badge: 'LIVE', badgeColor: 'bg-red-500 text-white' },
    { name: 'Visual Memory Lab', href: '/visualizer', icon: BrainCircuit, badge: 'Visual Lab', badgeColor: 'bg-purple-100 text-purple-800 font-bold' },
    { name: 'C Playground', href: '/playground', icon: Code2, badge: 'Free IDE', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { name: 'Tasks', href: '/tasks', icon: FileCode2 },
    { name: 'Submissions', href: '/submissions', icon: CheckSquare },
    { name: 'Doubts', href: '/doubts', icon: HelpCircle, badge: openDoubtsCount || 3 },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Resources', href: '/resources', icon: FolderGit2 },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200/80 flex flex-col justify-between select-none shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20 p-3' : 'w-64 p-5'
      }`}
    >
      {/* Brand Header & Toggle */}
      <div>
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2 mb-6' : 'justify-between mb-7 px-2'}`}>
          <div
            onClick={() => navigate('/')}
            className={`flex items-center gap-3 cursor-pointer group ${isCollapsed ? 'justify-center' : ''}`}
            title="CodeClass Home"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform shrink-0">
              C/
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                  CodeClass
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Learn • Code • Grow
                </p>
              </div>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 shrink-0"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `relative flex items-center transition-all ${
                    isCollapsed
                      ? 'justify-center p-3 rounded-xl'
                      : 'justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium'
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <Icon
                        className={`w-5 h-5 transition-colors shrink-0 ${
                          isActive ? 'text-blue-600' : 'text-slate-500'
                        }`}
                      />
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>

                    {item.badge !== undefined && (
                      isCollapsed ? (
                        <span
                          className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                            String(item.badgeColor || '').includes('bg-red')
                              ? 'bg-red-500 animate-ping'
                              : 'bg-blue-500'
                          }`}
                        />
                      ) : (
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            item.badgeColor || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        {/* Your Progress Widget */}
        {isCollapsed ? (
          <div
            title="Your progress: 30% (3 / 10 topics completed)"
            className="w-10 h-10 mx-auto rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center cursor-pointer shadow-2xs"
          >
            <span className="text-[10px] font-extrabold text-blue-600 leading-none">30%</span>
            <div className="w-6 bg-slate-200 h-1 rounded-full overflow-hidden mt-1">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '30%' }} />
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Your progress</span>
              <span className="text-blue-600 font-extrabold">30%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: '30%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>3 / 10 topics</span>
              <span className="text-emerald-600 font-bold text-[10px]">● Active</span>
            </div>
          </div>
        )}
        {/* "Practice in Playground" Widget Card */}
        {isCollapsed ? (
          <button
            onClick={() => navigate('/playground')}
            title="C Sandbox IDE - Practice C code with stdin & GCC"
            className="w-10 h-10 mx-auto rounded-xl bg-blue-50/90 border border-blue-200 flex items-center justify-center text-blue-700 hover:bg-blue-100 transition-all cursor-pointer shadow-xs group"
          >
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        ) : (
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
        )}

        {/* User Profile Bar / Sign In Prompt */}
        {user ? (
          <div className="relative">
            {isCollapsed ? (
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                title={`${profile?.name || user.email} (${isAdmin ? 'Teacher' : 'Student'})`}
                className="w-10 h-10 mx-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center text-sm shadow-xs transition-colors cursor-pointer relative"
              >
                {profile?.name ? profile.name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}
                <span
                  className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    isAdmin ? 'bg-emerald-500' : 'bg-blue-400'
                  }`}
                />
              </button>
            ) : (
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
            )}

            {/* Quick Role & Account Menu */}
            {showRoleMenu && (
              <div
                className={`absolute bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 ${
                  isCollapsed ? 'left-0 w-60' : 'left-0 right-0'
                }`}
              >
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
        ) : isCollapsed ? (
          <button
            onClick={onOpenAuth}
            title="Sign In / Sign Up"
            className="w-10 h-10 mx-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
          </button>
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
