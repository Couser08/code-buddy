import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { X, Play, Send, CheckCircle, RefreshCw, Terminal, Star, CornerDownLeft } from 'lucide-react';
import { Task, Submission } from '../../types/database';
import { executeCodeOnJudge0, EnhancedExecutionResult } from '../../lib/judge0';
import { useSessionStore } from '../../stores/sessionStore';
import { useAuthStore } from '../../stores/authStore';

interface TaskSubmissionModalProps {
  task: Task;
  onClose: () => void;
}

const MONACO_TASK_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', monospace",
  minimap: { enabled: false },
  lineNumbers: 'on' as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on' as const,
  cursorBlinking: 'blink' as const,
  cursorSmoothCaretAnimation: 'on' as const,
};

export const TaskSubmissionModal: React.FC<TaskSubmissionModalProps> = ({ task, onClose }) => {
  const { addSubmission, submissions, updateSubmission } = useSessionStore();
  const { user, profile, isAdmin } = useAuthStore();

  const existingSubmission = submissions.find(
    (s) => s.task_id === task.id && (isAdmin ? true : s.student_id === user?.id)
  );

  const initialCode = existingSubmission?.code || task.initial_code || '#include <stdio.h>\n\nint main() {\n    // Code here\n    return 0;\n}';
  const [studentCode, setStudentCode] = useState<string>(initialCode);
  const codeRef = useRef<string>(initialCode);

  const [customStdin, setCustomStdin] = useState<string>('');
  const [activeSideTab, setActiveSideTab] = useState<'terminal' | 'stdin'>('terminal');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<EnhancedExecutionResult | null>(
    existingSubmission?.judge0_output || null
  );
  const [submitted, setSubmitted] = useState(false);

  // Review form state for teacher
  const [teacherScore, setTeacherScore] = useState<number>(existingSubmission?.score || 95);
  const [teacherFeedback, setTeacherFeedback] = useState<string>(
    existingSubmission?.teacher_feedback || 'Great solution! Clean logic and correct edge case handling.'
  );

  const handleCodeChange = (val: string | undefined) => {
    codeRef.current = val || '';
  };

  const handleRunCompiler = async () => {
    setIsRunning(true);
    setActiveSideTab('terminal');
    try {
      const result = await executeCodeOnJudge0(codeRef.current, task.language_id || 50, customStdin);
      setOutput(result);
    } catch (err: any) {
      setOutput({
        stderr: err.message || 'Compilation error',
        status: { id: 11, description: 'Error' },
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitTask = () => {
    if (!user) {
      alert('Please sign in or create an account to submit your solution.');
      return;
    }

    const submission: Submission = {
      id: `sub-${Date.now()}`,
      task_id: task.id,
      student_id: user.id,
      student_name: profile?.name || user.email?.split('@')[0] || 'Student',
      code: codeRef.current,
      judge0_output: output,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    };

    addSubmission(submission);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  const handleSaveReview = () => {
    if (existingSubmission) {
      updateSubmission(existingSubmission.id, teacherFeedback, Number(teacherScore));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Task Assignment
              </span>
              <h3 className="font-bold text-slate-900 text-lg">{task.title}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">{task.description}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Pane (Editor + Terminal / Review) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left: Code Editor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-200 bg-[#1E1E1E]">
            <div className="px-4 py-2 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>solution.c</span>
              <span className="text-[11px] font-mono text-emerald-400">GCC 10.2.0 • ISO C11</span>
            </div>
            <div className="flex-1 min-h-[350px]">
              <Editor
                height="100%"
                defaultLanguage="c"
                defaultValue={initialCode}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={MONACO_TASK_OPTIONS}
              />
            </div>
          </div>

          {/* Right: Compiler Output & Stdin Panel (5 cols) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-slate-50/50 overflow-y-auto space-y-5">
            {/* Output & Stdin Tabs Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveSideTab('terminal')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      activeSideTab === 'terminal'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Output
                  </button>

                  <button
                    onClick={() => setActiveSideTab('stdin')}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      activeSideTab === 'stdin'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CornerDownLeft className="w-3 h-3" />
                    <span>Stdin</span>
                    {customStdin.trim() && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                </div>

                <button
                  onClick={handleRunCompiler}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-white" />}
                  <span>{isRunning ? 'Compiling...' : 'Run Test'}</span>
                </button>
              </div>

              {/* Tab Display Area */}
              {activeSideTab === 'stdin' ? (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Custom Stdin for scanf() / fgets()
                  </label>
                  <textarea
                    rows={6}
                    value={customStdin}
                    onChange={(e) => setCustomStdin(e.target.value)}
                    placeholder="Enter input test values here (e.g. 5 10 20)..."
                    className="w-full p-3 font-mono text-xs bg-[#090D16] text-slate-200 rounded-2xl border border-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              ) : (
                <div className="bg-[#090D16] rounded-2xl p-4 font-mono text-xs text-slate-300 min-h-[160px] max-h-[220px] overflow-y-auto border border-slate-800 space-y-2">
                  {output ? (
                    <>
                      {output.stdout && (
                        <div>
                          <p className="text-emerald-400 text-[10px] font-bold">STDOUT:</p>
                          <pre className="text-emerald-300 whitespace-pre-wrap">{output.stdout}</pre>
                        </div>
                      )}
                      {output.stderr && (
                        <div>
                          <p className="text-rose-400 text-[10px] font-bold">STDERR:</p>
                          <pre className="text-rose-300 whitespace-pre-wrap">{output.stderr}</pre>
                        </div>
                      )}
                      {output.compile_output && (
                        <div>
                          <p className="text-amber-400 text-[10px] font-bold">COMPILER:</p>
                          <pre className="text-amber-300 whitespace-pre-wrap">{output.compile_output}</pre>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-slate-500 italic">Click &quot;Run Test&quot; to compile and execute...</p>
                  )}
                </div>
              )}

              {/* Quick Inline Stdin Input Bar for Fast Testing */}
              {activeSideTab === 'terminal' && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-[#090D16] rounded-xl border border-slate-800 text-xs font-mono">
                  <span className="text-emerald-400 font-bold select-none">&gt;</span>
                  <input
                    type="text"
                    value={customStdin}
                    onChange={(e) => setCustomStdin(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRunCompiler();
                      }
                    }}
                    placeholder="Terminal stdin prompt: type input & press Enter ↵"
                    className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-xs font-mono"
                  />
                  {customStdin && (
                    <button
                      type="button"
                      onClick={() => setCustomStdin('')}
                      className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Teacher Review Mode VS Student Submission Mode */}
            {isAdmin ? (
              <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Teacher Review & Grade
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={teacherScore}
                      onChange={(e) => setTeacherScore(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-xs font-bold text-center border border-slate-300 rounded-lg"
                    />
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  placeholder="Provide constructive feedback to the student..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-800"
                />

                <button
                  onClick={handleSaveReview}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Score & Review
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={handleSubmitTask}
                  disabled={submitted}
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {submitted ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Task Submitted to Instructor!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Solution for Review</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
