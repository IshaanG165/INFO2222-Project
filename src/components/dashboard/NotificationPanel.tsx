"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, BellRing } from "lucide-react";
import type { Deadline } from "@/components/dashboard/Deadlines";

export function NotificationPanel() {
  const [urgentDeadlines, setUrgentDeadlines] = useState<Deadline[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateNotifications = () => {
      const saved = localStorage.getItem("syncspace_deadlines");
      if (saved) {
        const deadlines: Deadline[] = JSON.parse(saved);
        const now = new Date();
        const urgent = deadlines.filter((d) => {
          if (d.completed) return false;
          const due = new Date(d.dueDate);
          const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
          return diffHours >= 0 && diffHours <= 48; // Due within 48 hours and not in the past
        });
        setUrgentDeadlines(urgent.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      }
    };

    updateNotifications();
    // Refresh periodically or listen to changes since localStorage might change without refresh
    window.addEventListener("storage", updateNotifications);
    // Custom event to catch updates within the same window
    const interval = setInterval(updateNotifications, 10000); 

    return () => {
      window.removeEventListener("storage", updateNotifications);
      clearInterval(interval);
    };
  }, []);

  if (!isMounted) return null;

  if (urgentDeadlines.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-blue-600" />
            Urgent Notifications
          </h2>
        </div>
        <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-xs font-medium text-slate-500">No urgent deadlines approaching.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-red-200 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.1)] p-5 shrink-0 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-50 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
          Urgent Action Required
        </h2>
        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-inset ring-red-200">
          {urgentDeadlines.length} Due Soon
        </span>
      </div>

      <div className="space-y-3 relative z-10">
        {urgentDeadlines.map((deadline) => {
          const hoursLeft = Math.round((new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60));
          return (
            <div key={deadline.id} className="bg-red-50 border border-red-100/50 rounded-xl p-3 shadow-sm hover:border-red-200 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-xs font-bold text-red-900 truncate">{deadline.title}</h4>
                  <p className="text-[10px] font-medium text-red-700/80 truncate mt-0.5">{deadline.course}</p>
                </div>
                <div className="bg-white shrink-0 px-2 py-1 rounded-md border border-red-100 shadow-sm">
                  <span className="text-[10px] font-bold text-red-600 block text-center leading-none">
                    in {hoursLeft}h
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
