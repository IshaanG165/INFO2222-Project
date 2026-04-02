"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, CheckCircle2, AlertCircle, CalendarClock, Trash2, Edit2, CheckCircle, BellRing, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type Deadline = {
  id: string;
  title: string;
  course: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
};

const INITIAL_DEADLINES: Deadline[] = [
  {
    id: "1",
    title: "Final Project Pitch",
    course: "CS302 - Group 4",
    assignedTo: "Sarah Jenkins, You",
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  },
  {
    id: "2",
    title: "Database Schema Design",
    course: "CS411 - Team Alpha",
    assignedTo: "Michael Chen",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
  },
];

export function Deadlines() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({ id: "", title: "", course: "", assignedTo: "", dueDate: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("syncspace_deadlines");
    if (saved) {
      setDeadlines(JSON.parse(saved));
    } else {
      setDeadlines(INITIAL_DEADLINES);
      localStorage.setItem("syncspace_deadlines", JSON.stringify(INITIAL_DEADLINES));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("syncspace_deadlines", JSON.stringify(deadlines));
    }
  }, [deadlines, isMounted]);

  if (!isMounted) return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl w-full" />;

  const handleToggleComplete = (id: string) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d))
    );
  };

  const handleDelete = (id: string) => {
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setDeadlines((prev) =>
        prev.map((d) => (d.id === formData.id ? { ...d, ...formData } : d))
      );
    } else {
      setDeadlines((prev) => [
        ...prev,
        { ...formData, id: Math.random().toString(36).substring(7), completed: false },
      ]);
    }
    setShowAddForm(false);
    setFormData({ id: "", title: "", course: "", assignedTo: "", dueDate: "" });
    setIsEditing(false);
  };

  const handleEdit = (d: Deadline) => {
    setFormData({ id: d.id, title: d.title, course: d.course, assignedTo: d.assignedTo, dueDate: new Date(d.dueDate).toISOString().slice(0, 16) });
    setIsEditing(true);
    setShowAddForm(true);
  };

  const getUrgencyInfo = (dateString: string, completed: boolean) => {
    if (completed) return { label: "Completed", color: "text-emerald-600 bg-emerald-50 ring-emerald-500/20", icon: CheckCircle };
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0) return { label: "Overdue", color: "text-red-700 bg-red-50 ring-red-600/20", icon: AlertCircle, warn: true, isCritical: true };
    if (diffHours <= 48) return { label: "Due within 48h", color: "text-amber-700 bg-amber-50 ring-amber-600/20", icon: Clock, warn: true, isCritical: true };
    return { label: "On Track", color: "text-blue-700 bg-blue-50 ring-blue-600/20", icon: CalendarClock, isCritical: false };
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Deadlines</h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5 z-10">Stay on top of deliverables</p>
        </div>
        <button
          onClick={() => {
            setFormData({ id: "", title: "", course: "", assignedTo: "", dueDate: "" });
            setIsEditing(false);
            setShowAddForm(!showAddForm);
          }}
          className="inline-flex items-center gap-x-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all active:scale-95"
        >
          <Plus className="-ml-0.5 h-4 w-4" />
          Add
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} className="p-4 border-b border-slate-100 bg-blue-50/30 space-y-3 shrink-0">
          <input
            required
            type="text"
            placeholder="Assignment Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
          <input
            required
            type="text"
            placeholder="Assigned To (e.g. Everyone, Sarah)"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="block w-full rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
          <div className="flex gap-3">
            <input
              required
              type="text"
              placeholder="Course / Group"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              className="block flex-1 rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
            <input
              required
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="block flex-1 rounded-lg border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm text-slate-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              {isEditing ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      )}

      <ul className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {deadlines.length === 0 ? (
          <li className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
             <CalendarClock className="h-8 w-8 text-slate-300" />
             No deadlines ahead!
          </li>
        ) : (
          [...deadlines]
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map((deadline) => {
              const { label, color, icon: UrgencyIcon, isCritical } = getUrgencyInfo(deadline.dueDate, deadline.completed);

              return (
                <li
                  key={deadline.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-x-6 py-4 px-5 hover:bg-slate-50/80 transition-colors group",
                    deadline.completed ? "opacity-60" : ""
                  )}
                >
                  <div className="flex min-w-0 gap-x-4 items-start">
                    <button
                      onClick={() => handleToggleComplete(deadline.id)}
                      className={cn(
                        "mt-1 mr-1 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-1",
                        deadline.completed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 text-transparent hover:border-slate-400"
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                    </button>
                    <div className="min-w-0 flex-auto">
                      <p className={cn("text-base font-semibold leading-6 text-slate-900", deadline.completed && "line-through text-slate-500")}>
                        {deadline.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-5 font-medium">
                        <span className="text-slate-500">{deadline.course}</span>
                        <div className="flex items-center text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {deadline.assignedTo}
                        </div>
                      </div>
                      {!deadline.completed && isCritical && (
                         <div className="mt-2 flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit border border-amber-200/50 shadow-sm animate-pulse">
                           <BellRing className="h-3 w-3 mr-1.5" />
                           Group reminded! Check notifications.
                         </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-col sm:items-end shrink-0 gap-x-4 ml-10 sm:ml-0">
                    <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-1.5">
                      <span className={cn("inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset", color)}>
                        <UrgencyIcon className="h-3.5 w-3.5" />
                        {label}
                      </span>
                      <time dateTime={deadline.dueDate} className="text-xs leading-5 text-slate-400 font-medium">
                        {new Date(deadline.dueDate).toLocaleString(undefined, {
                          month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                        })}
                      </time>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity sm:mt-1">
                      <button onClick={() => handleEdit(deadline)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(deadline.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
        )}
      </ul>
    </div>
  );
}
