import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { QuickDoubtModal } from './components/common/QuickDoubtModal';
import { AuthModal } from './components/auth/AuthModal';
import { useAuthStore } from './stores/authStore';

// Code-split route components to minimize initial bundle size and speed up FCP/LCP
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const LiveClassPage = lazy(() => import('./pages/LiveClassPage').then((m) => ({ default: m.LiveClassPage })));
const PlaygroundPage = lazy(() => import('./pages/PlaygroundPage').then((m) => ({ default: m.PlaygroundPage })));
const TasksPage = lazy(() => import('./pages/TasksPage').then((m) => ({ default: m.TasksPage })));
const SubmissionsPage = lazy(() => import('./pages/SubmissionsPage').then((m) => ({ default: m.SubmissionsPage })));
const DoubtsPage = lazy(() => import('./pages/DoubtsPage').then((m) => ({ default: m.DoubtsPage })));
const StudentsPage = lazy(() => import('./pages/StudentsPage').then((m) => ({ default: m.StudentsPage })));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage').then((m) => ({ default: m.ResourcesPage })));

const RouteLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[65vh] gap-3 select-none">
    <div className="relative flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      <span className="absolute w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
    </div>
    <span className="text-xs font-semibold text-slate-500 font-mono tracking-wide">Loading module...</span>
  </div>
);

export const App: React.FC = () => {
  const { initialize, user, isLoading } = useAuthStore();
  const [quickDoubtOpen, setQuickDoubtOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [hasPromptedAuth, setHasPromptedAuth] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Automatically show Sign In / Sign Up popup if user is not logged in
  useEffect(() => {
    if (!isLoading && !user && !hasPromptedAuth) {
      setAuthModalOpen(true);
      setHasPromptedAuth(true);
    }
  }, [isLoading, user, hasPromptedAuth]);

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Persistent Left Sidebar */}
      <Sidebar 
        onOpenQuickDoubt={() => setQuickDoubtOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Navbar onOpenAuth={() => setAuthModalOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<HomePage onOpenQuickDoubt={() => setQuickDoubtOpen(true)} />} />
                <Route path="/live" element={<LiveClassPage />} />
                <Route path="/playground" element={<PlaygroundPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/submissions" element={<SubmissionsPage />} />
                <Route path="/doubts" element={<DoubtsPage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                {/* Catch-all fallback for undefined routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Quick Doubt Modal */}
      <QuickDoubtModal isOpen={quickDoubtOpen} onClose={() => setQuickDoubtOpen(false)} />

      {/* Proper Supabase Sign In / Sign Up Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
