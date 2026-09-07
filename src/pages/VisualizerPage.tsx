import React, { useState, useEffect, useMemo, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { VISUALIZER_TOPICS, VisualizerTopic } from '../lib/visualizer/predefinedExamples';
import { ExecutionStep } from '../lib/visualizer/cVisualTracer';
import { getCachedTopicTrace, getTraceForCode } from '../lib/visualizer/precomputedTraces';
import { MemoryCanvas } from '../components/visualizer/MemoryCanvas';
import { ConceptExplainDrawer } from '../components/visualizer/ConceptExplainDrawer';
import { PlaybackControls } from '../components/visualizer/PlaybackControls';
import { executeCodeOnJudge0, EnhancedExecutionResult } from '../lib/judge0';
import {
  Play,
  RotateCcw,
  FileCode,
  Layers,
  Terminal,
  BookOpen,
  Maximize2,
  Minimize2,
  Share2,
  Lightbulb,
  Check,
  Loader2,
  AlignLeft,
  Copy,
  Trash2,
} from 'lucide-react';

const MONACO_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  minimap: { enabled: false },
  lineNumbers: 'on' as const,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  tabSize: 4,
  padding: { top: 10, bottom: 10 },
  renderLineHighlight: 'all' as const,
  wordWrap: 'on' as const,
  glyphMargin: true,
  lineNumbersMinChars: 3,
};

