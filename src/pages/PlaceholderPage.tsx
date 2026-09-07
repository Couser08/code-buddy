import React from 'react';

export const PlaceholderPage: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-4">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
    </div>
  );
};
