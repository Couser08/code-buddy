import React, { useState } from 'react';
import { Copy, Check, Play, Terminal, Sparkles, Cpu, Clock } from 'lucide-react';
import Editor from '@monaco-editor/react';

export const CodeBlockDemo: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'output'>('editor');
  const [code, setCode] = useState<string>(`#include <stdio.h>

int main() {
    int n = 5;
    printf("Printing C Number Pattern:\\n");
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            printf("%d ", j);
        }
        printf("\\n");
    }
    printf("Execution complete with exit code 0.\\n");
    return 0;
}`);

  const [output, setOutput] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setIsRunning(true);
    setActiveTab('output');
    setOutput('Compiling with gcc -O2 -Wall main.c -o main...\nLinking standard C libraries...\nExecuting binary...\n\n');
    setTimeout(() => {
      setOutput(
        'Compiling with gcc -O2 -Wall main.c -o main...\n' +
        'Linking standard C libraries...\n' +
        'Executing binary...\n\n' +
        'Printing C Number Pattern:\n' +
        '1 \n' +
        '1 2 \n' +
        '1 2 3 \n' +
        '1 2 3 4 \n' +
        '1 2 3 4 5 \n' +
        'Execution complete with exit code 0.\n'
      );
      setIsRunning(false);
    }, 800);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
      {/* Component Badge & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Component 1 • Light Mode Code Block</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Interactive C Code Block & Runner
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Designed matching Image 1 & 2 design language with Monaco syntax engine, copy action & compiler output.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition-colors shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-70"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-white'}`} />
            <span>{isRunning ? 'Running...' : 'Run C Code'}</span>
          </button>
        </div>
      </div>

      {/* Editor / Output Window Container */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-slate-900">
        {/* Window Top Bar */}
        <div className="bg-[#0F172A] px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block" />
            <span className="ml-3 font-mono text-xs text-slate-400 font-medium">pattern.c</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Code Editor
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'output'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>Console Output</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor Tab */}
        {activeTab === 'editor' && (
          <div className="h-64 sm:h-72 w-full">
            <Editor
              height="100%"
              defaultLanguage="c"
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                renderLineHighlight: 'all',
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        )}

        {/* Output Console Tab */}
        {activeTab === 'output' && (
          <div className="h-64 sm:h-72 p-4 font-mono text-xs bg-[#090D16] text-emerald-400 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between text-slate-500 border-b border-slate-800/80 pb-2 mb-2 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                GCC 9.2.0 (x86_64-linux-gnu)
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Time: 0.002s • Memory: 1.4 MB
              </span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">
              {output || 'Click "Run C Code" above to execute and stream stdout/stderr...'}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
