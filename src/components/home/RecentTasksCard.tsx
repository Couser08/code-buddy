import React from 'react';
import { useNavigate } from 'react-router-dom';

export const RecentTasksCard: React.FC = () => {
  const navigate = useNavigate();

  const tasks = [
    {
      num: '01',
      title: 'Print a Pattern',
      subtitle: 'Session 1 • 5 test cases',
      status: 'Submitted',
      statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    },
    {
      num: '02',
      title: 'Simple Calculator',
      subtitle: 'Session 2 • 8 test cases',
      status: 'Not Submitted',
      statusColor: 'bg-slate-100 text-slate-500 border-slate-200/60',
    },
    {
      num: '03',
      title: 'Find Prime Number',
      subtitle: 'Session 3 • 6 test cases',
      status: 'Not Submitted',
      statusColor: 'bg-slate-100 text-slate-500 border-slate-200/60',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <h3 className="font-bold text-slate-900 text-base">
          Recent Tasks
        </h3>
        <button
          onClick={() => navigate('/tasks')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Task Rows */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.num}
            onClick={() => navigate('/tasks')}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              {/* Number Badge */}
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0 border border-slate-200/60 group-hover:border-blue-200 group-hover:bg-blue-50/50 group-hover:text-blue-600 transition-colors">
                {task.num}
              </div>

              {/* Title & Subtitle */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {task.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {task.subtitle}
                </p>
              </div>
            </div>

            {/* Status Pill Badge */}
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${task.statusColor}`}
            >
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
