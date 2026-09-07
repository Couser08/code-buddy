import React, { useState } from 'react';
import { FolderGit2, BookOpen, Terminal, Code, Cpu, ExternalLink, Copy, Check } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const gccFlags = [
    { flag: '-Wall', desc: 'Enable all standard compiler warning diagnostics' },
    { flag: '-Wextra', desc: 'Enable extra warning flags for subtle logical flaws' },
    { flag: '-O2', desc: 'Optimize code for maximum speed and instruction pipeline efficiency' },
    { flag: '-g', desc: 'Include debugging symbols for GDB and Valgrind memory inspection' },
    { flag: '-std=c11', desc: 'Target the ISO C11 programming language standard' },
  ];

  const headerFiles = [
    { name: '<stdio.h>', desc: 'Standard I/O: printf, scanf, fopen, fgets, perror' },
    { name: '<stdlib.h>', desc: 'General utilities: malloc, calloc, realloc, free, exit, atoi' },
    { name: '<string.h>', desc: 'String operations: strlen, strcpy, strcmp, strcat, memcpy' },
    { name: '<math.h>', desc: 'Mathematical functions: sqrt, pow, sin, cos, ceil, floor' },
    { name: '<stdbool.h>', desc: 'Boolean type definitions: bool, true, false' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-2">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Curated Documentation</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            C Programming Resources & Cheat Sheets
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Essential GCC compilation flags, standard library headers, pointers, and memory layout references.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GCC Compiler Cheat Sheet */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Essential GCC Compiler Flags</h3>
          </div>

          <div className="space-y-3">
            {gccFlags.map((item) => (
              <div
                key={item.flag}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between group"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {item.flag}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>

                <button
                  onClick={() => handleCopy(item.flag, item.flag)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
                >
                  {copiedId === item.flag ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Standard C Libraries */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-base">Standard Library Headers</h3>
          </div>

          <div className="space-y-3">
            {headerFiles.map((lib) => (
              <div
                key={lib.name}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between group"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    #include {lib.name}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">{lib.desc}</p>
                </div>

                <button
                  onClick={() => handleCopy(lib.name, `#include ${lib.name}`)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
                >
                  {copiedId === lib.name ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
