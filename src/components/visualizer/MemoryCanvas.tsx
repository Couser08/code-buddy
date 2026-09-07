import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionStep } from '../../lib/visualizer/cVisualTracer';
import {
  Box,
  ArrowRight,
  Layers,
  Users,
  Grid3X3,
  CreditCard,
  RotateCcw,
  GitBranch,
  LayoutList,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Cpu,
  Database,
  Zap,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface MemoryCanvasProps {
  currentStep: ExecutionStep | null;
  topicId?: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  int:    { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-900',   bar: 'bg-blue-500' },
  float:  { bg: 'bg-emerald-50',border: 'border-emerald-300',text: 'text-emerald-900',bar: 'bg-emerald-500' },
  char:   { bg: 'bg-pink-50',   border: 'border-pink-300',   text: 'text-pink-900',   bar: 'bg-pink-500' },
  double: { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-900', bar: 'bg-indigo-500' },
  ptr:    { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', bar: 'bg-purple-500' },
  default:{ bg: 'bg-slate-50',  border: 'border-slate-300',  text: 'text-slate-900',  bar: 'bg-slate-400' },
};

function getTypeColor(type: string) {
  if (type.includes('*')) return TYPE_COLORS.ptr;
  return TYPE_COLORS[type] ?? TYPE_COLORS.default;
}

function ByteRuler({ bytes }: { bytes: number }) {
  return (
    <div className="flex items-center gap-0 h-3 mt-1.5">
      {Array.from({ length: bytes }).map((_, i) => (
        <div key={i} className={`h-3 flex-1 border-r border-slate-300 ${i === 0 ? 'border-l' : ''} bg-slate-100`} />
      ))}
      <span className="ml-1 text-[9px] font-mono text-slate-400">{bytes}B</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint }: { icon: any; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-[220px] leading-relaxed">{hint}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// 1. Variables & Data Types — Memory Shelf
// ─────────────────────────────────────────────
function VariablesCanvas({ step }: { step: ExecutionStep }) {
  const vars = step.variables;
  if (!vars.length) return <EmptyState icon={Box} title="Memory Shelf Empty" hint="Step forward to allocate variables on the stack frame." />;

  const typeOrder = ['char','int','float','double'];

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {typeOrder.map(t => {
          const c = TYPE_COLORS[t];
          return (
            <div key={t} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold ${c.bg} ${c.border} ${c.text}`}>
              <span className={`w-2 h-2 rounded-sm ${c.bar}`} />
              {t}
            </div>
          );
        })}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold ${TYPE_COLORS.ptr.bg} ${TYPE_COLORS.ptr.border} ${TYPE_COLORS.ptr.text}`}>
          <span className={`w-2 h-2 rounded-sm ${TYPE_COLORS.ptr.bar}`} />
          pointer
        </div>
      </div>

      {/* Memory Shelf Row */}
      <div className="flex-1 flex flex-col justify-center gap-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5" />
          Stack Frame — RAM Shelf (Low → High Address)
        </div>
        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {vars.map((v, idx) => {
              const c = getTypeColor(v.type);
              return (
                <motion.div
                  key={v.name}
                  initial={{ opacity: 0, scale: 0.85, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`flex flex-col rounded-2xl border-2 ${c.bg} ${c.border} p-3 min-w-[100px] shadow-sm relative ${v.highlight ? 'ring-2 ring-blue-400/40' : ''}`}
                >
                  {v.highlight && (
                    <span className="absolute -top-2 left-2 text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">NEW</span>
                  )}
                  {/* Variable name */}
                  <span className={`font-mono font-extrabold text-sm ${c.text}`}>{v.name}</span>
                  {/* Value */}
                  <span className={`font-mono font-black text-xl mt-1 ${c.text}`}>{String(v.value)}</span>
                  {/* Type badge */}
                  <span className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-md self-start ${c.bar} text-white`}>{v.type}</span>
                  {/* Byte ruler */}
                  <ByteRuler bytes={v.byteSize} />
                  {/* Address */}
                  <span className="text-[10px] font-mono text-slate-400 mt-1.5">{v.address}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Address ruler */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-mono text-slate-400">LOW 0x7ffd00</span>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-300 via-slate-300 to-indigo-300" />
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-[10px] font-mono text-slate-400">HIGH 0x7fffxx</span>
        </div>

        {/* Summary row */}
        <div className="flex flex-wrap gap-2 mt-1">
          {vars.map(v => (
            <div key={v.name} className="flex items-center gap-1 text-[11px] font-mono bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
              <span className="font-bold text-slate-700">{v.name}</span>
              <span className="text-slate-400">=</span>
              <span className="font-bold text-blue-700">{String(v.value)}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">{v.address}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. Pointers — SVG Arrow Diagram
// ─────────────────────────────────────────────
function PointersCanvas({ step }: { step: ExecutionStep }) {
  const vars = step.variables;
  const pointers = step.pointers;

  if (!vars.length) return <EmptyState icon={ArrowRight} title="Pointer Diagram Empty" hint="Step forward to see pointer arrows linking to target variables in RAM." />;

  const normalVars = vars.filter(v => !v.type.includes('*'));
  const ptrVars = vars.filter(v => v.type.includes('*'));

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Database className="w-3.5 h-3.5" />
        Pointer Address Map — Zero-Copy Reference Architecture
      </div>

      <div className="flex-1 flex flex-col gap-6 justify-center">
        {/* Normal variables row */}
        {normalVars.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Target Variables (Actual Data in RAM)</div>
            <div className="flex flex-wrap gap-3">
              {normalVars.map((v, idx) => {
                const isPointed = pointers.some(p => p.toVar === v.name);
                return (
                  <motion.div
                    key={v.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className={`rounded-2xl border-2 p-3 min-w-[100px] flex flex-col ${
                      isPointed
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30 shadow-md'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {isPointed && (
                      <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full self-start mb-1">← POINTED</span>
                    )}
                    <span className="font-mono font-extrabold text-sm text-slate-900">{v.name}</span>
                    <span className="font-mono font-black text-xl text-slate-950 mt-1">{String(v.value)}</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md self-start mt-1">{v.type}</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-1.5">{v.address}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Animated pointer arrows */}
        {pointers.length > 0 && (
          <div className="flex flex-col gap-2">
            {pointers.map((p, idx) => (
              <motion.div
                key={`${p.fromVar}-${p.toVar}`}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: idx * 0.1 + 0.15 }}
                className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5"
              >
                <div className="font-mono font-extrabold text-purple-900 text-sm">{p.fromVar}</div>
                <div className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">stores address</div>
                <div className="text-purple-400 font-bold text-lg">→</div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] bg-purple-100 px-2 py-1 rounded-lg">
                  <span className="text-purple-600 font-bold">&amp;{p.toVar}</span>
                  <span className="text-purple-400">=</span>
                  <span className="font-bold text-purple-900">{p.toAddress}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-500" />
                <div className="font-mono font-extrabold text-emerald-900 text-sm">{p.toVar}</div>
                <div className="font-mono font-black text-emerald-700">= {p.targetValue}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pointer variables */}
        {ptrVars.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Pointer Variables (Hold Addresses, NOT Data)</div>
            <div className="flex flex-wrap gap-3">
              {ptrVars.map((v, idx) => (
                <motion.div
                  key={v.name}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.07 + 0.2 }}
                  className="rounded-2xl border-2 bg-purple-50 border-purple-300 p-3 min-w-[110px] flex flex-col"
                >
                  <span className="text-[9px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded-full self-start mb-1">POINTER</span>
                  <span className="font-mono font-extrabold text-sm text-purple-900">{v.name}</span>
                  <span className="font-mono text-xs text-purple-700 mt-0.5 font-bold">{String(v.value)}</span>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md self-start mt-1">{v.type}</span>
                  <span className="text-[10px] font-mono text-slate-400 mt-1.5">{v.address} (8B)</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. Stack (LIFO) — Animated Vertical Tower
// ─────────────────────────────────────────────
function StackCanvas({ step }: { step: ExecutionStep }) {
  const items = step.stackItems ?? step.variables.map((v, idx, arr) => ({
    id: v.name, name: v.name, value: v.value, address: v.address,
    isTop: idx === arr.length - 1,
  }));

  if (!items.length) return <EmptyState icon={Layers} title="Stack Tower Empty" hint="Step forward to push variables onto the LIFO call stack." />;

  const reversed = [...items].reverse(); // Show top at top visually

  return (
    <div className="h-full flex gap-6">
      {/* Tower */}
      <div className="flex flex-col justify-end flex-1 gap-1.5 min-w-0">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-1">
          <Layers className="w-3.5 h-3.5" />
          LIFO Stack Tower — Top of Stack = Last Pushed
        </div>

        {/* RSP indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-1 bg-amber-100 border border-amber-300 rounded-lg text-[11px] font-mono font-bold text-amber-800 flex items-center gap-1.5">
            <Cpu className="w-3 h-3" /> RSP (Stack Pointer) → Top: {items[items.length - 1]?.name}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <AnimatePresence>
            {reversed.map((item, idx) => {
              const isTop = item.isTop;
              return (
                <motion.div
                  key={item.id}
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 60, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, delay: idx * 0.04 }}
                  className={`relative flex items-center gap-4 px-5 py-3 rounded-xl border-2 ${
                    isTop
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {isTop && (
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute -right-8 text-[10px] font-bold text-blue-600 flex items-center gap-1"
                    >
                      <ChevronRight className="w-4 h-4" /> TOP
                    </motion.div>
                  )}
                  <div className={`font-mono text-xs ${isTop ? 'text-blue-200' : 'text-slate-400'}`}>
                    DEPTH {reversed.length - idx}
                  </div>
                  <div className={`font-mono font-bold text-sm ${isTop ? 'text-white' : 'text-slate-900'}`}>{item.name}</div>
                  <div className={`font-mono font-black text-xl flex-1 text-right ${isTop ? 'text-white' : 'text-slate-900'}`}>{item.value}</div>
                  <div className={`font-mono text-[10px] ${isTop ? 'text-blue-200' : 'text-slate-400'}`}>{item.address}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Stack base */}
        <div className="w-full h-2 bg-slate-800 rounded-b-xl mt-1" />
        <div className="text-[10px] text-center font-mono text-slate-400 mt-1">▲ Stack grows upward | Base @ 0x7ffd00</div>
      </div>

      {/* Side legend */}
      <div className="flex flex-col gap-3 text-[11px] font-medium text-slate-600 w-36 shrink-0 pt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="font-bold text-blue-800 mb-1">PUSH (Allocate)</div>
          <div className="text-[10px] text-blue-600 leading-relaxed">New variable added to top. RSP moves up.</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="font-bold text-red-800 mb-1">POP (Free)</div>
          <div className="text-[10px] text-red-600 leading-relaxed">Function returns: RSP moves back, memory freed.</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="font-bold text-amber-800 mb-1">LIFO Rule</div>
          <div className="text-[10px] text-amber-700 leading-relaxed">Last pushed = First popped. No gaps possible.</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. Queue (FIFO) — Conveyor Pipeline
// ─────────────────────────────────────────────
function QueueCanvas({ step }: { step: ExecutionStep }) {
  const items = step.queueItems;
  if (!items?.length) return <EmptyState icon={Users} title="Queue Pipeline Empty" hint="Step forward to enqueue items in the FIFO pipeline." />;

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Users className="w-3.5 h-3.5" />
        FIFO Queue — Conveyor Belt Pipeline
      </div>

      {/* FIFO conveyor */}
      <div className="flex items-stretch gap-0 bg-slate-100 border border-slate-300 rounded-2xl overflow-hidden p-2">
        {/* ENQUEUE side label */}
        <div className="flex flex-col items-center justify-center pr-3 border-r border-slate-300 mr-3">
          <ChevronRight className="w-4 h-4 text-blue-500" />
          <div className="text-[9px] font-bold text-blue-600 rotate-90 mt-2 whitespace-nowrap">ENQUEUE →</div>
        </div>

        {/* Items */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto py-1">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={item.index}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -80, opacity: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`flex flex-col items-center rounded-2xl border-2 px-4 py-3 min-w-[80px] shrink-0 ${
                  item.status === 'dequeued'
                    ? 'bg-slate-100 border-slate-200 opacity-40'
                    : item.status === 'front'
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/50 shadow-md'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1 ${
                  item.status === 'front' ? 'bg-emerald-600 text-white' :
                  item.status === 'dequeued' ? 'bg-slate-300 text-slate-500 line-through' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {item.status === 'front' ? '● FRONT' : item.status === 'dequeued' ? 'SERVED' : `#${item.index}`}
                </div>
                <div className="font-mono font-black text-2xl text-slate-950">{item.value}</div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">[{item.index}]</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* DEQUEUE side label */}
        <div className="flex flex-col items-center justify-center pl-3 border-l border-slate-300 ml-3">
          <div className="text-[9px] font-bold text-red-600 -rotate-90 mb-2 whitespace-nowrap">← DEQUEUE</div>
          <ChevronRight className="w-4 h-4 text-red-500 rotate-180" />
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold text-emerald-700 uppercase">Front (NEXT SERVED)</div>
          <div className="font-mono font-black text-xl text-emerald-900 mt-1">
            {items.find(i => i.status === 'front')?.value ?? '—'}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold text-blue-700 uppercase">Queue Size</div>
          <div className="font-mono font-black text-xl text-blue-900 mt-1">
            {items.filter(i => i.status !== 'dequeued').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold text-red-700 uppercase">Served (Dequeued)</div>
          <div className="font-mono font-black text-xl text-red-900 mt-1">
            {items.filter(i => i.status === 'dequeued').length}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span><strong>FIFO Rule:</strong> First element enqueued is served first. Used in OS schedulers, TCP packet buffers, keyboard input streams.</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 5. Arrays — Train Coach Layout
// ─────────────────────────────────────────────
function ArraysCanvas({ step }: { step: ExecutionStep }) {
  const arrays = step.arrays;
  if (!arrays.length) return <EmptyState icon={Grid3X3} title="Array Coach Empty" hint="Step forward to allocate the contiguous array in memory." />;

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Grid3X3 className="w-3.5 h-3.5" />
        Contiguous Array — Train Coach Memory Layout
      </div>

      {arrays.map(arr => (
        <div key={arr.name} className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="font-extrabold text-slate-900">{arr.name}[{arr.elements.length}]</span>
            <span className="text-slate-400">type: {arr.type}</span>
            <span className="text-slate-400">base: {arr.baseAddress}</span>
            <span className="text-slate-400">each: {arr.elementSize}B</span>
          </div>

          {/* Train coaches */}
          <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
            {arr.elements.map((elem, idx) => (
              <React.Fragment key={elem.index}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className={`flex flex-col items-center min-w-[80px] border-2 rounded-none first:rounded-l-2xl last:rounded-r-2xl px-4 py-4 ${
                    elem.highlight ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-slate-200'
                  } ${idx === 0 ? '' : 'border-l-0'}`}
                >
                  <div className={`text-[10px] font-bold rounded-md px-1.5 py-0.5 mb-2 ${elem.highlight ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    [{elem.index}]
                  </div>
                  <div className="font-mono font-black text-2xl text-slate-950">{elem.value}</div>
                  <div className="text-[9px] font-mono text-slate-400 mt-2">{elem.address}</div>
                </motion.div>
                {idx < arr.elements.length - 1 && (
                  <div className="flex flex-col items-center justify-center w-8 shrink-0 bg-slate-50 border-t-2 border-b-2 border-slate-200">
                    <div className="text-[8px] font-mono text-slate-400">+{arr.elementSize}B</div>
                    <ArrowRight className="w-3 h-3 text-slate-300" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Address ruler */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {arr.elements.map((elem, idx) => (
              <React.Fragment key={idx}>
                <div className="text-[9px] font-mono text-slate-400 whitespace-nowrap">{elem.address}</div>
                {idx < arr.elements.length - 1 && <div className="h-px flex-1 min-w-[16px] bg-slate-200" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
        <Zap className="w-3.5 h-3.5 text-blue-500" />
        <span><strong>Cache Locality:</strong> Contiguous memory → CPU L1/L2 cache loads entire array in one prefetch (10x faster than linked list).</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 6. Structures — ID Card Record Layout
// ─────────────────────────────────────────────
function StructuresCanvas({ step }: { step: ExecutionStep }) {
  const structs = step.structures;
  if (!structs.length) return <EmptyState icon={CreditCard} title="No Struct Allocated" hint="Step forward to create the structure variable in memory." />;

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <CreditCard className="w-3.5 h-3.5" />
        Struct — Packed Composite Memory Record (ID Card Layout)
      </div>

      {structs.map(s => (
        <motion.div
          key={s.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
        >
          {/* Card decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-600/10 rounded-full translate-y-12 -translate-x-12" />

          {/* Header */}
          <div className="flex items-start justify-between mb-5 relative">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">struct {s.structType}</div>
              <div className="font-mono font-extrabold text-xl text-white">{s.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Base Address</div>
              <div className="font-mono text-xs font-bold text-blue-300">{s.baseAddress}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Total: {s.totalSize}B</div>
            </div>
          </div>

          {/* Members as memory compartments */}
          <div className="flex gap-1 relative">
            {s.members.map((m, idx) => {
              const memberColors = ['bg-blue-600','bg-emerald-600','bg-pink-600','bg-amber-600'];
              const color = memberColors[idx % memberColors.length];
              return (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex-1 ${color}/10 border border-white/10 rounded-xl p-3`}
                >
                  <div className={`text-[9px] font-bold ${color === 'bg-blue-600' ? 'text-blue-300' : color === 'bg-emerald-600' ? 'text-emerald-300' : color === 'bg-pink-600' ? 'text-pink-300' : 'text-amber-300'} uppercase tracking-wider mb-1`}>
                    .{m.name}
                  </div>
                  <div className="font-mono font-black text-lg text-white">{String(m.value)}</div>
                  <div className="text-[9px] font-mono text-slate-400 mt-1">{m.type}</div>
                  <div className="text-[9px] font-mono text-slate-500">+{m.offset}B offset</div>
                </motion.div>
              );
            })}
          </div>

          {/* Binary packing ruler */}
          <div className="mt-4 flex gap-0 rounded-lg overflow-hidden">
            {s.members.map((m, idx) => {
              const widths = [4, 20, 4]; // rough byte proportions for display
              const barColors = ['bg-blue-500', 'bg-emerald-500', 'bg-pink-500', 'bg-amber-500'];
              const widthPercent = [(4/28)*100, (20/28)*100, (4/28)*100];
              return (
                <div
                  key={m.name}
                  className={`h-3 ${barColors[idx % barColors.length]} flex items-center justify-center`}
                  style={{ width: `${widthPercent[idx] ?? 30}%` }}
                  title={`.${m.name} (${m.type}) @ +${m.offset}B`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>{s.baseAddress}</span>
            <span>← {s.totalSize} bytes total →</span>
            <span>0x{(parseInt(s.baseAddress, 16) + s.totalSize).toString(16)}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// 7. Loops — Iteration Wheel + Counter
// ─────────────────────────────────────────────
function LoopsCanvas({ step }: { step: ExecutionStep }) {
  const ls = step.loopState;
  const vars = step.variables;

  if (!ls) return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <RotateCcw className="w-3.5 h-3.5" />
        Loop Iteration Tracker — Deterministic Repetition
      </div>
      <EmptyState icon={RotateCcw} title="Loop Not Started" hint="Step forward to begin loop iteration visualization." />
    </div>
  );

  const maxIter = 4;
  const progress = Math.min(ls.iteration / maxIter, 1);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <RotateCcw className="w-3.5 h-3.5" />
        {ls.loopType.toUpperCase()} Loop — Iteration #{ls.iteration}
      </div>

      <div className="flex gap-4 flex-1">
        {/* Main iteration counter display */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Counter card */}
          <div className={`rounded-2xl border-2 p-6 text-center ${ls.conditionMet ? 'bg-blue-50 border-blue-400' : 'bg-red-50 border-red-400'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${ls.conditionMet ? 'text-blue-600' : 'text-red-600'}`}>
              Loop Counter Variable
            </div>
            <div className={`font-mono font-black text-6xl ${ls.conditionMet ? 'text-blue-900' : 'text-red-900'}`}>
              {ls.currentValue}
            </div>
            <div className={`font-mono font-bold text-sm mt-2 ${ls.conditionMet ? 'text-blue-700' : 'text-red-700'}`}>
              {ls.variableName}
            </div>
          </div>

          {/* Condition gate */}
          <div className={`flex items-center gap-3 rounded-2xl border-2 p-4 ${ls.conditionMet ? 'bg-emerald-50 border-emerald-400' : 'bg-red-50 border-red-400'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${ls.conditionMet ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {ls.conditionMet ? <CheckCircle2 className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
            </div>
            <div>
              <div className={`text-[10px] font-bold uppercase ${ls.conditionMet ? 'text-emerald-700' : 'text-red-700'}`}>
                Condition: {ls.conditionMet ? 'TRUE — Loop Body Executes' : 'FALSE — Loop Terminated'}
              </div>
              <div className={`font-mono font-bold text-sm mt-0.5 ${ls.conditionMet ? 'text-emerald-900' : 'text-red-900'}`}>
                {ls.conditionText}
              </div>
            </div>
          </div>

          {/* Iteration track dots */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-medium">Iteration history:</span>
            {Array.from({ length: maxIter }).map((_, idx) => (
              <motion.div
                key={idx}
                initial={false}
                animate={{
                  scale: idx + 1 === ls.iteration ? 1.3 : 1,
                  backgroundColor: idx + 1 < ls.iteration ? '#3b82f6' : idx + 1 === ls.iteration ? (ls.conditionMet ? '#3b82f6' : '#ef4444') : '#e2e8f0',
                }}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-white"
                style={{ borderColor: idx + 1 <= ls.iteration ? (ls.conditionMet || idx + 1 < ls.iteration ? '#3b82f6' : '#ef4444') : '#cbd5e1' }}
              >
                {idx + 1 <= ls.iteration && <span className={idx + 1 < ls.iteration ? 'text-white' : ''}>{idx + 1}</span>}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="text-[11px] font-mono text-slate-500 text-center">
            Iteration {ls.iteration} / ~{maxIter} (estimated)
          </div>
        </div>

        {/* Side: Live variable values */}
        <div className="flex flex-col gap-2 w-36 shrink-0">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Variables</div>
          {vars.map(v => (
            <div key={v.name} className={`rounded-xl border p-2 ${v.highlight ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200'}`}>
              <div className="font-mono font-bold text-xs text-slate-900">{v.name}</div>
              <div className="font-mono font-black text-lg text-blue-900">{String(v.value)}</div>
              <div className="text-[9px] font-mono text-slate-400">{v.type} · {v.address}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 8. If-Else — Railway Track Switcher
// ─────────────────────────────────────────────
function BranchingCanvas({ step }: { step: ExecutionStep }) {
  const bs = step.branchState;
  const vars = step.variables;

  if (!bs) return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <GitBranch className="w-3.5 h-3.5" />
        Conditional Branch — CPU Flag Decision Tree
      </div>
      <EmptyState icon={GitBranch} title="No Branch Evaluated" hint="Step forward to see the if/else condition evaluate and route execution." />
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <GitBranch className="w-3.5 h-3.5" />
        If-Else Decision — CPU Zero Flag Branch Prediction
      </div>

      {/* Variables bar */}
      <div className="flex flex-wrap gap-2">
        {vars.map(v => (
          <div key={v.name} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono shadow-2xs">
            <span className="font-bold text-slate-900">{v.name}</span>
            <span className="text-slate-400">=</span>
            <span className="font-black text-blue-800 text-base">{String(v.value)}</span>
          </div>
        ))}
      </div>

      {/* Track switcher diagram */}
      <div className="flex-1 flex flex-col gap-3">
        {/* Main condition */}
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-amber-700 uppercase">Condition Expression</div>
            <div className="font-mono font-bold text-sm text-amber-900 mt-0.5">{bs.condition}</div>
          </div>
          <div className="ml-auto">
            <div className={`px-3 py-1.5 rounded-xl font-bold text-sm font-mono ${bs.evaluatedTo ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}>
              {bs.evaluatedTo ? 'TRUE' : 'FALSE'}
            </div>
          </div>
        </div>

        {/* Branch paths */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          <motion.div
            animate={{ opacity: bs.evaluatedTo ? 1 : 0.35, scale: bs.evaluatedTo ? 1 : 0.97 }}
            className={`rounded-2xl border-2 p-4 flex flex-col gap-2 ${bs.evaluatedTo ? 'bg-emerald-50 border-emerald-400 shadow-md' : 'bg-slate-50 border-slate-200'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${bs.evaluatedTo ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className={`font-bold text-sm ${bs.evaluatedTo ? 'text-emerald-800' : 'text-slate-500'}`}>if — TRUE Branch</span>
              {bs.evaluatedTo && (
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="ml-auto text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full"
                >
                  ▶ EXECUTING
                </motion.span>
              )}
            </div>
            <div className="font-mono text-xs text-emerald-700 bg-emerald-100/60 rounded-xl px-3 py-2">
              {bs.takenBranch === 'if' ? bs.condition : '// Skipped by CPU'}
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: !bs.evaluatedTo ? 1 : 0.35, scale: !bs.evaluatedTo ? 1 : 0.97 }}
            className={`rounded-2xl border-2 p-4 flex flex-col gap-2 ${!bs.evaluatedTo ? 'bg-red-50 border-red-400 shadow-md' : 'bg-slate-50 border-slate-200'}`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${!bs.evaluatedTo ? 'bg-red-500' : 'bg-slate-300'}`}>
                <XCircle className="w-4 h-4 text-white" />
              </div>
              <span className={`font-bold text-sm ${!bs.evaluatedTo ? 'text-red-800' : 'text-slate-500'}`}>else — FALSE Branch</span>
              {!bs.evaluatedTo && (
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="ml-auto text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full"
                >
                  ▶ EXECUTING
                </motion.span>
              )}
            </div>
            <div className="font-mono text-xs text-red-700 bg-red-100/60 rounded-xl px-3 py-2">
              else block / fallback
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Cpu className="w-3.5 h-3.5 text-blue-500" />
          <span>CPU evaluates condition → sets <strong>Zero Flag (ZF)</strong> → JE/JNE instruction jumps execution to correct branch address.</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 9. Switch-Case — Jump Table Dispatch Board
// ─────────────────────────────────────────────
function SwitchCanvas({ step }: { step: ExecutionStep }) {
  const ss = step.switchState;
  const vars = step.variables;

  if (!ss) return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <LayoutList className="w-3.5 h-3.5" />
        Switch — O(1) Jump Table Dispatch
      </div>
      <EmptyState icon={LayoutList} title="Switch Not Evaluated" hint="Step forward to see the switch expression evaluate and dispatch to a case." />
    </div>
  );

  const caseLabels = [
    { label: 'case 1', action: 'View Profile' },
    { label: 'case 2', action: 'Start C Compiler' },
    { label: 'case 3', action: 'Check Doubts Queue' },
    { label: 'default', action: 'Invalid Option' },
  ];

  const matchedIdx = caseLabels.findIndex(c => c.label === ss.matchedCase || (ss.matchedCase === 'default' && c.label === 'default'));

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <LayoutList className="w-3.5 h-3.5" />
        Switch — O(1) Jump Table Dispatch Board
      </div>

      {/* Expression evaluated */}
      <div className="flex items-center gap-3 bg-slate-900 text-white rounded-2xl p-4">
        <div className="font-mono text-sm text-slate-400">switch(</div>
        <div className="font-mono font-extrabold text-xl text-blue-400">{ss.expression}</div>
        <div className="font-mono text-sm text-slate-400">)</div>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-[10px] font-bold text-slate-400">Evaluated to:</div>
          <div className="px-3 py-1.5 bg-blue-600 rounded-xl font-mono font-black text-xl text-white">
            {ss.evaluatedValue}
          </div>
        </div>
      </div>

      {/* Jump table */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Compiler Jump Table (O(1) Address Lookup)</div>
        {caseLabels.map((c, idx) => {
          const isMatched = idx === matchedIdx;
          return (
            <motion.div
              key={c.label}
              initial={false}
              animate={{
                opacity: isMatched ? 1 : 0.45,
                x: isMatched ? 4 : 0,
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 ${
                isMatched
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className={`font-mono font-extrabold text-sm w-20 shrink-0 ${isMatched ? 'text-blue-200' : 'text-slate-500'}`}>
                {c.label}:
              </div>
              <div className={`font-mono font-bold ${isMatched ? 'text-white' : 'text-slate-700'}`}>
                printf("{c.action}")
              </div>
              {isMatched && (
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="ml-auto flex items-center gap-1 text-[10px] font-bold text-blue-200"
                >
                  <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                  MATCHED — Executing
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span><strong>Jump Table:</strong> Compiler builds an address array. switch({ss.expression}={ss.evaluatedValue}) → O(1) direct jump to matching case address — no sequential if-ladder.</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main dispatcher: choose widget by topic
// ─────────────────────────────────────────────
export const MemoryCanvas: React.FC<MemoryCanvasProps> = ({ currentStep, topicId }) => {
  if (!currentStep) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-8">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center mb-4">
          <Cpu className="w-8 h-8 text-blue-400 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Visual Lab Ready</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-[250px] leading-relaxed">
          Click <strong>Step Next ▶</strong> or <strong>Auto Play</strong> to begin the interactive visualization for this concept.
        </p>
      </div>
    );
  }

  const id = topicId ?? '';

  // Dispatch to topic-specific widget
  const hasLoopState = !!currentStep.loopState;
  const hasBranchState = !!currentStep.branchState;
  const hasSwitchState = !!currentStep.switchState;
  const hasPointers = currentStep.pointers.length > 0 || currentStep.variables.some(v => v.type.includes('*'));
  const hasArrays = currentStep.arrays.length > 0;
  const hasStructures = currentStep.structures.length > 0;
  const hasQueueItems = (currentStep.queueItems?.length ?? 0) > 0;
  const hasStackItems = (currentStep.stackItems?.length ?? 0) > 0;

  let Widget: React.ReactElement;

  if (id === 'switch-case' || hasSwitchState) {
    Widget = <SwitchCanvas step={currentStep} />;
  } else if (id === 'if-else-branching' || hasBranchState) {
    Widget = <BranchingCanvas step={currentStep} />;
  } else if (id === 'for-while-loops' || hasLoopState) {
    Widget = <LoopsCanvas step={currentStep} />;
  } else if (id === 'queue-fifo' || hasQueueItems) {
    Widget = <QueueCanvas step={currentStep} />;
  } else if (id === 'stack-lifo' || hasStackItems) {
    Widget = <StackCanvas step={currentStep} />;
  } else if (id === 'structures-struct' || hasStructures) {
    Widget = <StructuresCanvas step={currentStep} />;
  } else if (id === 'arrays-contiguous' || hasArrays) {
    Widget = <ArraysCanvas step={currentStep} />;
  } else if (id === 'pointers-basics' || hasPointers) {
    Widget = <PointersCanvas step={currentStep} />;
  } else {
    Widget = <VariablesCanvas step={currentStep} />;
  }

  return (
    <div className="h-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 overflow-y-auto">
      {Widget}
    </div>
  );
};
