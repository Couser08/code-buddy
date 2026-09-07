import React, { useState } from 'react';
import { ExecutionStep } from '../../lib/visualizer/cVisualTracer';
import { VisualizerTopic } from '../../lib/visualizer/predefinedExamples';
import {
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Lightbulb,
  Cpu,
  BookOpen,
  Terminal,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConceptExplainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topic: VisualizerTopic;
  currentStep: ExecutionStep | null;
}

export const ConceptExplainDrawer: React.FC<ConceptExplainDrawerProps> = ({
  isOpen,
  onClose,
  topic,
  currentStep,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${topic.conceptName}. Why use in C: ${topic.whyUseProfessionally}. Real-life analogy: ${
      topic.analogyDescription
    }. Current step: ${currentStep?.actionDescription || ''}. ${currentStep?.hinglishExplanation || ''}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN'));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer"
        />

        {/* Slide-Over Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-50 border-l border-slate-200"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-2xs">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">Concept Explanation</h3>
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {topic.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{topic.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeak}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  isSpeaking
                    ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-blue-700 shadow-2xs'
                }`}
                title="Listen to this explanation in voice"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600" />}
                <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* 1. Core Concept Overview */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Concept Name</span>
              </div>
              <h2 className="text-base font-extrabold text-slate-950">
                {topic.conceptName}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {topic.summary}
              </p>
            </div>

            {/* 2. Why Use This Professionally in C? */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-700">
                  <Cpu className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-950">
                  Why Use This Professionally in C?
                </h4>
              </div>
              <p className="text-xs text-blue-950/90 leading-relaxed font-sans font-medium">
                {topic.whyUseProfessionally}
              </p>
            </div>

            {/* 3. Real-Life Analogy */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                  <Lightbulb className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Real-Life Everyday Analogy
                  </span>
                  <h4 className="text-xs font-extrabold text-amber-950">
                    {topic.analogyTitle}
                  </h4>
                </div>
              </div>
              <p className="text-xs text-amber-950/90 leading-relaxed font-sans">
                {topic.analogyDescription}
              </p>
            </div>

            {/* 4. Active Execution Step Explanation */}
            {currentStep && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-extrabold text-slate-800">
                      Step #{currentStep.stepIndex} Explanation (Hinglish)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    Line {currentStep.lineNumber}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-xs text-slate-800">
                  {currentStep.codeLine}
                </div>

                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans font-medium">
                  {currentStep.hinglishExplanation}
                </p>
              </div>
            )}

            {/* 5. Terminal Stdout Stream */}
            {currentStep?.stdout && (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3.5 shadow-inner space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Program Standard Output:</span>
                </div>
                <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap">
                  {currentStep.stdout}
                </pre>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-500 font-medium">
              Click anywhere outside or press Close to dismiss
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Close Guide
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
