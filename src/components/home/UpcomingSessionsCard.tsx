import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export const UpcomingSessionsCard: React.FC = () => {
  const navigate = useNavigate();

  const sessions = [
    {
      month: 'SEP',
      day: '08',
      title: 'Variables and Data Types',
      time: '4:00 PM - 5:00 PM',
    },
    {
      month: 'SEP',
      day: '10',
      title: 'Control Statements (if, switch)',
      time: '4:00 PM - 5:00 PM',
    },
    {
      month: 'SEP',
      day: '12',
      title: 'Loops in C (for, while, do-while)',
      time: '4:00 PM - 5:00 PM',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <h3 className="font-bold text-slate-900 text-base">
          Upcoming Sessions
        </h3>
        <button
          onClick={() => navigate('/live')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {sessions.map((s, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              {/* Date Badge */}
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-center shrink-0 border border-slate-200/60 group-hover:border-blue-200 group-hover:bg-blue-50/50 transition-colors">
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600 uppercase tracking-wider">
                  {s.month}
                </span>
                <span className="text-base font-extrabold text-slate-800 group-hover:text-blue-600 leading-none">
                  {s.day}
                </span>
              </div>

              {/* Title & Time */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {s.time}
                </p>
              </div>
            </div>

            {/* Calendar Icon Button */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
