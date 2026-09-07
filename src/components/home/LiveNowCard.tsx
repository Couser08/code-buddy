import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';

export const LiveNowCard: React.FC = () => {
  const navigate = useNavigate();
  const currentSession = useClassroomStore((s) => s.currentSession);
  const onlineCount = useClassroomStore((s) => s.onlineCount);

  const studentAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Live Now
          </span>
        </div>

        <button
          onClick={() => navigate('/live')}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-full shadow-xs transition-all cursor-pointer"
        >
          <span>Join</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Embedded Monaco Preview Window */}
      <div 
        onClick={() => navigate('/live')}
        className="bg-[#0B0F19] rounded-2xl p-3.5 border border-slate-800/80 shadow-inner font-mono text-xs cursor-pointer group hover:border-blue-500/50 transition-colors mb-4 overflow-hidden"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400 pl-1.5">#include &lt;stdio.h&gt;</span>
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-bold text-[9px] border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="grid grid-cols-12 gap-2 text-[11px] leading-relaxed text-slate-300">
          <div className="col-span-1 text-slate-600 select-none text-right pr-1 border-r border-slate-800/80">
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
            <div>6</div>
          </div>
          <div className="col-span-11 pl-1">
            <div><span className="text-purple-400">#include</span> <span className="text-emerald-300">&lt;stdio.h&gt;</span></div>
            <div className="text-transparent">.</div>
            <div><span className="text-blue-400">int</span> <span className="text-amber-300">main</span>() &#123;</div>
            <div className="pl-4"><span className="text-blue-300">printf</span>(<span className="text-emerald-300">&quot;Hello, C!\n&quot;</span>);</div>
            <div className="pl-4"><span className="text-purple-400">return</span> <span className="text-blue-400">0</span>;</div>
            <div>&#125;</div>
          </div>
        </div>
      </div>

      {/* Class Title & Details */}
      <div className="space-y-1 mb-4">
        <h3 className="font-bold text-slate-900 text-base leading-snug">
          {currentSession?.title || 'Introduction to C Programming'}
        </h3>
        <p className="text-xs text-slate-400">
          Basics, Syntax and Your First Program
        </p>
      </div>

      {/* Students Avatar Stack */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
        <div className="flex -space-x-2 overflow-hidden">
          {studentAvatars.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Student"
              className="inline-block w-7 h-7 rounded-full ring-2 ring-white object-cover"
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-600">
          +{onlineCount || 87} students
        </span>
      </div>

      {/* Time Remaining */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-4 pt-3 border-t border-slate-100">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span>Ends in <strong className="text-slate-700">1h 24m</strong></span>
      </div>
    </div>
  );
};
