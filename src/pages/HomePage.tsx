import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { QuickActionCards } from '../components/home/QuickActionCards';
import { LiveNowCard } from '../components/home/LiveNowCard';
import { SideWidgets } from '../components/home/SideWidgets';
import { UpcomingSessionsCard } from '../components/home/UpcomingSessionsCard';
import { RecentTasksCard } from '../components/home/RecentTasksCard';

interface HomePageProps {
  onOpenQuickDoubt?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenQuickDoubt }) => {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main Column (8 cols on XL) */}
        <div className="xl:col-span-8 space-y-6">
          <HeroBanner />
          <QuickActionCards onOpenQuickDoubt={onOpenQuickDoubt} />

          {/* Bottom Grid for Main Column: Upcoming Sessions + Recent Tasks side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <UpcomingSessionsCard />
            <RecentTasksCard />
          </div>
        </div>

        {/* Right Sidebar Column (4 cols on XL) */}
        <div className="xl:col-span-4 space-y-6">
          <LiveNowCard />
          <SideWidgets />
        </div>
      </div>
    </div>
  );
};
