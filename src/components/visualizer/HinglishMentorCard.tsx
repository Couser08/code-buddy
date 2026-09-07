import React, { useState } from 'react';
import { ExecutionStep } from '../../lib/visualizer/cVisualTracer';
import { Sparkles, Volume2, VolumeX, Lightbulb, Terminal, BookOpen, Cpu } from 'lucide-react';

interface HinglishMentorCardProps {
  currentStep: ExecutionStep | null;
}

export const HinglishMentorCard: React.FC<HinglishMentorCardProps> = ({ currentStep }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!currentStep) return null;

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

    const textToRead = `${currentStep.actionDescription}. ${
      currentStep.whyUseProfessionally ? 'Why use in C: ' + currentStep.whyUseProfessionally + '. ' : ''
    }${currentStep.hinglishExplanation} ${
      currentStep.analogyText ? 'Real life analogy: ' + currentStep.analogyText : ''
    }`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Prefer Hindi/Indian English voice if available
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

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs text-slate-800 flex flex-col space-y-3.5">
      {/* Header: Mentor Avatar & Listen Audio Toggle */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <span>CodeBuddy Mentor (Hinglish Guide)</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-mono font-bold">
                Step #{currentStep.stepIndex}
              </span>
            </h3>
            <p className="text-[11px] font-medium text-slate-600 line-clamp-1 mt-0.5">
              {currentStep.actionDescription}
            </p>
          </div>
        </div>

        {/* Voice Listen Button */}
        <button
          onClick={handleSpeak}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            isSpeaking
              ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
              : 'bg-blue-50 hover:bg-blue-100 border-blue-200/80 text-blue-700 shadow-2xs'
          }`}
          title="Listen to this explanation in voice (Web Speech API)"
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600" />}
          <span>{isSpeaking ? 'Stop Voice' : 'Listen Voice'}</span>
        </button>
      </div>

      {/* Why Use It Professionally in C? Callout Card */}
      {currentStep.whyUseProfessionally && (
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-blue-600/10 border border-blue-200/80 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold text-blue-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>Why Use This Professionally in C?</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-200/60 text-blue-900 rounded font-bold">
                Hardware & Architecture
              </span>
            </div>
            <p className="text-xs text-blue-950 leading-relaxed font-sans font-medium">
              {currentStep.whyUseProfessionally}
            </p>
          </div>
        </div>
      )}

      {/* Main Hinglish Explanation Text */}
      <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80">
        <div className="flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans font-medium">
            {currentStep.hinglishExplanation}
          </p>
        </div>
      </div>

      {/* Real-Life Analogy Card */}
      {currentStep.analogyTitle && currentStep.analogyText && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-amber-100 border border-amber-300/60 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider mb-0.5">
              Real-Life Analogy: {currentStep.analogyTitle}
            </div>
            <p className="text-xs text-amber-950/90 leading-relaxed font-sans">
              {currentStep.analogyText}
            </p>
          </div>
        </div>
      )}

      {/* Terminal Stdout Snippet if any printed */}
      {currentStep.stdout && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 shadow-inner">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1.5">
            <Terminal className="w-3 h-3 text-emerald-400" />
            <span>Terminal Output Stream:</span>
          </div>
          <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap">
            {currentStep.stdout}
          </pre>
        </div>
      )}
    </div>
  );
};

