import React, { useState } from 'react';
import { ExecutionStep } from '../../lib/visualizer/cVisualTracer';
import { Sparkles, Volume2, VolumeX, Lightbulb, Terminal, BookOpen } from 'lucide-react';

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

    const textToRead = `${currentStep.actionDescription}. ${currentStep.hinglishExplanation} ${
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
    <div className="bg-gradient-to-br from-slate-900 to-[#0F172A] border border-blue-500/20 rounded-3xl p-5 shadow-xl text-slate-100 flex flex-col space-y-4">
      {/* Header: Mentor Avatar & Listen Audio Toggle */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-4 h-4 text-blue-100" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>CodeBuddy Mentor (Hinglish Guide)</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">
                Step #{currentStep.stepIndex}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono line-clamp-1">
              {currentStep.actionDescription}
            </p>
          </div>
        </div>

        {/* Voice Listen Button */}
        <button
          onClick={handleSpeak}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            isSpeaking
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
              : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-300'
          }`}
          title="Listen to this explanation in voice (Web Speech API)"
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
          <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
        </button>
      </div>

      {/* Main Hinglish Explanation Text */}
      <div className="bg-[#0B101D] p-3.5 rounded-2xl border border-slate-800/80">
        <div className="flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {currentStep.hinglishExplanation}
          </p>
        </div>
      </div>

      {/* Real-Life Analogy Card */}
      {currentStep.analogyTitle && currentStep.analogyText && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider mb-1">
              Real-Life Analogy: {currentStep.analogyTitle}
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              {currentStep.analogyText}
            </p>
          </div>
        </div>
      )}

      {/* Terminal Stdout Snippet if any printed */}
      {currentStep.stdout && (
        <div className="bg-black/60 rounded-2xl border border-slate-800 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1.5">
            <Terminal className="w-3 h-3 text-emerald-400" />
            <span>Terminal Output so far:</span>
          </div>
          <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">
            {currentStep.stdout}
          </pre>
        </div>
      )}
    </div>
  );
};
