import React, { useState } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { useAuthStore } from '../stores/authStore';
import { TaskSubmissionModal } from '../components/live/TaskSubmissionModal';
import { Submission, Task } from '../types/database';
import { CheckSquare, Star, Clock, FileCode, CheckCircle, ChevronRight, User } from 'lucide-react';

export const SubmissionsPage: React.FC = () => {
  const { submissions, tasks } = useSessionStore();
  const { isAdmin, user } = useAuthStore();
  const [activeTaskToReview, setActiveTaskToReview] = useState<Task | null>(null);

  const displayedSubmissions = isAdmin
    ? submissions
    : submissions.filter((s) => user && s.student_id === user.id);

  const getTaskForSubmission = (taskId: string) => {
    return tasks.find((t) => t.id === taskId) || {
      id: taskId,
      session_id: 'session-1',
      title: 'Task Assignment',
      description: 'C programming task submission.',
      initial_code: '#include <stdio.h>\n',
      language_id: 50,
      created_at: new Date().toISOString(),
    };
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Teacher Review Center' : 'Your Submissions'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'Class Submissions & Grading' : 'My Submission History'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {isAdmin
              ? 'Review student C code side-by-side with Judge0 test execution outputs, assign scores, and write feedback.'
              : 'Review your submitted assignments, compiler outputs, teacher scores, and feedback.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            {displayedSubmissions.length} Submissions Total
          </span>
        </div>
      </div>

      {/* Submissions Table / Cards */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">Recorded Submissions</h3>
        </div>

        {displayedSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CheckSquare className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-xs">No task submissions recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedSubmissions.map((sub) => {
              const task = getTaskForSubmission(sub.task_id);
              const isReviewed = sub.status === 'reviewed';

              return (
                <div
                  key={sub.id}
                  onClick={() => setActiveTaskToReview(task)}
                  className="p-6 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 font-bold">
                      <FileCode className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </h4>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isReviewed
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isReviewed ? 'Reviewed' : 'Pending Review'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {sub.student_name || 'Student'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {sub.teacher_feedback && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 mt-2 max-w-xl">
                          <strong className="text-slate-800">Teacher Feedback:</strong> {sub.teacher_feedback}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Score & Review CTA */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    {sub.score !== undefined && sub.score !== null && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-500 font-extrabold text-lg">
                          <Star className="w-4 h-4 fill-amber-500" />
                          <span>{sub.score}</span>
                          <span className="text-xs text-slate-400 font-medium">/ 100</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Grade</span>
                      </div>
                    )}

                    <button className="flex items-center gap-1 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs group-hover:scale-102">
                      <span>{isAdmin ? 'Grade & Inspect' : 'View Code'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeTaskToReview && (
        <TaskSubmissionModal
          task={activeTaskToReview}
          onClose={() => setActiveTaskToReview(null)}
        />
      )}
    </div>
  );
};
