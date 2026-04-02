import { Files } from "lucide-react";

export default function FilesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shared Files</h1>
        <p className="text-slate-500 font-medium">All resources, slides, and shared documents across groups.</p>
      </div>
      
      <div className="flex-1 rounded-2xl border border-slate-200/60 bg-white shadow-sm flex items-center justify-center p-12">
        <div className="text-center max-w-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 border border-blue-100 mb-6">
            <Files className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Cloud Storage Hub</h3>
          <p className="text-sm text-slate-500">
            A central location to upload files and access team resources, designed visually as part of the prototype.
          </p>
        </div>
      </div>
    </div>
  );
}
