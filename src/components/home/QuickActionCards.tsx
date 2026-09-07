import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, MessageSquareQuote, CheckSquare, TrendingUp } from 'lucide-react';

interface QuickActionProps {
  onOpenQuickDoubt?: () => void;
}

export const QuickActionCards: React.FC<QuickActionProps> = ({ onOpenQuickDoubt }) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Live Classes',
      description: 'Watch coding in real-time',
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/90 border-blue-100',
      action: () => navigate('/live'),
    },
    {
      title: 'Ask Doubts',
      description: 'Get instant help',
      icon: MessageSquareQuote,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50/90 border-emerald-100',
      action: () => onOpenQuickDoubt ? onOpenQuickDoubt() : navigate('/doubts'),
    },
    {
      title: 'Submit Tasks',
      description: 'Practice & get feedback',
      icon: CheckSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50/90 border-purple-100',
      action: () => navigate('/tasks'),
    },
    {
      title: 'Track Progress',
      description: 'Stay consistent',
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50/90 border-amber-100',
      action: () => navigate('/submissions'),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <div
            key={act.title}
            onClick={act.action}
            className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${act.bgColor} group-hover:scale-105 transition-transform`}>
              <Icon className={`w-5 h-5 ${act.color}`} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                {act.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {act.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
