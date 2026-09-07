import React, { useState } from 'react';
import { X, Send, Check } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';

interface QuickDoubtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickDoubtModal: React.FC<QuickDoubtModalProps> = ({ isOpen, onClose }) => {
  const { currentSession, addDoubt } = useSessionStore();
  const { user, profile } = useAuthStore();
  const [doubtText, setDoubtText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState('Syntax & Errors');

  if (!isOpen) return null;

  const categories = ['Syntax & Errors', 'Pointers & Memory', 'Loops & Logic', 'GCC Flags'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim() || !currentSession) return;

    if (!user) {
      alert('Please sign in or create an account to post a question to the instructor queue.');
      return;
    }

    addDoubt({
      id: `doubt-${Date.now()}`,
      session_id: currentSession.id,
      student_id: user.id,
      student_name: profile?.name || user.email?.split('@')[0] || 'Student',
      student_avatar: profile?.avatar_url || undefined,
      message: `[${category}] ${doubtText.trim()}`,
      status: 'open',
      created_at: new Date().toISOString(),
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDoubtText('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-[32px] p-6 shadow-2xl border border-slate-200/90 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">Ask Live Doubt</h3>
            <p className="text-xs text-slate-400">Pushed immediately to instructor queue</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  category === c
                    ? 'bg-slate-950 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Doubt Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
              Your Doubt
            </label>
            <textarea
              rows={4}
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              placeholder="Ask your question clearly. The instructor will see this in their live queue..."
              className="w-full p-3.5 text-xs rounded-2xl border border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none resize-none bg-slate-50/70 text-slate-800 placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitted || !doubtText.trim()}
            className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitted ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Doubt Pushed to Instructor!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Live Queue</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
