import {
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Users,
  Bell,
  Settings,
  Calendar,
  Files
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, current: true },
  { name: "My Groups", href: "/groups", icon: Users, current: false },
  { name: "Deadlines", href: "/deadlines", icon: Calendar, current: false },
  { name: "Messages", href: "/messages", icon: MessageSquare, current: false },
  { name: "Files", href: "/files", icon: Files, current: false },
];

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col gap-y-5 border-r border-slate-200 bg-slate-50/50 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SyncSpace
          </span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wider">
              Main Menu
            </div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      item.current
                        ? "bg-slate-100 text-blue-600"
                        : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900",
                      "group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-medium transition-colors"
                    )}
                  >
                    <item.icon
                      className={cn(
                        item.current ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600",
                        "h-5 w-5 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto items-center">
            <Link
              href="#"
              className="group -mx-2 flex gap-x-3 rounded-xl p-2 text-sm font-medium leading-6 text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
            >
              <Settings className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600" aria-hidden="true" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
