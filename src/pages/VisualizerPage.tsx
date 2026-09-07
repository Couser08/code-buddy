import React, { useState, useEffect, useMemo, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { VISUALIZER_TOPICS, VisualizerTopic } from '../lib/visualizer/predefinedExamples';
import { traceCCode, ExecutionStep } from '../lib/visualizer/cVisualTracer';
import { MemoryCanvas } from '../components/visualizer/MemoryCanvas';
import { HinglishMentorCard } from '../components/visualizer/HinglishMentorCard';
import { PlaybackControls } from '../components/visualizer/PlaybackControls';
import { BrainCircuit, Play, Sparkles, RefreshCw, Code2 } from 'lucide-react';

const MONACO_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', monospace",
  minimap: { enabled: false },
  lineNumbers: 'on' as const,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  tabSize: 4,
  padding: { top: 12, bottom: 12 },
  renderLineHighlight: 'all' as const,
  wordWrap: 'on' as const,
};

export const VisualizerPage: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(VISUALIZER_TOPICS[0].id);
  const [code, setCode] = useState<string>(VISUALIZER_TOPICS[0].code);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const activeTopic = useMemo(() => {
    return VISUALIZER_TOPICS.find((t) => t.id === selectedTopicId) || VISUALIZER_TOPICS[0];
  }, [selectedTopicId]);

  // Compute execution steps whenever code or topic changes
  const steps: ExecutionStep[] = useMemo(() => {
    return traceCCode(code, selectedTopicId);
  }, [code, selectedTopicId]);

  const currentStep = steps[currentStepIndex] || steps[0] || null;

  // Sync topic change
  const handleSelectTopic = (topic: VisualizerTopic) => {
    setSelectedTopicId(topic.id);
    setCode(topic.code);
    setCurrentStepIndex(0);
    if (editorRef.current) {
      editorRef.current.setValue(topic.code);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Highlight active execution line in Monaco Editor
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !currentStep) return;

    const line = currentStep.lineNumber;
    if (line > 0) {
      try {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
          {
            range: new monacoRef.current.Range(line, 1, line, 1),
            options: {
              isWholeLine: true,
              className: 'bg-blue-100/80 border-l-4 border-blue-600',
              glyphMarginClassName: 'text-blue-600 font-bold',
            },
          },
        ]);
        editorRef.current.revealLineInCenterIfOutsideViewport(line);
      } catch (e) {}
    }
  }, [currentStep]);

  return (
    <div className="p-5 sm:p-7 max-w-[1700px] mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Top Studio Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Interactive C Concept & Memory Lab
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
            Visual Memory & Pointer Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step through real C memory allocations, pointer addresses, condition branches, and loops with real-life Hinglish analogies.
          </p>
        </div>

        {/* Action badge */}
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-blue-200/70">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-Life Analogies Enabled</span>
        </div>
      </div>

      {/* Preset Topic Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {VISUALIZER_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => handleSelectTopic(topic)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              selectedTopicId === topic.id
                ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{topic.title}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              selectedTopicId === topic.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {topic.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Main Workspace Split: Code Editor (Left) vs Visual Memory Canvas (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column (5 cols on XL): Monaco Code Editor with Active Line Highlight */}
        <div className="xl:col-span-5 bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs flex flex-col h-[680px]">
          <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">C Source Code</span>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
                Editable Sandbox
              </span>
            </div>

            <button
              onClick={() => {
                setCurrentStepIndex(0);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Re-trace from beginning"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="flex-1 w-full relative bg-white">
            <Editor
              height="100%"
              width="100%"
              language="c"
              value={code}
              onChange={(val) => {
                setCode(val || '');
                setCurrentStepIndex(0);
              }}
              onMount={handleEditorDidMount}
              theme="vs"
              options={MONACO_OPTIONS}
            />
          </div>
        </div>

        {/* Right Column (7 cols on XL): Visual Memory Canvas + Hinglish Card */}
        <div className="xl:col-span-7 flex flex-col space-y-4 h-[680px] overflow-hidden">
          {/* Top: Hinglish Mentor Card */}
          <div className="shrink-0">
            <HinglishMentorCard currentStep={currentStep} />
          </div>

          {/* Bottom: Dynamic Memory Canvas */}
          <div className="flex-1 overflow-hidden">
            <MemoryCanvas currentStep={currentStep} />
          </div>
        </div>
      </div>

      {/* Bottom Step Debugger & Scrubber Toolbar */}
      <PlaybackControls
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        currentLineNumber={currentStep?.lineNumber || 1}
        onNext={() => setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1))}
        onPrev={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
        onReset={() => setCurrentStepIndex(0)}
        onSeek={(idx) => setCurrentStepIndex(idx)}
      />
    </div>
  );
};
