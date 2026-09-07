import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Quote, ArrowRight } from 'lucide-react';

export const SideWidgets: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Inspirational Quote Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-3">
          <span className="text-3xl text-blue-400/80 font-serif leading-none select-none">
            “
          </span>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800 leading-snug">
              A small step in code is a big step in your future.
            </p>
            <p className="text-xs text-slate-400 font-medium italic">
              Keep going.
            </p>
          </div>
        </div>
      </div>

      {/* Curated Resources Dark Card */}
      <div className="bg-[#121214] border border-slate-800 rounded-3xl p-6 shadow-lg text-white space-y-4 relative overflow-hidden group">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-blue-400 font-bold text-lg shadow-inner">
            C
          </div>
          <div>
            <h4 className="font-bold text-white text-base">
              New to C?
            </h4>
            <p className="text-xs text-slate-400 leading-tight">
              Check out our curated resources, notes and examples.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/resources')}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer group-hover:shadow-md"
        >
          <span>Explore Resources</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-700 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
