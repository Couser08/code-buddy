import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types/database';
import { ADMIN_EMAIL } from '../lib/constants';

interface AuthState {
  user: any | null;
  profile: Profile | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  role: 'student',
  isAdmin: false,
  isLoading: true,
  isConfigured: isSupabaseConfigured,

  initialize: async () => {
    try {
      set({ isLoading: true });

      if (!isSupabaseConfigured) {
        // No fake login if Supabase is unconfigured
        set({
          user: null,
          profile: null,
          role: 'student',
          isAdmin: false,
          isLoading: false,
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userEmail = session.user.email?.toLowerCase() || '';
        const isStrictAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const role: UserRole = isStrictAdmin ? 'admin' : (profile?.role || 'student');

        set({
          user: session.user,
          profile: profile || {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
            role,
            created_at: new Date().toISOString(),
          },
          role,
          isAdmin: isStrictAdmin,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          profile: null,
          role: 'student',
          isAdmin: false,
          isLoading: false,
        });
      }

      // Listen to auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const userEmail = session.user.email?.toLowerCase() || '';
          const isStrictAdmin = userEmail === ADMIN_EMAIL.toLowerCase();

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const role: UserRole = isStrictAdmin ? 'admin' : (profile?.role || 'student');

          set({
            user: session.user,
            profile: profile || {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
              role,
              created_at: new Date().toISOString(),
            },
            role,
            isAdmin: isStrictAdmin,
            isLoading: false,
          });
        } else {
          set({
            user: null,
            profile: null,
            role: 'student',
            isAdmin: false,
            isLoading: false,
          });
        }
      });
    } catch (err) {
      console.error('Error initializing auth:', err);
      set({ isLoading: false, user: null, profile: null, isAdmin: false });
    }
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({
      user: null,
      profile: null,
      role: 'student',
      isAdmin: false,
    });
  },
}));
