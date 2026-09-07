import React from 'react';
import { CodeBlockDemo } from '../components/design-system/CodeBlockDemo';
import { SplineDoubtFabDemo } from '../components/design-system/SplineDoubtFabDemo';
import { MemberQueueCardDemo } from '../components/design-system/MemberQueueCardDemo';
import { Sparkles, Layers, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DesignSystemPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-300 pb-20">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Dashboard</span>
        </button>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>UI/UX Design Language System</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              3 Light-Mode Component Demos
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
              Precision-crafted components matching the design specifications of Images 1, 2, and 3: 
              Interactive C Code Block & Runner, Spline-Style Doubt Ask Modal, and Members/Doubt Queue Capsule Card.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold border border-emerald-200/70">
              <Sparkles className="w-3.5 h-3.5" />
              Pixel Polish Complete
            </span>
          </div>
        </div>
      </div>

      {/* Demo 1: Interactive C Code Block */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Component 1: Interactive C Code Block & Terminal</h2>
        </div>
        <CodeBlockDemo />
      </section>

      {/* Demo 2: Spline.one Style Doubt Modal / FAB */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <h2 className="text-lg font-bold text-slate-900">Component 2: Spline-Style Live Doubt Modal & Form</h2>
        </div>
        <SplineDoubtFabDemo />
      </section>

      {/* Demo 3: Capsule Member / Doubt Queue Card */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
          <h2 className="text-lg font-bold text-slate-900">Component 3: Capsule Member & Doubts Queue Card</h2>
        </div>
        <MemberQueueCardDemo />
      </section>
    </div>
  );
};
