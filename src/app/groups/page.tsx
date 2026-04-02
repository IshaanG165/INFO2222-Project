import { Users } from "lucide-react";

export default function GroupsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Groups</h1>
        <p className="text-slate-500 font-medium">Manage your active group projects and team members.</p>
      </div>
      
      <div className="flex-1 rounded-2xl border border-slate-200/60 bg-white shadow-sm flex items-center justify-center p-12">
        <div className="text-center max-w-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100 mb-6">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Groups Directory</h3>
          <p className="text-sm text-slate-500">
            This is a functional prototype page. In a full application, this would list all your active groups, members, and quick settings.
          </p>
        </div>
      </div>
    </div>
  );
}
