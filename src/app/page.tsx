import { Deadlines } from "@/components/dashboard/Deadlines";
import { ProgressTracker } from "@/components/dashboard/ProgressTracker";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export default function Home() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 font-medium">Here's what's happening in your groups today.</p>
      </div>

      <QuickStats />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8 h-[700px] lg:h-[calc(100vh-280px)] min-h-[600px]">
        {/* Left Column (Deadlines) - 4 cols on large */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full">
          <Deadlines />
        </div>

        {/* Middle Column (Progress Tracker) - 5 cols on large */}
        <div className="lg:col-span-7 xl:col-span-5 flex flex-col h-full">
          <ProgressTracker />
        </div>

        {/* Right Column (Activity Feed) - 3 cols on large */}
        <div className="lg:col-span-12 xl:col-span-3 flex flex-col h-full mt-6 xl:mt-0 gap-6">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
