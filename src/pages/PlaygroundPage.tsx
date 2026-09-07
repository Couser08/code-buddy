import React, { useState, useRef, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { SplitOutputPanel } from '../components/live/SplitOutputPanel';
import { executeCodeOnJudge0, EnhancedExecutionResult } from '../lib/judge0';
import { usePerformanceStore } from '../stores/performanceStore';
import {
  Code2,
  Play,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  BookOpen,
  ChevronDown
} from 'lucide-react';

const STARTER_TEMPLATES: Record<string, { title: string; code: string; defaultStdin?: string; desc: string }> = {
  hello: {
    title: 'Hello World & Syntax',
    desc: 'Basic C program structure and output stream',
    code: `#include <stdio.h>

int main() {
    printf("Welcome to C Playground!\\n");
    printf("Write, compile, and execute C code instantly.\\n");
    return 0;
}`,
  },
  scanf: {
    title: 'Interactive Scanf (Stdin)',
    desc: 'Reading multiple inputs using scanf()',
    defaultStdin: '25 40',
    code: `#include <stdio.h>

int main() {
    int a, b;
    printf("Enter two numbers separated by space: ");
    if (scanf("%d %d", &a, &b) == 2) {
        printf("\\nReceived: a = %d, b = %d\\n", a, b);
        printf("Sum = %d\\n", a + b);
        printf("Product = %d\\n", a * b);
    } else {
        printf("\\nError reading input numbers.\\n");
    }
    return 0;
}`,
  },
  pattern: {
    title: 'Nested Loops: Number Pattern',
    desc: 'For loop iterations and pattern printing',
    code: `#include <stdio.h>

int main() {
    int rows = 5;
    printf("Printing C Number Triangle Pattern:\\n");
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= i; j++) {
            printf("%d ", j);
        }
        printf("\\n");
    }
    return 0;
}`,
  },
  pointers: {
    title: 'Pointers & Dynamic Memory',
    desc: 'Memory allocation with malloc(), sizeof(), and free()',
    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    int *arr = (int*)malloc(n * sizeof(int));

    if (arr == NULL) {
        printf("Memory allocation failed!\\n");
        return 1;
    }

    for (int i = 0; i < n; i++) {
        arr[i] = (i + 1) * 10;
    }

    printf("Dynamically allocated array elements:\\n");
    for (int i = 0; i < n; i++) {
        printf("arr[%d] = %d at address %p\\n", i, *(arr + i), (void*)(arr + i));
    }

    // Always free allocated heap memory
    free(arr);
    printf("\\nMemory freed successfully.\\n");
    return 0;
}`,
  },
  structs: {
    title: 'Structures & Data Records',
    desc: 'Custom data types with struct definitions',
    code: `#include <stdio.h>
#include <string.h>

struct Student {
    char name[50];
    int rollNo;
    float marks;
};

int main() {
    struct Student s1;
    strcpy(s1.name, "Rahul");
    s1.rollNo = 101;
    s1.marks = 98.5;

    printf("Student Record:\\n");
    printf("Name: %s\\n", s1.name);
    printf("Roll No: %d\\n", s1.rollNo);
    printf("Marks: %.1f%%\\n", s1.marks);
    return 0;
}`,
  },
};

export const PlaygroundPage: React.FC = () => {
  const isLiteMode = usePerformanceStore((s) => s.isLiteMode);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('hello');
  const [code, setCode] = useState<string>(STARTER_TEMPLATES['hello'].code);
  const codeRef = useRef<string>(STARTER_TEMPLATES['hello'].code);
  const [stdin, setStdin] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<EnhancedExecutionResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const monacoOptions = useMemo(() => ({
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
    minimap: { enabled: !isLiteMode, side: 'right' as const },
    lineNumbers: 'on' as const,
    automaticLayout: true,
    tabSize: 4,
    padding: { top: 14, bottom: 14 },
    renderLineHighlight: 'all' as const,
    cursorBlinking: isLiteMode ? ('solid' as const) : ('blink' as const),
    cursorSmoothCaretAnimation: isLiteMode ? ('off' as const) : ('on' as const),
    cursorStyle: 'line' as const,
    cursorWidth: 2,
    wordWrap: 'on' as const,
    smoothScrolling: !isLiteMode,
  }), [isLiteMode]);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Keyboard shortcut: Ctrl+Enter / Cmd+Enter
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });
  };

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    const tpl = STARTER_TEMPLATES[key];
    codeRef.current = tpl.code;
    setCode(tpl.code);
    if (editorRef.current) {
      editorRef.current.setValue(tpl.code);
    }
    setStdin(tpl.defaultStdin || '');
    setOutput(null);
  };

  const handleCodeChange = (val: string | undefined) => {
    codeRef.current = val || '';
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;
    try {
      const result = await executeCodeOnJudge0(currentCode, 50, stdin);
      setOutput(result);

      // Red line errors in Monaco
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const markers = (result.errorMarkers || []).map((m) => ({
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
          monacoRef.current.editor.setModelMarkers(model, 'gcc', markers);
        }
      }
    } catch (err: any) {
      setOutput({
        stderr: err.message || 'Execution error',
        status: { id: 11, description: 'Error' },
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'practice.c';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1700px] mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Playground Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl px-7 py-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Title */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">
              Free C Practice Sandbox
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
            C Compiler & Practice IDE
          </h1>
        </div>

        {/* Action Controls & Starter Templates */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Template Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedTemplateKey}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs transition-colors"
            >
              {Object.entries(STARTER_TEMPLATES).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download .c */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Download practice.c"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export .c</span>
          </button>

          {/* Reset Template */}
          <button
            onClick={() => handleSelectTemplate(selectedTemplateKey)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Reset code to template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 60/40 Split Screen Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Side: Monaco C Editor (7 cols on XL) */}
        <div className="xl:col-span-7 bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs flex flex-col h-[670px]">
          <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">practice.c</span>
              <span className="text-[11px] font-mono text-slate-400">GCC 10.2.0 • ISO C11</span>
            </div>
            <span className="text-[11px] text-slate-400">Press <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono text-[10px]">Ctrl+Enter</kbd> to run</span>
          </div>

          <div className="flex-1 w-full bg-[#1E1E1E] overflow-hidden">
            <Editor
              height="100%"
              width="100%"
              language="c"
              defaultValue={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={monacoOptions}
            />
          </div>
        </div>

        {/* Right Side: Split Terminal & Stdin Output (5 cols on XL) */}
        <div className="xl:col-span-5">
          <SplitOutputPanel
            isRunning={isRunning}
            onRunCode={handleRunCode}
            output={output}
            stdin={stdin}
            onStdinChange={setStdin}
            onClearOutput={() => setOutput(null)}
            code={codeRef.current || code}
          />
        </div>
      </div>
    </div>
  );
};
