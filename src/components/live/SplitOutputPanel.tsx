import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  RefreshCw,
  Terminal,
  CornerDownLeft,
  Trash2,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  Radio,
  User,
  BrainCircuit,
} from 'lucide-react';
import { EnhancedExecutionResult } from '../../lib/judge0';
import { getTraceForCode } from '../../lib/visualizer/precomputedTraces';
import { ExecutionStep } from '../../lib/visualizer/cVisualTracer';
import { MemoryCanvas } from '../visualizer/MemoryCanvas';
import { HinglishMentorCard } from '../visualizer/HinglishMentorCard';
import { PlaybackControls } from '../visualizer/PlaybackControls';

interface SplitOutputPanelProps {
  isRunning: boolean;
  onRunCode: () => void;
  output: EnhancedExecutionResult | null;
  stdin: string;
  onStdinChange: (val: string) => void;
  onClearOutput?: () => void;
  code?: string;
  isLiveClassroom?: boolean;
  teacherOutput?: EnhancedExecutionResult | null;
  teacherStdin?: string;
  isTeacherRunning?: boolean;
}

export const SplitOutputPanel: React.FC<SplitOutputPanelProps> = ({
  isRunning,
  onRunCode,
  output,
  stdin,
  onStdinChange,
  onClearOutput,
  code = '',
  isLiveClassroom = false,
  teacherOutput = null,
  teacherStdin = '',
  isTeacherRunning = false,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'stdin' | 'memory'>('terminal');
  const [consoleSource, setConsoleSource] = useState<'student' | 'teacher'>('student');
  const [terminalInput, setTerminalInput] = useState<string>(stdin);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  const [visualStepIndex, setVisualStepIndex] = useState<number>(0);
  const [visualSteps, setVisualSteps] = useState<ExecutionStep[]>([]);

  // Lazy Game-Dev Computation:
  // Only parse C execution steps when the user is actively viewing the 'memory' tab!
  // Saves 100% of tracer CPU load during live typing in the terminal.
  useEffect(() => {
    if (activeTab !== 'memory' || !code) {
      return;
    }
    const timer = setTimeout(() => {
      const steps = getTraceForCode(code);
      setVisualSteps(steps);
      setVisualStepIndex((prev) => Math.min(prev, Math.max(steps.length - 1, 0)));
    }, 150);

    return () => clearTimeout(timer);
  }, [activeTab, code]);

  const currentVisualStep = visualSteps[visualStepIndex] || visualSteps[0] || null;

  // Sync terminal input whenever stdin changes from outside
  useEffect(() => {
    setTerminalInput(stdin);
  }, [stdin]);

  // When teacher runs code in live class, auto-switch to teacher view if student hasn't run code yet
  useEffect(() => {
    if (isTeacherRunning || teacherOutput) {
      if (isLiveClassroom && !output) {
        setConsoleSource('teacher');
      }
    }
  }, [isTeacherRunning, teacherOutput, isLiveClassroom, output]);

  // Smart scanf() & stdin requirement detector
  const hasScanf = useMemo(() => {
    if (!code) return false;
    return /\b(scanf|fgets|getchar|gets|cin\s*>>)\b/.test(code);
  }, [code]);

  // Active output to display based on console source
  const currentOutput = isLiveClassroom && consoleSource === 'teacher' ? teacherOutput : output;
  const currentStdin = isLiveClassroom && consoleSource === 'teacher' ? teacherStdin : stdin;
  const currentIsRunning = isLiveClassroom && consoleSource === 'teacher' ? isTeacherRunning : isRunning;

  const isAccepted = currentOutput?.status?.id === 3;

  const handleSendInput = () => {
    onStdinChange(terminalInput);
    setActiveTab('terminal');
    // Instant execution with the updated stdin
    setTimeout(() => {
      onRunCode();
    }, 30);
  };

  const handleQuickFill = (val: string) => {
    setTerminalInput(val);
    onStdinChange(val);
    setActiveTab('terminal');
    setTimeout(() => {
      onRunCode();
    }, 30);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs flex flex-col h-[670px]">
      {/* Top Header Control Bar */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* Main View Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'terminal'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              <span>Output Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab('stdin')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'stdin'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CornerDownLeft className="w-3.5 h-3.5 text-indigo-600" />
              <span>Input Buffer (stdin)</span>
              {stdin.trim() && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </button>

            <button
              onClick={() => setActiveTab('memory')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'memory'
                  ? 'bg-white text-purple-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-600" />
              <span>Visual Memory</span>
            </button>
          </div>

          {/* Live Classroom Stream Switcher */}
          {isLiveClassroom && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-semibold border border-slate-200">
              <button
                onClick={() => setConsoleSource('teacher')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  consoleSource === 'teacher'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View live instructor execution terminal"
              >
                <Radio className="w-3 h-3 text-white animate-pulse" />
                <span>Teacher Stream</span>
              </button>

              <button
                onClick={() => setConsoleSource('student')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  consoleSource === 'student'
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Run your own tests independently"
              >
                <User className="w-3 h-3" />
                <span>My Sandbox</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onClearOutput && currentOutput && (
            <button
              onClick={onClearOutput}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Clear Output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => {
              if (consoleSource === 'teacher') setConsoleSource('student');
              onRunCode();
            }}
            disabled={currentIsRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98"
            title="Compile & Run C Code (Ctrl+Enter)"
          >
            {currentIsRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>{currentIsRunning ? 'Compiling...' : 'Run (Ctrl+↵)'}</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Screen Area */}
      <div className={`flex-1 font-mono text-xs flex flex-col overflow-hidden ${
        activeTab === 'memory' ? 'bg-[#F8F9FA] text-slate-800' : 'bg-[#090D16] text-slate-200'
      }`}>
        {/* Environment Status Sub-bar */}
        <div className={`px-5 py-2 border-b flex items-center justify-between text-[11px] select-none shrink-0 ${
          activeTab === 'memory'
            ? 'bg-white border-slate-200 text-slate-600'
            : 'bg-[#060910] border-slate-800/80 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 ${activeTab === 'memory' ? 'text-slate-700 font-semibold' : 'text-slate-300'}`}>
              <Cpu className="w-3 h-3 text-blue-500" />
              {activeTab === 'memory' ? 'Interactive Memory Tracer • x86_64' : 'GCC 10.2.0 • x86_64'}
            </span>
            {isLiveClassroom && consoleSource === 'teacher' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE INSTRUCTOR TERMINAL
              </span>
            )}
          </div>

          {currentOutput?.time && (
            <span className="flex items-center gap-2 text-slate-400">
              <span className="flex items-center gap-1 text-amber-400">
                <Clock className="w-3 h-3" />
                {currentOutput.time}s
              </span>
              <span>•</span>
              <span className="text-emerald-400">{currentOutput.memory || 1420} KB</span>
            </span>
          )}
        </div>

        {/* Content Viewport */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
          {activeTab === 'memory' ? (
            <div className="h-full flex flex-col space-y-4">
              <HinglishMentorCard currentStep={currentVisualStep} />
              <div className="flex-1 min-h-[220px]">
                <MemoryCanvas currentStep={currentVisualStep} />
              </div>
              <PlaybackControls
                currentStepIndex={visualStepIndex}
                totalSteps={visualSteps.length}
                currentLineNumber={currentVisualStep?.lineNumber || 1}
                onNext={() => setVisualStepIndex((p) => Math.min(p + 1, visualSteps.length - 1))}
                onPrev={() => setVisualStepIndex((p) => Math.max(p - 1, 0))}
                onReset={() => setVisualStepIndex(0)}
                onSeek={(idx) => setVisualStepIndex(idx)}
              />
            </div>
          ) : activeTab === 'stdin' ? (
            <div className="h-full flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Standard Input Buffer (stdin)</span>
                <span className="text-[10px] text-slate-500">Values read by scanf() / fgets()</span>
              </div>
              <textarea
                rows={10}
                value={stdin}
                onChange={(e) => {
                  onStdinChange(e.target.value);
                  setTerminalInput(e.target.value);
                }}
                placeholder="Enter input values separated by spaces or newlines (e.g. 25 40)..."
                className="flex-1 w-full p-4 bg-[#0F172A] rounded-2xl border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs resize-none"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Tip: Multi-line inputs or bulk test cases can be pasted directly here.
                </span>
                <button
                  onClick={() => {
                    setActiveTab('terminal');
                    onRunCode();
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save & Run Code
                </button>
              </div>
            </div>
          ) : currentOutput ? (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Shell Header Line */}
              <div className="text-slate-500 select-none text-[11px]">
                $ gcc main.c -o main && ./main
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                {isAccepted ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accepted (Exit Code: 0)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{currentOutput.status?.description || 'Execution Error'}</span>
                  </span>
                )}

                {currentStdin.trim() && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-slate-500 font-sans">stdin fed:</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 font-bold border border-slate-700">
                      {currentStdin.trim()}
                    </span>
                  </div>
                )}
              </div>

              {/* Standard Output with Terminal Aesthetic */}
              {currentOutput.stdout && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Standard Output Stream:
                    </p>
                  </div>
                  <pre className="p-3.5 bg-[#0C1220] rounded-2xl border border-slate-800/80 text-emerald-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                    {currentOutput.stdout}
                  </pre>
                </div>
              )}

              {/* Standard Error / Diagnostics */}
              {currentOutput.stderr && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                    Standard Error:
                  </p>
                  <pre className="p-3.5 bg-rose-950/20 rounded-2xl border border-rose-900/30 text-rose-300 whitespace-pre-wrap leading-relaxed">
                    {currentOutput.stderr}
                  </pre>
                </div>
              )}

              {/* Compilation Log */}
              {currentOutput.compile_output && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Compiler Diagnostics:
                  </p>
                  <pre className="p-3.5 bg-amber-950/20 rounded-2xl border border-amber-900/30 text-amber-300 whitespace-pre-wrap leading-relaxed">
                    {currentOutput.compile_output}
                  </pre>
                </div>
              )}

              <div ref={terminalBottomRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 select-none">
              <Terminal className="w-10 h-10 opacity-30 text-blue-400" />
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-slate-400">Ready to Compile & Execute C Code</p>
                {hasScanf ? (
                  <p className="text-[11px] text-amber-400/90 font-medium">
                    ⚡ This program reads stdin (scanf). Type your inputs below or press &quot;Run&quot;.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-600">
                    Press &quot;Run (Ctrl+↵)&quot; to compile and view results live in real-time.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Interactive Terminal Input Bar (Seamless Terminal Experience) */}
        {activeTab !== 'memory' && (
          <div className="p-3 bg-[#060A12] border-t border-slate-800/80 flex flex-col gap-2 shrink-0">
            {hasScanf && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-amber-400 font-sans">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                  <span className="font-semibold text-slate-200">Interactive Input Mode:</span>
                  <span className="text-slate-400">Program waiting for scanf()</span>
                </div>

                {/* Quick Fill Test Values */}
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="text-slate-500 font-sans">Quick fill:</span>
                  {['25 40', '10 50', '5 15'].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleQuickFill(val)}
                      className="px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-blue-600 hover:text-white text-slate-300 transition-colors cursor-pointer border border-slate-700/80"
                      title={`Test with inputs: ${val}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendInput();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[#0C1220] rounded-xl border border-slate-700/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 transition-all font-mono text-xs">
                <span className="text-emerald-400 font-bold select-none text-xs">&gt;</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => {
                    setTerminalInput(e.target.value);
                    onStdinChange(e.target.value);
                  }}
                  placeholder={
                    hasScanf
                      ? 'Enter stdin values for scanf() (e.g. 25 40) and press Enter ↵'
                      : 'Terminal interactive stdin prompt... (Press Enter to Run)'
                  }
                  className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none font-mono text-xs"
                />
                {terminalInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setTerminalInput('');
                      onStdinChange('');
                    }}
                    className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={currentIsRunning}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0 active:scale-98"
                title="Send input into stdin and run program (Enter)"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                <span>{currentIsRunning ? 'Running...' : 'Send & Run'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

