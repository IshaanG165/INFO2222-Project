import { MessageSquare, FileText, CheckCircle2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_ACTIVITY = [
  {
    id: 1,
    type: "message",
    user: "Sarah Jenkins",
    content: "Shared a new reference doc for the final report.",
    time: "2h ago",
    group: "Research Report",
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    type: "task",
    user: "Michael Chen",
    content: "Completed task 'API Integration'.",
    time: "4h ago",
    group: "E-Commerce Website",
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    id: 3,
    type: "file",
    user: "David Smith",
    content: "Uploaded 'design-v2.fig'.",
    time: "Yesterday",
    group: "System Analytics Tracker",
    icon: FileText,
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: 4,
    type: "join",
    user: "Emma Williams",
    content: "Joined the group workspace.",
    time: "Yesterday",
    group: "Research Report",
    icon: UserPlus,
    color: "bg-amber-100 text-amber-600",
  },
];

export function ActivityFeed() {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-800">Team Activity</h2>
        <p className="text-sm text-slate-500 font-medium mt-0.5">Mock announcements & updates</p>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
          {MOCK_ACTIVITY.map((activity, index) => (
            <div key={activity.id} className="relative flex items-start gap-4 -ml-[11px]">
              <div className={cn("h-5 w-5 rounded-full ring-4 ring-white flex items-center justify-center shrink-0 mt-0.5", activity.color)}>
                <activity.icon className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0 bg-slate-50/50 rounded-xl p-3 border border-slate-100/80 -mt-2">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-semibold text-slate-900">{activity.user}</p>
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-2 bg-white px-2 py-0.5 rounded-md border border-slate-100 shadow-sm">{activity.time}</span>
                </div>
                <p className="text-sm text-slate-600 mb-2 leading-relaxed">{activity.content}</p>
                <div className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200/60 shadow-sm">
                  {activity.group}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
