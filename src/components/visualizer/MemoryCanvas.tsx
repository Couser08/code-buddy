import React from 'react';
import { ExecutionStep } from '../../lib/visualizer/cVisualTracer';
import { Layers, GitBranch, ArrowRight, CornerDownRight, Box, CreditCard, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryCanvasProps {
  currentStep: ExecutionStep | null;
}

export const MemoryCanvas: React.FC<MemoryCanvasProps> = ({ currentStep }) => {
  if (!currentStep) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
        <Box className="w-12 h-12 mb-3 text-slate-600 animate-pulse" />
        <h3 className="text-sm font-bold text-slate-300">Memory Canvas Idle</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Click &quot;Step Next ▶&quot; or &quot;Auto Play&quot; to initialize stack memory and trace variables.
        </p>
      </div>
    );
  }

  const { variables, pointers, arrays, structures, branchState, switchState, loopState, callStack } = currentStep;

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] rounded-3xl border border-slate-800/80 p-5 overflow-y-auto text-slate-100 shadow-xl space-y-6">
      {/* Top Status & Call Stack Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-mono font-bold">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Call Stack: {callStack.length > 0 ? callStack.join(' ➔ ') : 'Terminated (0)'}</span>
          </div>

          <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-semibold">
            {variables.length + arrays.length + structures.length} Allocated Items
          </div>
        </div>

        {/* Dynamic Branch / Loop Indicator */}
        {branchState && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            branchState.evaluatedTo
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <GitBranch className="w-3.5 h-3.5" />
            <span>Condition ({branchState.condition}): {branchState.evaluatedTo ? 'TRUE' : 'FALSE'}</span>
          </div>
        )}

        {switchState && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border bg-purple-500/10 border-purple-500/30 text-purple-400">
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>Switch Match: {switchState.matchedCase}</span>
          </div>
        )}

        {loopState && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border bg-amber-500/10 border-amber-500/30 text-amber-400">
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
            <span>Loop #{loopState.iteration}: {loopState.variableName} = {loopState.currentValue} ({loopState.conditionMet ? 'Active' : 'Ended'})</span>
          </div>
        )}
      </div>

      {/* 1. Stack Variables Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-blue-400" />
            <span>Stack Frame (Local Variables)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">Auto LIFO Allocation</span>
        </div>

        {variables.length === 0 ? (
          <div className="p-4 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
            No scalar variables in stack frame yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {variables.map((v) => {
                const isPointer = v.type.includes('*');
                const matchingLink = pointers.find((p) => p.fromVar === v.name);

                return (
                  <motion.div
                    key={v.name}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`relative p-3.5 rounded-2xl border transition-all ${
                      v.highlight
                        ? 'bg-blue-950/30 border-blue-500/60 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    {/* Header: Name + Type Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-mono text-white">{v.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isPointer ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {v.type} ({v.byteSize}B)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{v.address}</span>
                    </div>

                    {/* Value Body */}
                    <div className="bg-[#080C14] px-3 py-2 rounded-xl border border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">Value:</span>
                      <span className={`font-mono text-sm font-extrabold ${
                        isPointer ? 'text-purple-400' : 'text-emerald-400'
                      }`}>
                        {String(v.value)}
                      </span>
                    </div>

                    {/* Pointer Link Indicator */}
                    {matchingLink && (
                      <div className="mt-2 text-[10px] font-mono text-purple-300 bg-purple-950/40 p-1.5 rounded-lg border border-purple-500/30 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-purple-400 shrink-0" />
                        <span>Points to &apos;{matchingLink.toVar}&apos; ({matchingLink.toAddress})</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 2. Contiguous Arrays Section */}
      {arrays.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contiguous Arrays (Indexed Memory)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">Linear Index Mapping</span>
          </div>

          <div className="space-y-4">
            {arrays.map((arr) => (
              <div key={arr.name} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-sm">{arr.name}[]</span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                      {arr.type} • {arr.elements.length} Elements ({arr.elements.length * arr.elementSize} Bytes)
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">Base: {arr.baseAddress}</span>
                </div>

                {/* Array Cells Grid */}
                <div className="flex flex-wrap gap-2">
                  {arr.elements.map((elem) => (
                    <div
                      key={elem.index}
                      className="flex-1 min-w-[70px] bg-[#080C14] border border-slate-700/80 rounded-xl p-2 text-center"
                    >
                      <div className="text-[10px] font-mono text-slate-400 mb-0.5">[{elem.index}]</div>
                      <div className="text-sm font-extrabold font-mono text-emerald-400 my-1">{elem.value}</div>
                      <div className="text-[9px] font-mono text-slate-400">{elem.address}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Structures (struct) Section */}
      {structures.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Structures (Composite Packed Records)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">Struct Offset Pack</span>
          </div>

          <div className="space-y-3">
            {structures.map((s) => (
              <div key={s.name} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">struct {s.structType} {s.name}</span>
                    <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                      Total: {s.totalSize} Bytes
                    </span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">{s.baseAddress}</span>
                </div>

                {/* Member Fields Table */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#080C14] p-2.5 rounded-xl border border-slate-800/80">
                  {s.members.map((m) => (
                    <div key={m.name} className="p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span>.{m.name}</span>
                        <span className="text-slate-400">+{m.offset}B</span>
                      </div>
                      <div className="text-xs font-mono font-extrabold text-amber-300">{String(m.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
