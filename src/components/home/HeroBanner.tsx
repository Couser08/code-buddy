import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-3xl p-8 lg:p-10 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Text & CTAs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-xs font-semibold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Learning. Real Progress.</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
            Master <span className="text-blue-600">C Programming</span> Together
          </h1>

          {/* Subtitle */}
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl">
            Join live coding classes, watch real-time demonstrations, ask doubts, 
            submit tasks, and grow with a focused learning community.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => navigate('/live')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer"
            >
              <span>Join Live Class</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-full border border-slate-200/90 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
            >
              <span>View Upcoming</span>
              <Calendar className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Right Graphical Area: 3D C Emblem & Isometric Code Window (5 cols) */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[220px]">
          {/* Handwritten Annotation Arrow */}
          <div className="absolute -top-3 right-6 hidden sm:flex flex-col items-center select-none text-slate-500 text-xs font-mono font-medium">
            <span className="bg-slate-100/90 text-slate-600 px-2 py-0.5 rounded-md text-[11px] shadow-xs">
              Write • Compile • Learn • Repeat
            </span>
            <svg 
              className="w-8 h-8 text-slate-400 mt-1" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M7 3C14 3 17 8 16 14" />
              <path d="M12 11l4 4 4-4" />
            </svg>
          </div>

          {/* Floating 3D 'C' Emblem Cube */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 right-12 z-20 w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 p-0.5 shadow-xl shadow-blue-500/25 flex items-center justify-center"
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-3xl tracking-tight shadow-inner">
              C
            </div>
          </motion.div>

          {/* Isometric Floating Code Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm bg-white/95 rounded-2xl border border-slate-200/90 p-5 shadow-xl shadow-slate-200/50 relative z-10 backdrop-blur-sm"
          >
            {/* Window Top Controls */}
            <div className="flex items-center gap-1.5 pb-3 border-b border-slate-100 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 text-[11px] font-mono text-slate-400">main.c</span>
            </div>

            {/* Code Snippet */}
            <div className="font-mono text-xs text-slate-700 space-y-1">
              <p className="text-purple-600 font-semibold">#include &lt;stdio.h&gt;</p>
              <p className="pt-1"><span className="text-blue-600 font-semibold">int</span> main() &#123;</p>
              <p className="pl-4">
                printf(<span className="text-emerald-600">&quot;Hello, C!\n&quot;</span>);
              </p>
              <p className="pl-4">
                <span className="text-rose-600 font-semibold">return</span> 0;
              </p>
              <p>&#125;</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
