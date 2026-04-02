import { Deadlines } from "@/components/dashboard/Deadlines";

export default function DeadlinesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">All Deadlines</h1>
        <p className="text-slate-500 font-medium">A dedicated view of all your group deliverables.</p>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto pb-10">
        <Deadlines />
      </div>
    </div>
  );
}
