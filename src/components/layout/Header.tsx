"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, AlertTriangle } from "lucide-react";
import type { Deadline } from "@/components/dashboard/Deadlines";

export function Header() {
  const [urgentDeadlines, setUrgentDeadlines] = useState<Deadline[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    window.addEventListener("storage", updateNotifications);
    const interval = setInterval(updateNotifications, 10000); 

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", updateNotifications);
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent truncate sm:text-2xl">
          Welcome back! 👋
        </h1>
      </div>

      <div className="flex items-center gap-x-4 sm:gap-x-6">
        <div className="relative hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="search"
            name="search"
            id="search"
            className="block w-full rounded-full border-0 py-1.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-slate-50"
            placeholder="Search tasks, groups..."
          />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button 
            type="button" 
            onClick={() => setShowNotifications(!showNotifications)}
            className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 relative transition-colors"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            {urgentDeadlines.length > 0 && (
              <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 mt-2 w-80 origin-top-right rounded-2xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-200/60 z-50 overflow-hidden transform transition-all">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                {urgentDeadlines.length > 0 && (
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-inset ring-red-200">
                    {urgentDeadlines.length} Urgent
                  </span>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {urgentDeadlines.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500 font-medium">
                    You're all caught up! No urgent deadlines.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {urgentDeadlines.map((deadline) => {
                      const hoursLeft = Math.round((new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60));
                      return (
                        <div key={deadline.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 items-start group">
                          <div className="bg-red-50 p-2 rounded-full ring-1 ring-red-100 shrink-0">
                            <AlertTriangle className="h-4 w-4 text-red-500 object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{deadline.title}</p>
                            <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{deadline.course}</p>
                            <p className="text-xs font-semibold text-red-600 mt-1">Due in {hoursLeft} hours</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:block sm:h-6 sm:w-px sm:bg-slate-200" aria-hidden="true" />
        
        <div className="flex items-center gap-x-3 text-sm font-semibold leading-6 text-slate-900 cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white ring-2 ring-white shadow-sm ring-offset-2 ring-offset-slate-50 uppercase shadow-md">
            M
          </div>
          <span className="sr-only">Your profile</span>
        </div>
      </div>
    </header>
  );
}
