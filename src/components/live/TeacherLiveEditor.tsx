import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Terminal, Users, RefreshCw, ChevronUp, ChevronDown, CornerDownLeft } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';
import { executeCodeOnJudge0, EnhancedExecutionResult } from '../../lib/judge0';

interface TeacherLiveEditorProps {
  onBroadcastCode: (code: string, cursor?: { lineNumber: number; column: number }) => void;
  onBroadcastCursor: (cursor: { lineNumber: number; column: number }) => void;
  onBroadcastExecution?: (output: EnhancedExecutionResult | null, stdin: string, isRunning: boolean) => void;
}

const MONACO_TEACHER_OPTIONS = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', monospace",
  minimap: { enabled: true, side: 'right' as const },
  lineNumbers: 'on' as const,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  tabSize: 4,
  padding: { top: 14, bottom: 14 },
  renderLineHighlight: 'all' as const,
  cursorBlinking: 'blink' as const,
  cursorSmoothCaretAnimation: 'on' as const,
  cursorStyle: 'line' as const,
  cursorWidth: 2,
  wordWrap: 'on' as const,
  smoothScrolling: true,
};

export const TeacherLiveEditor: React.FC<TeacherLiveEditorProps> = ({
  onBroadcastCode,
  onBroadcastCursor,
  onBroadcastExecution,
}) => {
  const onlineCount = useSessionStore((state) => state.onlineCount);
  const initialCode = useRef(useSessionStore.getState().liveCode);
  const [isRunning, setIsRunning] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'input' | 'output'>('output');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [customStdin, setCustomStdin] = useState('');
  const [executionResult, setExecutionResult] = useState<EnhancedExecutionResult | null>(null);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const cursorThrottleRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Throttled cursor telemetry (75ms) to prevent network/store flooding and caret jitter
    editor.onDidChangeCursorPosition((e: any) => {
      if (!cursorThrottleRef.current) {
        cursorThrottleRef.current = setTimeout(() => {
          cursorThrottleRef.current = null;
          onBroadcastCursor({
            lineNumber: e.position.lineNumber,
            column: e.position.column,
          });
        }, 75);
      }
    });

    // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });

    const codeToLoad = useSessionStore.getState().liveCode || initialCode.current;
    if (codeToLoad) {
      editor.setValue(codeToLoad);
    }
  };

  useEffect(() => {
    return () => {
      if (cursorThrottleRef.current) clearTimeout(cursorThrottleRef.current);
    };
  }, []);

  const handleCodeChange = (value: string | undefined) => {
    const code = value || '';
    const cursor = editorRef.current
      ? {
          lineNumber: editorRef.current.getPosition().lineNumber,
          column: editorRef.current.getPosition().column,
        }
      : undefined;

    onBroadcastCode(code, cursor);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setIsDrawerOpen(true);
    setActiveBottomTab('output');
    if (onBroadcastExecution) {
      onBroadcastExecution(null, customStdin, true);
    }

    try {
      const currentCode = editorRef.current ? editorRef.current.getValue() : initialCode.current;
      const result = await executeCodeOnJudge0(currentCode, 50, customStdin);
      setExecutionResult(result);
      if (onBroadcastExecution) {
        onBroadcastExecution(result, customStdin, false);
      }

      // Apply GCC diagnostics to Monaco markers (Red wavy underline on broken lines)
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const monacoMarkers = (result.errorMarkers || []).map((m) => ({
            startLineNumber: m.lineNumber,
            startColumn: m.column || 1,
            endLineNumber: m.lineNumber,
            endColumn: 100,
            message: m.message,
            severity:
              m.severity === 'warning'
                ? monacoRef.current.MarkerSeverity.Warning
                : monacoRef.current.MarkerSeverity.Error,
          }));

          monacoRef.current.editor.setModelMarkers(model, 'gcc', monacoMarkers);
        }
      }
    } catch (err: any) {
      const errRes: EnhancedExecutionResult = {
        stderr: err.message || 'Execution error',
        status: { id: 11, description: 'Runtime Error' },
      };
      setExecutionResult(errRes);
      if (onBroadcastExecution) {
        onBroadcastExecution(errRes, customStdin, false);
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs flex flex-col h-[670px] relative">
      {/* Editor Header Bar */}
      <div className="px-6 py-3 border-b border-slate-200/80 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-bold border border-red-500/20">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>TEACHER BROADCASTING</span>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            main.c (GCC 9.2.0)
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{onlineCount} Live</span>
          </div>

          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isDrawerOpen
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal {isDrawerOpen ? <ChevronDown className="w-3 h-3 inline" /> : <ChevronUp className="w-3 h-3 inline" />}</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            title="Compile & Run C Code (Ctrl+Enter)"
          >
            {isRunning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-white" />
            )}
            <span>{isRunning ? 'Compiling...' : 'Run (Ctrl+↵)'}</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 w-full relative bg-[#1E1E1E] overflow-hidden">
        <Editor
          height="100%"
          width="100%"
          language="c"
          defaultValue={initialCode.current}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={MONACO_TEACHER_OPTIONS}
        />

        {/* Expandable Integrated Stdin & Output Bottom Drawer */}
        {isDrawerOpen && (
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-[#0B0F19] border-t border-slate-800 z-30 flex flex-col shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
            <div className="px-4 py-2 bg-[#090D16] border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveBottomTab('output')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    activeBottomTab === 'output'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Output Console
                </button>

                <button
                  onClick={() => setActiveBottomTab('input')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                    activeBottomTab === 'input'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CornerDownLeft className="w-3 h-3" />
                  <span>Input (stdin)</span>
                  {customStdin.trim() && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              </div>

              <div className="flex items-center gap-3">
                {executionResult?.time && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Time: {executionResult.time}s • Memory: {executionResult.memory}KB
                  </span>
                )}
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-300 rounded-md transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
              {activeBottomTab === 'input' ? (
                <div className="space-y-1.5 h-full flex flex-col">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Custom Standard Input (stdin for scanf)
                  </label>
                  <textarea
                    rows={4}
                    value={customStdin}
                    onChange={(e) => setCustomStdin(e.target.value)}
                    placeholder="Enter values for scanf() separated by spaces or newlines..."
                    className="flex-1 w-full p-3 bg-[#0F172A] rounded-xl border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-mono text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {executionResult ? (
                    <>
                      {executionResult.stdout && (
                        <div>
                          <p className="text-[10px] font-bold text-emerald-400 mb-0.5">STDOUT:</p>
                          <pre className="p-2.5 bg-[#090D16] rounded-xl text-emerald-300 whitespace-pre-wrap leading-relaxed border border-emerald-950">
                            {executionResult.stdout}
                          </pre>
                        </div>
                      )}

                      {executionResult.stderr && (
                        <div>
                          <p className="text-[10px] font-bold text-rose-400 mb-0.5">STDERR / DIAGNOSTICS:</p>
                          <pre className="p-2.5 bg-rose-950/20 rounded-xl text-rose-300 whitespace-pre-wrap leading-relaxed border border-rose-900/40">
                            {executionResult.stderr}
                          </pre>
                        </div>
                      )}

                      {executionResult.compile_output && (
                        <div>
                          <p className="text-[10px] font-bold text-amber-400 mb-0.5">GCC COMPILATION LOG:</p>
                          <pre className="p-2.5 bg-amber-950/20 rounded-xl text-amber-300 whitespace-pre-wrap leading-relaxed border border-amber-900/40">
                            {executionResult.compile_output}
                          </pre>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-slate-500 text-xs italic">
                      Press &quot;Run (Ctrl+↵)&quot; above to compile and execute with GCC...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
