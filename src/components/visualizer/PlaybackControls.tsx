import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward } from 'lucide-react';

interface PlaybackControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  currentLineNumber: number;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onSeek: (stepIndex: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentStepIndex,
  totalSteps,
  currentLineNumber,
  onNext,
  onPrev,
  onReset,
  onSeek,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1); // 1 = 1.2s per step, 0.5 = 2s, 2 = 600ms

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      if (currentStepIndex >= totalSteps - 1) {
        setIsPlaying(false);
      } else {
        const intervalMs = Math.round(1200 / speed);
        timer = setTimeout(() => {
          onNext();
        }, intervalMs);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, totalSteps, speed, onNext]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-slate-100 shadow-md">
      {/* Left: Step Controls & Play/Pause */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
          title="Reset to Step 1"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onPrev}
          disabled={currentStepIndex <= 0}
          className="p-2 text-slate-400 hover:text-white disabled:opacity-40 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
          title="Previous Line (|◀)"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={totalSteps <= 1}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer disabled:opacity-50"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-white" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Auto Play</span>
            </>
          )}
        </button>

        <button
          onClick={onNext}
          disabled={currentStepIndex >= totalSteps - 1}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white rounded-xl font-bold text-xs transition-colors cursor-pointer border border-slate-700"
          title="Next Line (▶|)"
        >
          <span>Step Next</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Timeline Scrubber */}
      <div className="flex-1 min-w-[200px] max-w-md flex items-center gap-3">
        <span className="text-[11px] font-mono text-slate-400">1</span>
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 0)}
          value={currentStepIndex}
          onChange={(e) => {
            setIsPlaying(false);
            onSeek(parseInt(e.target.value, 10));
          }}
          className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
        <span className="text-[11px] font-mono text-slate-400">{totalSteps}</span>
      </div>

      {/* Right: Speed Toggle & Status Badge */}
      <div className="flex items-center gap-3">
        {/* Speed button */}
        <button
          onClick={() => {
            setSpeed(speed === 0.5 ? 1 : speed === 1 ? 2 : 0.5);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-semibold text-slate-300 cursor-pointer transition-colors"
          title="Toggle Playback Speed"
        >
          <FastForward className="w-3 h-3 text-blue-400" />
          <span>{speed}x</span>
        </button>

        {/* Current step & line indicator */}
        <div className="px-3 py-1.5 bg-[#080C14] border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2">
          <span className="text-blue-400 font-bold">Step {currentStepIndex + 1}/{totalSteps}</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">Line {currentLineNumber}</span>
        </div>
      </div>
    </div>
  );
};
