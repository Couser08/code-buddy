import React from 'react';
import { ExecutionStep } from '../../lib/visualizer/cVisualTracer';
import {
  Layers,
  Box,
  CreditCard,
  Grid,
  ArrowRight,
  CornerDownRight,
  GitBranch,
  RotateCw,
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
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <Box className="w-10 h-10 mb-2 text-slate-400 animate-pulse" />
        <h3 className="text-sm font-bold text-slate-800">Visual Memory Idle</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Click &quot;Step Next ▶&quot; or &quot;Auto Play&quot; to initialize variables and trace memory.
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
  } = currentStep;

  // Sort variables by hex address (Lowest address to Highest address)
  const sortedByAddress = [...variables].sort((a, b) => {
    const numA = parseInt(a.address, 16) || 0;
    const numB = parseInt(b.address, 16) || 0;
    return numA - numB;
  });

  const getTypeColor = (type: string) => {
    if (type.includes('*')) return { bg: 'bg-purple-100 text-purple-800 border-purple-200', block: 'bg-purple-50 border-purple-200 text-purple-950' };
    if (type === 'int') return { bg: 'bg-blue-100 text-blue-800 border-blue-200', block: 'bg-blue-50/80 border-blue-200 text-blue-950' };
    if (type === 'float') return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', block: 'bg-emerald-50/80 border-emerald-200 text-emerald-950' };
    if (type === 'char') return { bg: 'bg-pink-100 text-pink-800 border-pink-200', block: 'bg-pink-50/80 border-pink-200 text-pink-950' };
    if (type === 'double') return { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', block: 'bg-indigo-50/80 border-indigo-200 text-indigo-950' };
    return { bg: 'bg-slate-100 text-slate-800 border-slate-200', block: 'bg-slate-50 border-slate-200 text-slate-900' };
  };

  return (
    <div className="h-full flex flex-col justify-between gap-4 overflow-y-auto pr-1">
      {/* 1. Variables (Stack Frame) Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Table Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900">Variables (Stack Frame)</h4>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
            {variables.length} {variables.length === 1 ? 'variable' : 'variables'}
          </span>
        </div>

        {/* Table Content */}
        {variables.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium">
            No scalar variables in stack frame yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100 pb-2">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Size</th>
                  <th className="pb-2 font-medium">Value (Live)</th>
                  <th className="pb-2 font-medium">Memory Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans">
                {variables.map((v) => {
                  const colors = getTypeColor(v.type);
                  const matchingLink = pointers.find((p) => p.fromVar === v.name);

                  return (
                    <tr
                      key={v.name}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        v.highlight ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-2.5 font-mono font-bold text-slate-900">
                        {v.name}
                      </td>

                      {/* Type Badge */}
                      <td className="py-2.5">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${colors.bg}`}
                        >
                          {v.type}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                        {v.byteSize} {v.byteSize === 1 ? 'byte' : 'bytes'}
                      </td>

                      {/* Value (Live) */}
                      <td className="py-2.5">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50/60 border border-blue-200/80 rounded-lg font-mono font-bold text-slate-950 text-xs shadow-2xs">
                          <span>{String(v.value)}</span>
                          {v.type === 'char' && typeof v.value === 'string' && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({v.value.charCodeAt(0) || 65})
                            </span>
                          )}
                        </div>
                        {matchingLink && (
                          <div className="text-[10px] font-mono text-purple-700 mt-1 flex items-center gap-1">
                            <ArrowRight className="w-3 h-3 text-purple-600" />
                            <span>➔ {matchingLink.toVar}</span>
                          </div>
                        )}
                      </td>

                      {/* Memory Address */}
                      <td className="py-2.5 font-mono text-xs text-slate-600 font-medium">
                        {v.address}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Visual View Block (Stack Memory / Pointers / Arrays / Queue / Structs) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900">
              {queueItems && queueItems.length > 0
                ? 'Queue Buffer Pipeline (FIFO)'
                : arrays.length > 0
                ? 'Array Contiguous Memory Layout'
                : structures.length > 0
                ? 'Structures (Packed Composite Records)'
                : 'Stack Memory (Visual View)'}
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400 font-medium">
            Low Address ➔ High Address
          </span>
        </div>

        {/* Content A: If Queue Buffer active */}
        {queueItems && queueItems.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
            {queueItems.map((q) => (
              <div
                key={q.index}
                className={`flex-1 min-w-[100px] p-3 rounded-xl border text-center transition-all ${
                  q.status === 'dequeued'
                    ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 line-through'
                    : q.status === 'front'
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20 text-emerald-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="text-[10px] font-mono font-bold mb-0.5">
                  {q.status === 'front' ? '● Front' : q.status === 'dequeued' ? 'Dequeued' : `[${q.index}]`}
                </div>
                <div className="text-base font-black font-mono text-slate-950 my-0.5">
                  {q.value}
                </div>
                <div className="text-[9px] font-mono text-slate-500">
                  {q.status === 'front' ? 'Served next' : 'Enqueued'}
                </div>
              </div>
            ))}
          </div>
        ) : arrays.length > 0 ? (
          /* Content B: If Contiguous Arrays active */
          <div className="space-y-3">
            {arrays.map((arr) => (
              <div key={arr.name} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-900">{arr.name}[] ({arr.elements.length} elements)</span>
                  <span className="text-slate-400 text-[11px]">Base: {arr.baseAddress}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {arr.elements.map((elem) => (
                    <div
                      key={elem.index}
                      className="flex-1 min-w-[70px] bg-emerald-50/60 border border-emerald-200 rounded-xl p-2 text-center"
                    >
                      <div className="text-[10px] font-mono text-emerald-800 font-bold">[{elem.index}]</div>
                      <div className="text-sm font-black font-mono text-slate-950 my-0.5">{elem.value}</div>
                      <div className="text-[9px] font-mono text-slate-500">{elem.address}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : structures.length > 0 ? (
          /* Content C: If Structs active */
          <div className="space-y-3">
            {structures.map((s) => (
              <div key={s.name} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-900">struct {s.structType} {s.name}</span>
                  <span className="text-slate-400 text-[11px]">Total: {s.totalSize} Bytes</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/80">
                  {s.members.map((m) => (
                    <div key={m.name} className="p-2 bg-white rounded-lg border border-amber-200/70">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-0.5">
                        <span className="font-bold text-amber-900">.{m.name}</span>
                        <span>+{m.offset}B</span>
                      </div>
                      <div className="text-xs font-mono font-black text-slate-950">{String(m.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Content D: Standard Contiguous Stack Memory Cells ordered Low -> High Address */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {sortedByAddress.length === 0 ? (
              <div className="col-span-4 py-4 text-center text-xs text-slate-400 font-medium">
                No active memory cells allocated.
              </div>
            ) : (
              sortedByAddress.map((v) => {
                const colors = getTypeColor(v.type);
                return (
                  <motion.div
                    key={v.name}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-3 rounded-xl border text-center transition-all ${colors.block} ${
                      v.highlight ? 'ring-2 ring-blue-400/40 shadow-xs' : 'shadow-2xs'
                    }`}
                  >
                    <div className="font-mono font-bold text-xs text-slate-950 truncate">
                      {v.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                      {v.byteSize} {v.byteSize === 1 ? 'byte' : 'bytes'}
                    </div>
                    <div className="text-[10px] font-mono text-slate-600 font-bold mt-1 bg-white/80 rounded py-0.5 border border-slate-200/60">
                      {v.address}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
