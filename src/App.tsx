import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { LiveClassPage } from './pages/LiveClassPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { TasksPage } from './pages/TasksPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { DoubtsPage } from './pages/DoubtsPage';
import { StudentsPage } from './pages/StudentsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { QuickDoubtModal } from './components/common/QuickDoubtModal';
import { AuthModal } from './components/auth/AuthModal';
import { useAuthStore } from './stores/authStore';

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
        </main>
      </div>

      {/* Global Quick Doubt Modal */}
      <QuickDoubtModal isOpen={quickDoubtOpen} onClose={() => setQuickDoubtOpen(false)} />

      {/* Proper Supabase Sign In / Sign Up Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};
