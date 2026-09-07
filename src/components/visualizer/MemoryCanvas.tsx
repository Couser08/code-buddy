import React from 'react';
import { ExecutionStep } from '../../lib/visualizer/cVisualTracer';
import {
  Layers,
  GitBranch,
  ArrowRight,
  CornerDownRight,
  Box,
  CreditCard,
  RotateCw,
  ArrowDown,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryCanvasProps {
  currentStep: ExecutionStep | null;
}

export const MemoryCanvas: React.FC<MemoryCanvasProps> = ({ currentStep }) => {
  if (!currentStep) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs">
        <Box className="w-12 h-12 mb-3 text-slate-400 animate-pulse" />
        <h3 className="text-sm font-bold text-slate-800">Visual Memory Canvas Idle</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Click &quot;Step Next ▶&quot; or &quot;Auto Play&quot; to initialize stack memory and trace variables.
        </p>
      </div>
    );
  }

  const {
    variables,
    pointers,
    arrays,
    structures,
    stackItems,
    queueItems,
    branchState,
    switchState,
    loopState,
    callStack,
  } = currentStep;

  return (
    <div className="flex flex-col h-full bg-slate-50/70 rounded-3xl border border-slate-200/90 p-5 overflow-y-auto text-slate-800 shadow-xs space-y-6">
      {/* Top Status & Call Stack Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-blue-700 rounded-full text-xs font-mono font-bold shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Call Stack: {callStack.length > 0 ? callStack.join(' ➔ ') : 'Terminated (0)'}</span>
          </div>

          <div className="px-2.5 py-1 bg-white border border-slate-200 text-emerald-700 rounded-full text-xs font-mono font-semibold shadow-2xs">
            {variables.length + arrays.length + structures.length} Allocated Items
          </div>
        </div>

        {/* Dynamic Branch / Loop / Switch Indicators */}
        {branchState && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              branchState.evaluatedTo
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>
              Condition ({branchState.condition}): {branchState.evaluatedTo ? 'TRUE' : 'FALSE'}
            </span>
          </div>
        )}

        {switchState && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border bg-purple-50 border-purple-200 text-purple-800">
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>Switch Match: {switchState.matchedCase}</span>
          </div>
        )}

        {loopState && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border bg-amber-50 border-amber-200 text-amber-800">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
            <span>
              Loop #{loopState.iteration}: {loopState.variableName} = {loopState.currentValue} (
              {loopState.conditionMet ? 'Active' : 'Ended'})
            </span>
          </div>
        )}
      </div>

      {/* Special Stack (LIFO) Frame Visualizer Widget */}
      {stackItems && stackItems.length > 0 && (
        <div className="p-4 bg-white border border-blue-200 rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-950">
                Active Call Stack Frame (LIFO - Last In, First Out)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-blue-600 font-bold">
              Depth: {stackItems.length} Frame(s)
            </span>
          </div>

          <div className="flex flex-col-reverse gap-2 max-w-lg mx-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
            {stackItems.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  item.isTop
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm font-bold'
                    : 'bg-white text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono">{item.name}</span>
                  {item.isTop && (
                    <span className="px-2 py-0.5 bg-white text-blue-800 text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse">
                      Top of Stack (TOS)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded text-xs ${item.isTop ? 'bg-blue-700 text-white font-extrabold' : 'bg-slate-100 text-slate-950 font-black'}`}>
                    Val: {String(item.value)}
                  </span>
                  <span className={`text-[10px] ${item.isTop ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.address}
                  </span>
                </div>
              </motion.div>
            ))}
            <div className="text-center text-[10px] text-slate-400 font-mono pt-1">
              ▼ Stack Bottom (Fixed Base Frame)
            </div>
          </div>
        </div>
      )}

      {/* Special Queue Buffer (FIFO) Visualizer Widget */}
      {queueItems && queueItems.length > 0 && (
        <div className="p-4 bg-white border border-emerald-200 rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                Queue Buffer Pipeline (FIFO - First In, First Out)
              </h4>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">
              Sequential Task Queue
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {queueItems.map((q, idx) => (
              <div
                key={q.index}
                className={`flex-1 min-w-[120px] p-3 rounded-xl border text-center transition-all ${
                  q.status === 'dequeued'
                    ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 line-through'
                    : q.status === 'front'
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20 text-emerald-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-[10px] font-mono font-bold mb-1 flex items-center justify-center gap-1">
                  {q.status === 'front' ? (
                    <span className="text-emerald-700 uppercase font-black tracking-wider">
                      ● Front Pointer
                    </span>
                  ) : q.status === 'dequeued' ? (
                    <span className="text-slate-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Dequeued
                    </span>
                  ) : (
                    <span className="text-slate-500">Slot [{q.index}]</span>
                  )}
                </div>
                <div className="text-lg font-black font-mono text-slate-950 my-1">
                  {q.value}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {q.status === 'front' ? 'Next to be served' : q.status === 'dequeued' ? 'Ticket issued' : 'Enqueued in order'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Stack Variables Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-blue-600" />
            <span>Stack Frame (Local Variables)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">Auto LIFO Allocation</span>
        </div>

        {variables.length === 0 ? (
          <div className="p-5 rounded-2xl border border-dashed border-slate-200 bg-white text-center text-xs text-slate-500">
            No scalar variables allocated in stack frame yet.
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
                        ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
                        : 'bg-white border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    {/* Header: Name + Type Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-mono text-slate-900">{v.name}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            isPointer ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {v.type} ({v.byteSize}B)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        {v.address}
                      </span>
                    </div>

                    {/* Value Body */}
                    <div className="bg-slate-100/80 px-3 py-2 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">Value:</span>
                      <span className="font-mono text-sm font-black text-slate-950">
                        {String(v.value)}
                      </span>
                    </div>

                    {/* Pointer Link Indicator */}
                    {matchingLink && (
                      <div className="mt-2 text-[10px] font-mono text-purple-900 bg-purple-50 p-2 rounded-xl border border-purple-200 flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>
                          Points to <strong>&apos;{matchingLink.toVar}&apos;</strong> ({matchingLink.toAddress})
                        </span>
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
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contiguous Arrays (Indexed Memory)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">Linear Index Mapping</span>
          </div>

          <div className="space-y-4">
            {arrays.map((arr) => (
              <div key={arr.name} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">{arr.name}[]</span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      {arr.type} • {arr.elements.length} Elements ({arr.elements.length * arr.elementSize} Bytes)
                    </span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">Base: {arr.baseAddress}</span>
                </div>

                {/* Array Cells Grid */}
                <div className="flex flex-wrap gap-2">
                  {arr.elements.map((elem) => (
                    <div
                      key={elem.index}
                      className="flex-1 min-w-[75px] bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center shadow-2xs"
                    >
                      <div className="text-[10px] font-mono text-slate-500 mb-0.5 font-bold">
                        [{elem.index}]
                      </div>
                      <div className="text-sm font-black font-mono text-slate-950 my-1">
                        {elem.value}
                      </div>
                      <div className="text-[9px] font-mono text-indigo-700 font-semibold bg-indigo-50/70 rounded py-0.5 border border-indigo-100/60">
                        {elem.address}
                      </div>
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
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span>Structures (Composite Packed Records)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">Struct Offset Pack</span>
          </div>

          <div className="space-y-3">
            {structures.map((s) => (
              <div key={s.name} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">
                      struct {s.structType} {s.name}
                    </span>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                      Total: {s.totalSize} Bytes
                    </span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">{s.baseAddress}</span>
                </div>

                {/* Member Fields Table */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {s.members.map((m) => (
                    <div key={m.name} className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1">
                        <span className="font-bold text-slate-700">.{m.name}</span>
                        <span className="text-slate-400">+{m.offset}B</span>
                      </div>
                      <div className="text-xs font-mono font-black text-slate-950">
                        {String(m.value)}
                      </div>
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

