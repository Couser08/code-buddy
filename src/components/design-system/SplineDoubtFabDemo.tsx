import React, { useState } from 'react';
import { X, Search, Copy, Check, MessageSquarePlus, Sparkles, Send, Tag } from 'lucide-react';

export const SplineDoubtFabDemo: React.FC = () => {
  const [doubtText, setDoubtText] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Pointers & Memory');
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  const categories = ['Pointers & Memory', 'GCC Compilation', 'Loops & Logic', 'Arrays & Strings'];

  const mentors = [
    { name: 'Rahul (Teacher)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { name: 'Sarah (TA)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { name: 'Alex (Peer)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { name: 'Elena (Peer)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDoubtText('');
    }, 2500);
  };

  const isDark = previewTheme === 'dark';

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Component Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Component 2 • Spline.one Modal / FAB</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Spline-Style Doubt Submission Modal
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Faithful recreation of Image 2 modal cards with avatar circles, pill actions, and light/dark theme switch.
          </p>
        </div>

        {/* Theme Switcher Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setPreviewTheme('light')}
            className={`px-3 py-1 rounded-lg transition-all ${
              !isDark ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Light Card
          </button>
          <button
            onClick={() => setPreviewTheme('dark')}
            className={`px-3 py-1 rounded-lg transition-all ${
              isDark ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Dark Card
          </button>
        </div>
      </div>

      {/* Centered Modal Mockup Display */}
      <div className="flex items-center justify-center p-4 sm:p-8 bg-[#F4F5F7] rounded-3xl">
        <div
          className={`w-full max-w-md rounded-[32px] p-6 shadow-2xl transition-all duration-300 border ${
            isDark
              ? 'bg-[#18181B] text-white border-zinc-800 shadow-zinc-950/40'
              : 'bg-white text-slate-900 border-slate-200/80 shadow-slate-200/60'
          }`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4">
            <h4 className="font-bold text-sm sm:text-base">
              Ask Doubt In Live Session
            </h4>
            <button
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-100 text-slate-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mentors / Active Users Row */}
          <div className="flex items-center gap-2.5 py-3 border-t border-b mb-4"
            style={{ borderColor: isDark ? '#27272A' : '#F1F5F9' }}
          >
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {mentors.map((m, idx) => (
                <div key={idx} className="relative group cursor-pointer shrink-0">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className={`w-9 h-9 rounded-full object-cover border-2 ${
                      isDark ? 'border-zinc-700 hover:border-zinc-400' : 'border-slate-200 hover:border-blue-400'
                    } transition-colors`}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
              ))}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 cursor-pointer ${
                  isDark
                    ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Category Topic Selector */}
          <div className="space-y-2 mb-4">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-400'}`}>
              Topic Tag
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? isDark
                        ? 'bg-white text-zinc-900 font-bold'
                        : 'bg-slate-900 text-white font-bold'
                      : isDark
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-400'}`}>
                Your Question
              </label>
              <textarea
                rows={3}
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                placeholder="E.g., Why do we need the & operator in scanf but not in printf?..."
                className={`w-full p-3 text-xs rounded-2xl border transition-all resize-none focus:outline-none ${
                  isDark
                    ? 'bg-zinc-900/90 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-500'
                    : 'bg-slate-50/80 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400'
                }`}
              />
            </div>

            {/* Quick Share Links List matching Image 2 */}
            <div className="space-y-2 pt-1">
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${isDark ? 'text-zinc-400' : 'text-slate-400'}`}>
                Session Resources
              </span>

              <div
                className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors ${
                  isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-slate-50/60 border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">Live Session Stream Link</p>
                    <p className={`text-[10px] truncate ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                      codeclass.live/session/intro-c
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy('link-1', 'https://codeclass.live/session/intro-c')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all shrink-0 cursor-pointer ${
                    isDark
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {copiedLink === 'link-1' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Action Button Pill */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitted || !doubtText.trim()}
                className={`w-full py-3 px-5 rounded-full text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  isDark
                    ? 'bg-white text-zinc-950 hover:bg-zinc-100 disabled:opacity-50'
                    : 'bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50'
                }`}
              >
                {submitted ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Doubt Pushed to Instructor Queue!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Doubt to Class</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