export const VisualizerPage: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(VISUALIZER_TOPICS[0].id);
  const [code, setCode] = useState<string>(VISUALIZER_TOPICS[0].code);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Active view tab: 'visualization' or 'output'
  const [activeTab, setActiveTab] = useState<'visualization' | 'output'>('visualization');

  // Slide-over concept drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Fullscreen right panel toggle
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Judge0 Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<EnhancedExecutionResult | null>(null);

  // Share link feedback
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedTerminal, setCopiedTerminal] = useState<boolean>(false);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const activeTopic = useMemo(() => {
    return VISUALIZER_TOPICS.find((t) => t.id === selectedTopicId) || VISUALIZER_TOPICS[0];
  }, [selectedTopicId]);

  // Precomputed 0ms cache for active topic with debounced calculation for custom code edits
  const [steps, setSteps] = useState<ExecutionStep[]>(() => {
    return getCachedTopicTrace(selectedTopicId) || getTraceForCode(code, selectedTopicId);
  });

  useEffect(() => {
    // If exact match with topic default, return instantly from cache (0ms)
    if (code === activeTopic.code) {
      const cached = getCachedTopicTrace(selectedTopicId);
      if (cached) {
        setSteps(cached);
        return;
      }
    }

    // Debounce custom user edits (200ms) to keep editor typing 100% fluid
    const timer = setTimeout(() => {
      const calculated = getTraceForCode(code, selectedTopicId);
      setSteps(calculated);
    }, 200);

    return () => clearTimeout(timer);
  }, [code, selectedTopicId, activeTopic.code]);

  const currentStep = steps[currentStepIndex] || steps[0] || null;

  // Sync topic change
  const handleSelectTopic = (topic: VisualizerTopic) => {
    setSelectedTopicId(topic.id);
    setCode(topic.code);
    setCurrentStepIndex(0);
    setRunResult(null);
    if (editorRef.current) {
      editorRef.current.setValue(topic.code);
    }
  };

  // Reset code to topic default
  const handleResetCode = () => {
    setCode(activeTopic.code);
    setCurrentStepIndex(0);
    setRunResult(null);
    if (editorRef.current) {
      editorRef.current.setValue(activeTopic.code);
    }
  };

  // Format code
  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  // Run code on Judge0 (Ctrl+Enter or Run Button)
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
      const res = await executeCodeOnJudge0(code, 50, '');
      setRunResult(res);
      setActiveTab('output');
    } catch (e: any) {
      setRunResult({
        stdout: null,
        stderr: e.message || 'Execution error',
        compile_output: null,
        time: '0',
        memory: 0,
        status: { id: 11, description: 'Runtime Error' },
      });
      setActiveTab('output');
    } finally {
      setIsRunning(false);
    }
  };

  // Copy shareable visualizer link
  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('topic', selectedTopicId);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add Ctrl+Enter shortcut to run code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });
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
              className: 'bg-blue-100/70 border-l-4 border-blue-600',
              glyphMarginClassName: 'text-blue-600 font-bold',
              glyphMarginHoverMessage: { value: `▶ Step #${currentStep.stepIndex + 1}: ${currentStep.actionDescription}` },
            },
          },
        ]);
        editorRef.current.revealLineInCenterIfOutsideViewport(line);
      } catch (e) {}
    }
  }, [currentStep]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden p-3.5 sm:p-4.5 space-y-3 bg-slate-50/50">
      {/* 1. Header Bar (Matching Reference Mockup) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-5 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
              Visualizer
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Memory Visualizer
            </h1>
          </div>
        </div>

        {/* Center: Concept Explain Card/Button (Opens Drawer) */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200 text-amber-950 transition-all cursor-pointer shadow-2xs group"
          title="Open Concept Explanation & Hinglish Mentor Guide"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold leading-none flex items-center gap-1">
              <span>Concept Explain</span>
              <span className="text-amber-700 font-medium">• {activeTopic.title}</span>
            </div>
            <p className="text-[10px] text-amber-800/80 leading-tight mt-0.5 font-medium">
              Why use in C & Hinglish audio guide
            </p>
          </div>
        </button>

        {/* Right: Actions (Share & Run Code) */}
        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200 shadow-2xs"
            title="Copy visualizer topic share link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Run (Ctrl+Enter) Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60"
            title="Execute C code using GCC compiler (Ctrl+Enter)"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running GCC...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run (Ctrl+Enter)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Horizontal Concept Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
        {VISUALIZER_TOPICS.map((topic) => {
          const isSelected = selectedTopicId === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => handleSelectTopic(topic)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <span>{topic.title}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold ${
                  isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {topic.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Split Area: Left (Monaco Editor) vs Right (Visualization & Output) */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-3.5 overflow-hidden">
        {/* Left Column: Monaco Code Editor */}
        <div
          className={`${
            isFullscreen ? 'hidden' : 'col-span-12 lg:col-span-5'
          } bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex flex-col h-full`}
        >
          {/* Editor Header: Tab + Reset + Format */}
          <div className="px-4 py-2.5 border-b border-slate-200/80 bg-slate-50/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-2xs">
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
                <span>main.c</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">GCC C99</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title="Reset code to default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleFormatCode}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title="Format C code"
              >
                <AlignLeft className="w-3 h-3" />
                <span>Format</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 w-full relative bg-white min-h-0">
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

        {/* Right Column: Visualization & Output Workspace */}
        <div
          className={`${
            isFullscreen ? 'col-span-12' : 'col-span-12 lg:col-span-7'
          } bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex flex-col h-full`}
        >
          {/* Right Header: Tabs & Explain Code Button */}
          <div className="px-4 py-2 border-b border-slate-200/80 bg-slate-50/90 flex items-center justify-between shrink-0">
            {/* Tabs: Visualization vs Output */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('visualization')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'visualization'
                    ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Visualization</span>
              </button>

              <button
                onClick={() => setActiveTab('output')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'output'
                    ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>&gt;_ Output</span>
                {runResult && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>

            {/* Right Tools: Explain Code & Fullscreen Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Open Concept Explanation & Hinglish Mentor Guide"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explain Code</span>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Visualization'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Right Body Canvas */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 bg-slate-50/30">
            {activeTab === 'visualization' ? (
              <MemoryCanvas currentStep={currentStep} topicId={selectedTopicId} />
            ) : (
              /* Output Tab */
              <div className="h-full flex flex-col bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-sm">&gt;_</span>
                    <span className="font-bold text-slate-200">Terminal Output (GCC)</span>
                  </div>

                  {runResult && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-800 rounded text-slate-400">
                        {runResult.time}s • {runResult.memory} KB
                      </span>
                      <button
                        onClick={() => {
                          const text = runResult.stdout || runResult.stderr || runResult.compile_output || '';
                          navigator.clipboard.writeText(text);
                          setCopiedTerminal(true);
                          setTimeout(() => setCopiedTerminal(false), 2000);
                        }}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                        title="Copy Output"
                      >
                        {copiedTerminal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setRunResult(null)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                        title="Clear Output"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto py-3 space-y-2 select-text font-mono text-xs leading-relaxed">
                  {isRunning ? (
                    <div className="flex items-center gap-2 text-slate-400 py-6">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Compiling with GCC and executing binary...</span>
                    </div>
                  ) : runResult ? (
                    <>
                      {runResult.compile_output && (
                        <div className="text-amber-400 whitespace-pre-wrap">
                          {runResult.compile_output}
                        </div>
                      )}
                      {runResult.stderr && (
                        <div className="text-red-400 whitespace-pre-wrap">
                          {runResult.stderr}
                        </div>
                      )}
                      {runResult.stdout && (
                        <div className="text-emerald-300 whitespace-pre-wrap">
                          {runResult.stdout}
                        </div>
                      )}
                      {!runResult.compile_output && !runResult.stderr && !runResult.stdout && (
                        <div className="text-slate-400">Program exited successfully with code 0.</div>
                      )}
                    </>
                  ) : (
                    <div className="py-8 text-center text-slate-500">
                      <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>Click &quot;Run (Ctrl+Enter)&quot; above to compile and run your code with GCC.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Stepper Toolbar */}
      <div className="shrink-0">
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

      {/* 5. Slide-Over Concept Explain Drawer */}
      <ConceptExplainDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        topic={activeTopic}
        currentStep={currentStep}
      />
    </div>
  );
};
