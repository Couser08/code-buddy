import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Eye, Copy, Check, Users } from 'lucide-react';
import { useSessionStore } from '../../stores/sessionStore';

const MONACO_STUDENT_OPTIONS = {
  readOnly: true,
  fontSize: 14,
  fontFamily: "'JetBrains Mono', monospace",
  minimap: { enabled: true, side: 'right' as const },
  lineNumbers: 'on' as const,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  tabSize: 4,
  padding: { top: 16, bottom: 16 },
  renderLineHighlight: 'all' as const,
  cursorBlinking: 'blink' as const,
  cursorSmoothCaretAnimation: 'on' as const,
  wordWrap: 'on' as const,
  smoothScrolling: true,
};

export const StudentLiveViewer: React.FC = () => {
  const { liveCode, cursorPosition, onlineCount } = useSessionStore();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const [followTeacher, setFollowTeacher] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsEditorReady(true);

    if (liveCode) {
      editor.setValue(liveCode);
    }
  };

  // High-Performance Game-Dev Netcode Synchronization:
  // Apply buffer changes without tearing down the model or resetting student's view
  useEffect(() => {
    if (!editorRef.current) return;

    const model = editorRef.current.getModel();
    if (model) {
      const currentVal = model.getValue();
      if (currentVal !== liveCode) {
        const currentScroll = editorRef.current.getScrollTop();
        const currentPosition = editorRef.current.getPosition();

        requestAnimationFrame(() => {
          editorRef.current.executeEdits('teacher-stream', [
            {
              range: model.getFullModelRange(),
              text: liveCode,
              forceMoveMarkers: true,
            },
          ]);
          if (currentPosition) {
            editorRef.current.setPosition(currentPosition);
          }
          if (!followTeacher) {
            editorRef.current.setScrollTop(currentScroll);
          }
        });
      }
    }
  }, [liveCode, followTeacher]);

  // Non-intrusive Teacher Cursor Indicator:
  // Uses Monaco line decorations (subtle line highlight) instead of stealing student's cursor!
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !cursorPosition) return;

    requestAnimationFrame(() => {
      try {
        const line = cursorPosition.lineNumber;

        // Apply visual line decoration for teacher's active position
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
          {
            range: new monacoRef.current.Range(line, 1, line, 1),
            options: {
              isWholeLine: true,
              className: 'bg-blue-500/10 border-l-2 border-blue-500',
              glyphMarginClassName: 'text-blue-500',
            },
          },
        ]);

        // Smoothly pan camera only if "Follow Teacher" is active
        if (followTeacher) {
          editorRef.current.revealLineInCenterIfOutsideViewport(line);
        }
      } catch (e) {
        // Line out of bounds guard
      }
    });
  }, [cursorPosition, followTeacher]);

  const handleCopy = () => {
    navigator.clipboard.writeText(liveCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs flex flex-col h-[670px]">
      {/* Top Controls Bar */}
      <div className="px-6 py-3.5 border-b border-slate-200/80 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200/70">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE TEACHER STREAM</span>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            main.c (Read Only)
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setFollowTeacher(!followTeacher)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              followTeacher
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{followTeacher ? 'Following Camera' : 'Free Scroll'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-full shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{onlineCount} Students</span>
          </div>
        </div>
      </div>

      {/* Synchronized Monaco Viewport */}
      <div className="flex-1 w-full relative bg-[#1E1E1E] overflow-hidden">
        {/* Floating Teacher Ghost Cursor Tag */}
        {cursorPosition && (
          <div className="absolute top-3 right-5 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-mono shadow-md backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Teacher at Line {cursorPosition.lineNumber}:{cursorPosition.column}</span>
          </div>
        )}

        <Editor
          height="100%"
          width="100%"
          language="c"
          defaultValue={liveCode}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={MONACO_STUDENT_OPTIONS}
        />

        {!isEditorReady && liveCode && (
          <div className="absolute inset-0 bg-[#1E1E1E] p-4 font-mono text-sm text-slate-200 overflow-auto z-10">
            <pre className="text-emerald-400 font-semibold mb-2 text-xs">// Synchronizing teacher buffer...</pre>
            <pre className="whitespace-pre-wrap">{liveCode}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
