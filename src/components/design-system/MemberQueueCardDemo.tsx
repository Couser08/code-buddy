import React, { useState } from 'react';
import { Search, ChevronDown, FileText, Edit3, RotateCw, Star, Sparkles } from 'lucide-react';

interface MemberItem {
  id: string;
  name: string;
  timeAgo: string;
  isOnline?: boolean;
  avatar: string;
  roleTitle: string;
  badgeType: 'green' | 'purple' | 'amber' | 'blue';
}

export const MemberQueueCardDemo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const members: MemberItem[] = [
    {
      id: '1',
      name: 'Rahul Tungariya',
      timeAgo: 'Online',
      isOnline: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      roleTitle: 'Project Manager',
      badgeType: 'green',
    },
    {
      id: '2',
      name: 'Jhon Smith',
      timeAgo: '17 Ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      roleTitle: 'Designer',
      badgeType: 'purple',
    },
    {
      id: '3',
      name: 'Sarah Chen',
      timeAgo: '1 Day Ago',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      roleTitle: 'Engineer',
      badgeType: 'amber',
    },
    {
      id: '4',
      name: 'Elena Rostova',
      timeAgo: '2 Days',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      roleTitle: 'Creator',
      badgeType: 'blue',
    },
  ];

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDark = themeMode === 'dark';

  const getBadgeStyles = (type: MemberItem['badgeType']) => {
    if (isDark) {
      switch (type) {
        case 'green':
          return 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60';
        case 'purple':
          return 'bg-purple-950/60 text-purple-400 border border-purple-800/60';
        case 'amber':
          return 'bg-amber-950/60 text-amber-400 border border-amber-800/60';
        case 'blue':
          return 'bg-blue-950/60 text-blue-400 border border-blue-800/60';
      }
    } else {
      switch (type) {
        case 'green':
          return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
        case 'purple':
          return 'bg-purple-50 text-purple-700 border border-purple-200/80';
        case 'amber':
          return 'bg-amber-50 text-amber-700 border border-amber-200/80';
        case 'blue':
          return 'bg-blue-50 text-blue-700 border border-blue-200/80';
      }
    }
  };

  const getBadgeIcon = (type: MemberItem['badgeType']) => {
    switch (type) {
      case 'green':
        return <FileText className="w-3.5 h-3.5" />;
      case 'purple':
        return <Edit3 className="w-3.5 h-3.5" />;
      case 'amber':
        return <RotateCw className="w-3.5 h-3.5" />;
      case 'blue':
        return <Star className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Component Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Component 3 • Capsule Queue / Members Card</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Members & Doubts Capsule Card
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Faithful recreation of Image 3 with pill dropdown, inline ⌘ F search, and tinted icon status badges.
          </p>
        </div>

        {/* Theme Switcher Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setThemeMode('light')}
            className={`px-3 py-1 rounded-lg transition-all ${
              !isDark ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Light Card
          </button>
          <button
            onClick={() => setThemeMode('dark')}
            className={`px-3 py-1 rounded-lg transition-all ${
              isDark ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Dark Card
          </button>
        </div>
      </div>

      {/* Centered Capsule Card Presentation */}
      <div className="flex items-center justify-center p-4 sm:p-8 bg-[#F4F5F7] rounded-3xl">
        <div
          className={`w-full max-w-lg rounded-[32px] p-6 shadow-2xl transition-all duration-300 border ${
            isDark
              ? 'bg-[#18181B] text-white border-zinc-800 shadow-zinc-950/50'
              : 'bg-white text-slate-900 border-slate-200/90 shadow-slate-200/70'
          }`}
        >
          {/* Top Bar: Members Dropdown + Search Pill with ⌘ F */}
          <div className="flex items-center justify-between gap-3 pb-5">
            {/* Members 21 ⌵ Dropdown Pill */}
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-colors cursor-pointer ${
                isDark
                  ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <span>Members</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'
              }`}>
                21
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Search Input with ⌘ F */}
            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-12 py-2 rounded-full text-xs transition-all focus:outline-none border ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-600'
                    : 'bg-[#F8F9FA] border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded-md border ${
                    isDark
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      : 'bg-white border-slate-200 text-slate-400 shadow-xs'
                  }`}
                >
                  ⌘ F
                </kbd>
              </div>
            </div>
          </div>

          {/* Members / Doubts List */}
          <div className="divide-y" style={{ borderColor: isDark ? '#27272A' : '#F1F5F9' }}>
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className={`py-3.5 px-2 flex items-center justify-between rounded-2xl transition-colors ${
                  isDark ? 'hover:bg-zinc-900/60' : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Left: Avatar + Name + Status */}
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm leading-tight">
                      {member.name}
                    </h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {member.isOnline ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          Online
                        </span>
                      ) : (
                        <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                          {member.timeAgo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Modern Tinted Pill Badge matching Image 3 */}
                <div
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${getBadgeStyles(
                    member.badgeType
                  )}`}
                >
                  {getBadgeIcon(member.badgeType)}
                  <span>{member.roleTitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
