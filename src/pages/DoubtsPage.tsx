import React, { useState } from 'react';
import { useClassroomStore } from '../stores/classroomStore';
import { useAuthStore } from '../stores/authStore';
import { DoubtQueuePanel } from '../components/live/DoubtQueuePanel';
import { QuickDoubtModal } from '../components/common/QuickDoubtModal';
import { HelpCircle, MessageSquarePlus, Filter, Sparkles } from 'lucide-react';

export const DoubtsPage: React.FC = () => {
  const doubts = useClassroomStore((s) => s.doubts);
  const { isAdmin } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Classroom Q&A Dispatcher</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Live Doubts & Question Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {isAdmin
              ? 'Persisted queue ordered chronologically. Process student doubts one at a time and reply with code explanations.'
              : 'Submit questions in real-time. The instructor can answer during live coding or reply directly inline.'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Ask Live Question</span>
        </button>
      </div>

      {/* Main Doubt Queue Center */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs min-h-[500px]">
        <DoubtQueuePanel onOpenAskModal={() => setIsModalOpen(true)} />
      </div>

      <QuickDoubtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
