import React, { useState } from 'react';
import { useClassroomStore } from '../stores/classroomStore';
import { useAuthStore } from '../stores/authStore';
import { TaskSubmissionModal } from '../components/live/TaskSubmissionModal';
import { TaskCreationModal } from '../components/live/TaskCreationModal';
import { Task } from '../types/database';
import { Plus, FileCode2, CheckCircle2, Clock, ChevronRight, Sparkles } from 'lucide-react';

export const TasksPage: React.FC = () => {
  const tasks = useClassroomStore((s) => s.tasks);
  const submissions = useClassroomStore((s) => s.submissions);
  const { isAdmin, user } = useAuthStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold mb-2">
            <FileCode2 className="w-3.5 h-3.5" />
            <span>C Programming Assignments</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Class Tasks & Challenges
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Complete tasks, run code against Judge0 compiler test cases, and receive personal teacher grading.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        )}
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task, idx) => {
          const submission = submissions.find(
            (s) => s.task_id === task.id && (isAdmin ? true : s.student_id === user?.id)
          );

          const isSubmitted = Boolean(submission);
          const isReviewed = submission?.status === 'reviewed';

          return (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-9 h-9 rounded-xl bg-slate-100 font-extrabold text-slate-700 text-xs flex items-center justify-center border border-slate-200/60 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    0{idx + 1}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isReviewed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isSubmitted
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {isReviewed ? `Score: ${submission?.score}/100` : isSubmitted ? 'Submitted' : 'Not Submitted'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                  {task.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px] text-slate-400">GCC C11 • Judge0 ID: 50</span>
                <span className="font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>{isAdmin ? 'Review Submissions' : isSubmitted ? 'View Submission' : 'Start Task'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskSubmissionModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      <TaskCreationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
