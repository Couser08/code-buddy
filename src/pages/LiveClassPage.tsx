import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useEditorStore } from '../stores/editorStore';
import { useClassroomStore } from '../stores/classroomStore';
import { useRealtimeSession } from '../hooks/useRealtimeSession';
import { TeacherLiveEditor } from '../components/live/TeacherLiveEditor';
import { StudentLiveViewer } from '../components/live/StudentLiveViewer';
import { DoubtQueuePanel } from '../components/live/DoubtQueuePanel';
import { SplitOutputPanel } from '../components/live/SplitOutputPanel';
import { TaskSubmissionModal } from '../components/live/TaskSubmissionModal';
import { TaskCreationModal } from '../components/live/TaskCreationModal';
import { QuickDoubtModal } from '../components/common/QuickDoubtModal';
import { executeCodeOnJudge0, EnhancedExecutionResult } from '../lib/judge0';
import { startClassroomTour } from '../lib/classroomTour';
import {
  HelpCircle,
  FileCode2,
  Plus,
  MessageCircleQuestion,
  X,
  Maximize2,
  Minimize2,
  ChevronRight,
  Columns2,
  Square,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveClassPage: React.FC = () => {
  const { isAdmin } = useAuthStore();

  // Granular atomic selectors: Prevents cursor moves from re-rendering the whole page
  const currentSession = useClassroomStore((s) => s.currentSession);
  const tasks = useClassroomStore((s) => s.tasks);
  const doubts = useClassroomStore((s) => s.doubts);
  const activeTask = useClassroomStore((s) => s.activeTask);
  const setActiveTask = useClassroomStore((s) => s.setActiveTask);

  const liveCode = useEditorStore((s) => s.liveCode);
  const teacherExecution = useEditorStore((s) => s.teacherExecution);
  const teacherStdin = useEditorStore((s) => s.teacherStdin);
  const isTeacherRunning = useEditorStore((s) => s.isTeacherRunning);
  
  // Layout mode: 'split' (60/40) | 'full' (100% code)
  const [layoutMode, setLayoutMode] = useState<'split' | 'full'>('split');
  
  // Drawers: null | 'doubts' | 'tasks'
  const [activeDrawer, setActiveDrawer] = useState<'doubts' | 'tasks' | null>(null);
  const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);

  // Seamless Role View Mode Switcher: 'auto' | 'teacher' | 'student'
  const [viewRole, setViewRole] = useState<'auto' | 'teacher' | 'student'>('auto');
  const effectiveRole = viewRole === 'auto' ? (isAdmin ? 'teacher' : 'student') : viewRole;

  // Live Output & Stdin state for split-screen runner
  const [liveStdin, setLiveStdin] = useState<string>('');
  const [liveOutput, setLiveOutput] = useState<EnhancedExecutionResult | null>(null);
  const [isRunningLive, setIsRunningLive] = useState<boolean>(false);

  // Auto-launch Driver.js tour once on first visit to classroom
  useEffect(() => {
    const tourDone = localStorage.getItem('codeclass_tour_completed');
    if (!tourDone) {
      const timer = setTimeout(() => {
        startClassroomTour();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Initialize Realtime Channel scoped to `class:{sessionId}`
  const {
    broadcastCode,
    broadcastCursor,
    broadcastDoubtEvent,
    broadcastTaskCreated,
    broadcastExecution,
  } = useRealtimeSession(currentSession?.id || '00000000-0000-0000-0000-000000000001');

  const handleRunLiveCode = async () => {
    setIsRunningLive(true);
    if (effectiveRole === 'teacher' || isAdmin) {
      broadcastExecution(null, liveStdin, true);
    }
    try {
      const result = await executeCodeOnJudge0(liveCode, 50, liveStdin);
      setLiveOutput(result);
      if (effectiveRole === 'teacher' || isAdmin) {
        broadcastExecution(result, liveStdin, false);
      }
    } catch (err: any) {
      const errRes: EnhancedExecutionResult = {
        stderr: err.message || 'Execution error',
        status: { id: 11, description: 'Error' },
      };
      setLiveOutput(errRes);
      if (effectiveRole === 'teacher' || isAdmin) {
        broadcastExecution(errRes, liveStdin, false);
      }
    } finally {
      setIsRunningLive(false);
    }
  };

  const openDoubtsCount = doubts.filter((d) => d.status === 'open').length;

  return (
    <div className={`p-6 sm:p-8 max-w-[1700px] mx-auto space-y-5 animate-in fade-in duration-300 transition-all ${
      isZenMode ? 'fixed inset-0 z-50 bg-[#0F172A] p-4 max-w-none' : ''
    }`}>
      {/* Top Session Title & Controls Bar */}
      {!isZenMode && (
        <div className="bg-white border border-slate-200/90 rounded-3xl px-7 py-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Left: Live Session Info */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                Live Broadcast Session
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
              {currentSession?.title || 'Introduction to C Programming: Basics & Syntax'}
            </h1>
          </div>

          {/* Right: Layout Switcher, Collapsible Drawers & Tour */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Library Tour Button in Hinglish */}
            <button
              onClick={() => startClassroomTour()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl text-xs font-bold transition-colors cursor-pointer border border-blue-200/70"
              title="Classroom Feature Spotlight Tour (Hinglish)"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Classroom Tour</span>
            </button>

            {/* Split Screen Layout Toggle (60/40 vs Full) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-semibold">
              <button
                onClick={() => setLayoutMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  layoutMode === 'split'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Split Screen: Live Code (60%) + Output Terminal (40%)"
              >
                <Columns2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Split View</span>
              </button>

              <button
                onClick={() => setLayoutMode('full')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  layoutMode === 'full'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Full Screen Code View"
              >
                <Square className="w-3.5 h-3.5 text-slate-600" />
                <span>Full Code</span>
              </button>
            </div>

            {/* Role View Mode Switcher (Teacher Broadcasting vs Student Live Stream) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-semibold">
              <button
                onClick={() => setViewRole('teacher')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  effectiveRole === 'teacher'
                    ? 'bg-white text-red-700 shadow-2xs font-bold border border-red-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Teacher Broadcasting View (Code changes broadcast live to all students)"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Teacher Panel</span>
              </button>
              <button
                onClick={() => setViewRole('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  effectiveRole === 'student'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold border border-blue-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Student Live Viewer (Synchronized stream as students see it)"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Student Panel</span>
              </button>
            </div>

            {/* Doubts Drawer Toggle */}
            <button
              id="tour-doubts-btn"
              onClick={() => setActiveDrawer(activeDrawer === 'doubts' ? null : 'doubts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                activeDrawer === 'doubts'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Doubts</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeDrawer === 'doubts' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-700'
              }`}>
                {openDoubtsCount || doubts.length}
              </span>
            </button>

            {/* Tasks Drawer Toggle */}
            <button
              id="tour-tasks-btn"
              onClick={() => setActiveDrawer(activeDrawer === 'tasks' ? null : 'tasks')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                activeDrawer === 'tasks'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>Tasks</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeDrawer === 'tasks' ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-700'
              }`}>
                {tasks.length}
              </span>
            </button>

            {/* New Task Button for Teacher */}
            {(effectiveRole === 'teacher' || isAdmin) && (
              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            )}

            {/* Zen Mode Toggle */}
            <button
              onClick={() => setIsZenMode(!isZenMode)}
              className="p-2.5 text-slate-400 hover:text-slate-700 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title={isZenMode ? 'Exit Zen Mode' : 'Focus Zen Mode'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Stage: Dynamic 60/40 Split or Full Width */}
      <div className="relative w-full">
        {layoutMode === 'split' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left 60%: Monaco Code Viewport (7 cols on XL) */}
            <div id="tour-live-editor" className="xl:col-span-7">
              {effectiveRole === 'teacher' ? (
                <TeacherLiveEditor
                  onBroadcastCode={broadcastCode}
                  onBroadcastCursor={broadcastCursor}
                  onBroadcastExecution={broadcastExecution}
                />
              ) : (
                <StudentLiveViewer />
              )}
            </div>

            {/* Right 40%: Split Screen Live Terminal & Stdin (5 cols on XL) */}
            <div id="tour-split-terminal" className="xl:col-span-5">
              <SplitOutputPanel
                isRunning={isRunningLive}
                onRunCode={handleRunLiveCode}
                output={liveOutput}
                stdin={liveStdin}
                onStdinChange={setLiveStdin}
                onClearOutput={() => setLiveOutput(null)}
                code={liveCode}
                isLiveClassroom={true}
                teacherOutput={teacherExecution}
                teacherStdin={teacherStdin}
                isTeacherRunning={isTeacherRunning}
              />
            </div>
          </div>
        ) : (
          /* Full Width 100% Editor */
          <div id="tour-live-editor" className="w-full">
            {effectiveRole === 'teacher' ? (
              <TeacherLiveEditor
                onBroadcastCode={broadcastCode}
                onBroadcastCursor={broadcastCursor}
                onBroadcastExecution={broadcastExecution}
              />
            ) : (
              <StudentLiveViewer />
            )}
          </div>
        )}

        {/* Smooth Slide-Over Collapsible Drawer (Doubts or Tasks) */}
        <AnimatePresence>
          {activeDrawer && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveDrawer(null)}
                className="fixed inset-0 bg-slate-950/40 z-40 cursor-pointer"
              />

              {/* Drawer Sheet */}
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col p-6 overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
                  <div className="flex items-center gap-2.5">
                    {activeDrawer === 'doubts' ? (
                      <>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Live Doubts Queue</h3>
                          <p className="text-[11px] text-slate-400">Questions asked during class</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <FileCode2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">Session Tasks</h3>
                          <p className="text-[11px] text-slate-400">Coding exercises to solve</p>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveDrawer(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto pr-1">
                  {activeDrawer === 'doubts' ? (
                    <DoubtQueuePanel
                      onOpenAskModal={() => setIsDoubtModalOpen(true)}
                      onBroadcastDoubtEvent={broadcastDoubtEvent}
                    />
                  ) : (
                    <div className="space-y-4">
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsCreateTaskOpen(true);
                            setActiveDrawer(null);
                          }}
                          className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create New Assignment</span>
                        </button>
                      )}

                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => {
                              setActiveTask(task);
                              setActiveDrawer(null);
                            }}
                            className="p-4 rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/20 transition-all cursor-pointer group space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-slate-900 group-hover:text-purple-600 transition-colors">
                                {task.title}
                              </h4>
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                C11
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-purple-600 font-bold">
                              <span>{isAdmin ? 'Review Submissions' : 'Solve Solution'}</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button (FAB) for "Ask Doubt" */}
      <div id="tour-doubts-fab" className="fixed bottom-7 right-7 z-40">
        <button
          onClick={() => setIsDoubtModalOpen(true)}
          className="group relative flex items-center gap-2.5 pl-4 pr-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer active:scale-95"
          title="Ask Live Doubt to Teacher"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <MessageCircleQuestion className="w-4 h-4" />
          <span>Ask Doubt</span>
        </button>
      </div>

      {/* Zen Mode Floating Exit Bar */}
      {isZenMode && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-full text-xs font-bold shadow-xl hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Zen Mode</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <QuickDoubtModal
        isOpen={isDoubtModalOpen}
        onClose={() => setIsDoubtModalOpen(false)}
      />

      <TaskCreationModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onTaskCreated={broadcastTaskCreated}
      />

      {activeTask && (
        <TaskSubmissionModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
        />
      )}
    </div>
  );
};
