import React, { useState } from 'react';
import { MessageSquarePlus, CheckCircle2, MessageCircle, Clock, Check, Send } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';
import { Doubt } from '../../types/database';

interface DoubtQueuePanelProps {
  onOpenAskModal?: () => void;
  onBroadcastDoubtEvent?: (doubt: Doubt, action: 'created' | 'resolved' | 'replied') => void;
}

export const DoubtQueuePanel: React.FC<DoubtQueuePanelProps> = ({
  onOpenAskModal,
  onBroadcastDoubtEvent,
}) => {
  const { doubts, resolveDoubt } = useSessionStore();
  const { isAdmin } = useAuthStore();
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Unresolved doubts first, sorted by created_at
  const sortedDoubts = [...doubts].sort((a, b) => {
    if (a.status === 'open' && b.status === 'resolved') return -1;
    if (a.status === 'resolved' && b.status === 'open') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleResolve = (doubt: Doubt) => {
    const replyText = replyInputs[doubt.id] || doubt.admin_reply || 'Resolved by Instructor';
    resolveDoubt(doubt.id, replyText);
    if (onBroadcastDoubtEvent) {
      onBroadcastDoubtEvent({ ...doubt, status: 'resolved', admin_reply: replyText }, 'resolved');
    }
    setActiveReplyId(null);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Live Doubts Queue</h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              {doubts.filter((d) => d.status === 'open').length} Open
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin ? 'Process questions one-by-one while teaching' : 'Ask questions directly to the instructor'}
          </p>
        </div>

        {onOpenAskModal && (
          <button
            onClick={onOpenAskModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        )}
      </div>

      {/* Doubts List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[600px]">
        {sortedDoubts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center space-y-2">
            <MessageCircle className="w-8 h-8 opacity-40" />
            <p className="text-xs">No questions in the queue right now.</p>
          </div>
        ) : (
          sortedDoubts.map((doubt) => {
            const isOpen = doubt.status === 'open';
            return (
              <div
                key={doubt.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isOpen
                    ? 'bg-white border-blue-200/80 shadow-xs ring-1 ring-blue-500/10'
                    : 'bg-slate-50/70 border-slate-200/60 opacity-90'
                }`}
              >
                {/* Author & Timestamp */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={doubt.student_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={doubt.student_name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        {doubt.student_name}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isOpen
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isOpen ? 'Unresolved' : 'Resolved'}
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {doubt.message}
                </p>

                {/* Existing Reply */}
                {doubt.admin_reply && (
                  <div className="mt-2.5 p-2.5 bg-blue-50/80 rounded-xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                    <span className="font-bold block text-blue-700 mb-0.5">Instructor Reply:</span>
                    {doubt.admin_reply}
                  </div>
                )}

                {/* Teacher Action Controls */}
                {isAdmin && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    {activeReplyId === doubt.id ? (
                      <div className="w-full space-y-2">
                        <input
                          type="text"
                          placeholder="Type instructor reply..."
                          value={replyInputs[doubt.id] || ''}
                          onChange={(e) =>
                            setReplyInputs({ ...replyInputs, [doubt.id]: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActiveReplyId(null)}
                            className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleResolve(doubt)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Reply & Resolve</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setActiveReplyId(doubt.id)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          {doubt.admin_reply ? 'Edit Reply' : 'Reply Inline'}
                        </button>

                        {isOpen && (
                          <button
                            onClick={() => handleResolve(doubt)}
                            className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Mark Resolved</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
