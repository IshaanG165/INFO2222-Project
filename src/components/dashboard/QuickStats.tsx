import { CheckCircle2, Clock, Users, ArrowUpRight } from "lucide-react";

export function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Tasks Completed</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">14</p>
          <div className="mt-2 flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md max-w-fit font-medium">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            <span>12% from last week</span>
          </div>
        </div>
        <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Upcoming Deadlines</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">3</p>
          <div className="mt-2 flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md max-w-fit font-medium">
            <Clock className="h-3 w-3 mr-1" />
            <span>2 within 48 hours</span>
          </div>
        </div>
        <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100/50 flex items-center justify-center">
          <Clock className="h-6 w-6 text-amber-600" />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Active Groups</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">4</p>
          <div className="mt-2 flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md max-w-fit font-medium">
            <Users className="h-3 w-3 mr-1" />
            <span>1 new member joined</span>
          </div>
        </div>
        <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100/50 flex items-center justify-center">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
