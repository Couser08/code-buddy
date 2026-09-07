import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { ADMIN_EMAIL } from '../../lib/constants';
import { X, Mail, Lock, User, Shield, CheckCircle, AlertCircle, LogOut, ArrowRight, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'profile';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const { user, profile, isAdmin, signOut, initialize } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup' | 'profile'>(
    user ? 'profile' : initialMode
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setMode('profile');
      setName(profile?.name || '');
    } else {
      setMode('signin');
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [user, profile, isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!isSupabaseConfigured) {
        setErrorMsg('Please configure your Supabase URL and Anon Key in .env to use live authentication.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        setSuccessMsg('Successfully signed in!');
        await initialize();
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!isSupabaseConfigured) {
        setErrorMsg('Please configure your Supabase URL and Anon Key in .env to use live authentication.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim() || splitEmail(email),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        setSuccessMsg('Account created and signed in successfully!');
        await initialize();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setSuccessMsg('Account created successfully! If email confirmation is required, please check your inbox.');
        setTimeout(() => {
          setMode('signin');
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user.id);

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Profile updated successfully!');
        await initialize();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  const splitEmail = (val: string) => val.split('@')[0] || 'Student';

  const fillAdminCredentials = () => {
    setEmail(ADMIN_EMAIL);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-[32px] p-7 shadow-2xl border border-slate-200/90 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              {mode === 'profile'
                ? 'Your Account Profile'
                : mode === 'signup'
                ? 'Create CodeClass Account'
                : 'Sign In to CodeClass'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'profile'
                ? 'Manage your live classroom credentials'
                : 'Enter your credentials to access live code sessions'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* PROFILE MODE */}
        {mode === 'profile' ? (
          <div className="space-y-5">
            {/* Avatar & Role Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                {profile?.name ? profile.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'U'}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-base">{profile?.name || user?.email?.split('@')[0] || 'User'}</h4>
                <p className="text-xs text-slate-400 font-mono">{user?.email || profile?.email}</p>

                <div className="mt-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                      isAdmin
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {isAdmin ? <Shield className="w-3 h-3 text-purple-700" /> : <User className="w-3 h-3 text-emerald-600" />}
                    <span>{isAdmin ? 'Admin / Instructor' : 'Enrolled Student'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Editable Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                {loading ? 'Saving...' : 'Update Name'}
              </button>

              <button
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* SIGN IN / SIGN UP FORM */
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Tungariya"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={fillAdminCredentials}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                  >
                    Quick fill: Admin Email
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>{loading ? 'Processing...' : mode === 'signin' ? 'Sign In to Account' : 'Create Student Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

              {/* Mode Switcher */}
              <div className="text-center pt-2 text-xs text-slate-500 space-y-2">
                {mode === 'signin' ? (
                  <p>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setErrorMsg(null);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setErrorMsg(null);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
                  >
                    Continue as Guest / Explore Playground &rarr;
                  </button>
                </div>
              </div>
            </form>
        )}
      </div>
    </div>
  );
};
