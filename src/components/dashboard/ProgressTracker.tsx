"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Trash2, CheckCircle2, ChevronDown, ChevronUp, CheckCircle, BarChart3, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Member = {
  id: string;
  name: string;
  avatarColor: string;
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
  assigneeId: string | null;
};

type Project = {
  id: string;
  name: string;
  course: string;
  description: string;
  members: Member[];
  tasks: Task[];
};

const MOCK_USERS: Member[] = [
  { id: "u1", name: "Alex", avatarColor: "bg-blue-500" },
  { id: "u2", name: "Sarah", avatarColor: "bg-emerald-500" },
  { id: "u3", name: "Michael", avatarColor: "bg-amber-500" },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Info 2222 Project",
    course: "CS302 - Group 4",
    description: "Build a full-stack e-commerce prototype with shopping cart functionality.",
    members: MOCK_USERS,
    tasks: [
      { id: "t1", title: "Design database schema", completed: true, assigneeId: "u1" },
      { id: "t2", title: "Setup Next.js frontend", completed: true, assigneeId: "u2" },
      { id: "t3", title: "Implement Stripe payments", completed: false, assigneeId: "u1" },
      { id: "t4", title: "User authentication UI", completed: false, assigneeId: "u3" },
      { id: "t5", title: "Write API endpoints", completed: true, assigneeId: "u3" },
    ],
  },
  {
    id: "p2",
    name: "System Analytics Tracker",
    course: "CS411 - Team Alpha",
    description: "Create a dashboard to monitor live database query performance.",
    members: [MOCK_USERS[0], MOCK_USERS[1]], // Alex and Sarah
    tasks: [
      { id: "t5", title: "Write complex SQL queries", completed: true, assigneeId: "u2" },
      { id: "t6", title: "Setup connection pooling", completed: false, assigneeId: "u1" },
      { id: "t7", title: "Write final documentation", completed: false, assigneeId: null },
    ],
  },
];

export function ProgressTracker() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = useState<{ [projectId: string]: string }>({});
  const [newTaskAssignee, setNewTaskAssignee] = useState<{ [projectId: string]: string }>({});
  const [expandedProjects, setExpandedProjects] = useState<{ [projectId: string]: boolean }>({});

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("syncspace_tracker_v3");
    if (saved) {
      setProjects(JSON.parse(saved));
    } else {
      setProjects(INITIAL_PROJECTS);
      localStorage.setItem("syncspace_tracker_v3", JSON.stringify(INITIAL_PROJECTS));
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("syncspace_tracker_v3", JSON.stringify(projects));
    }
  }, [projects, isMounted]);

  if (!isMounted) return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl w-full" />;

  const getMetrics = (tasks: Task[]) => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    let status = { label: "Not Started", color: "text-slate-500 bg-slate-100 ring-slate-200", barColor: "bg-slate-200" };
    if (percentage === 100 && total > 0) {
      status = { label: "Complete", color: "text-emerald-700 bg-emerald-100 ring-emerald-200", barColor: "bg-emerald-500" };
    } else if (percentage >= 80) {
      status = { label: "Nearly Done", color: "text-blue-700 bg-blue-100 ring-blue-200", barColor: "bg-blue-600" };
    } else if (percentage > 0) {
      status = { label: "In Progress", color: "text-amber-700 bg-amber-100 ring-amber-200", barColor: "bg-amber-500" };
    }

    return { total, completed, percentage, status };
  };

  const handleToggleTask = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        };
      })
    );
  };

  const handleDeleteTask = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) };
      })
    );
  };

  const handleAddTask = (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskTitle[projectId]?.trim();
    if (!title) return;

    const assigneeId = newTaskAssignee[projectId] || null;

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: [...p.tasks, { id: Math.random().toString(36).substring(7), title, completed: false, assigneeId }],
        };
      })
    );
    setNewTaskTitle((prev) => ({ ...prev, [projectId]: "" }));
    setNewTaskAssignee((prev) => ({ ...prev, [projectId]: "" }));
  };

  const toggleExpand = (projectId: string) => {
    setExpandedProjects((prev) => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl overflow-hidden relative border border-slate-200/60 shadow-sm">
      <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-200/60 bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Group Progress Tracker
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Monitor overall project health and individual member contributions</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {projects.map((project) => {
          const { total, completed, percentage, status } = getMetrics(project.tasks);
          const isExpanded = expandedProjects[project.id] !== false;

          return (
            <div key={project.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
              
              {/* Project Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{project.name}</h3>
                  <div className="flex items-center mt-1.5 space-x-2 text-sm text-slate-500 font-medium">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-semibold">{project.course}</span>
                  </div>
                </div>
                <span className={cn("inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ring-inset shadow-sm uppercase tracking-wide", status.color)}>
                  {status.label}
                </span>
              </div>
              
              <p className="text-sm text-slate-600 mb-6 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">{project.description}</p>

              {/* Overall Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                  <span>Overall Completion</span>
                  <span className="text-slate-900">{percentage}% <span className="text-slate-400 font-medium ml-1">({completed}/{total})</span></span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner ring-1 ring-inset ring-slate-200/50">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700 ease-out", status.barColor)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Individual Member Tracking */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Individual Member Progress</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {project.members.map((member) => {
                    const memberTasks = project.tasks.filter((t) => t.assigneeId === member.id);
                    const memTotal = memberTasks.length;
                    const memCompleted = memberTasks.filter((t) => t.completed).length;
                    const memPercentage = memTotal === 0 ? 0 : Math.round((memCompleted / memTotal) * 100);

                    return (
                      <div key={member.id} className="flex flex-col bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                              <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm", member.avatarColor)}>
                                {member.name.charAt(0)}
                              </div>
                              <span className="text-sm font-bold text-slate-700">{member.name}</span>
                           </div>
                           <span className="text-xs font-bold text-slate-500">{memCompleted}/{memTotal}</span>
                        </div>
                        <div className="h-4 w-full bg-slate-200 rounded-md overflow-hidden relative shadow-inner flex items-center">
                           <div
                             className={cn(
                               "h-full transition-all duration-500 ease-out",
                               memPercentage === 100 ? "bg-emerald-500" : (memPercentage > 0 ? "bg-blue-500" : "bg-transparent")
                             )}
                             style={{ width: `${memPercentage}%` }}
                           />
                           <span className={cn("absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-wide drop-shadow-sm", memPercentage > 15 ? "text-white mix-blend-overlay" : "text-slate-500")}>
                             {memPercentage}%
                           </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tasks List */}
              <div className="border-t border-slate-100 pt-2">
                <button
                  onClick={() => toggleExpand(project.id)}
                  className="flex items-center justify-between w-full py-3 text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Task Checklist
                  </span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-1 space-y-3 pb-1">
                    <ul className="space-y-1.5 border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                      {project.tasks.length === 0 ? (
                        <li className="text-sm text-slate-400 italic py-4 text-center">No tasks added yet.</li>
                      ) : (
                        project.tasks.map((task) => {
                          const assignee = project.members.find(u => u.id === task.assigneeId);

                          return (
                            <li key={task.id} className="flex items-center justify-between group py-2.5 px-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:border-blue-200 transition-all">
                              <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                                <button
                                  onClick={() => handleToggleTask(project.id, task.id)}
                                  className={cn(
                                    "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-1 shadow-sm",
                                    task.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-slate-50 text-transparent hover:border-slate-400 hover:bg-white"
                                  )}
                                >
                                  {task.completed && <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />}
                                </button>
                                <span className={cn("text-sm transition-all truncate", task.completed ? "text-slate-400 line-through font-medium" : "text-slate-700 font-semibold")}>
                                  {task.title}
                                </span>
                              </label>
                              
                              <div className="flex items-center gap-3 shrink-0 ml-3">
                                {assignee ? (
                                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                     <div className={cn("h-4 w-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold", assignee.avatarColor)}>
                                       {assignee.name.charAt(0)}
                                     </div>
                                     <span className="text-xs font-semibold text-slate-600 w-12 truncate">
                                       {assignee.name}
                                     </span>
                                  </div>
                                ) : (
                                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                    <AlertCircle className="w-3 h-3" /> Unassigned
                                  </span>
                                )}
                                
                                <button
                                  onClick={() => handleDeleteTask(project.id, task.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all focus:opacity-100"
                                  title="Delete task"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          );
                        })
                      )}
                    </ul>

                    {/* Add Task Form */}
                    <form onSubmit={(e) => handleAddTask(project.id, e)} className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add a new task..."
                        value={newTaskTitle[project.id] || ""}
                        onChange={(e) => setNewTaskTitle({ ...newTaskTitle, [project.id]: e.target.value })}
                        className="flex-1 block w-full rounded-xl border-0 py-2.5 pl-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm shadow-sm bg-white"
                      />
                      <div className="flex w-full sm:w-auto gap-2">
                        <select
                          className="w-full sm:w-36 bg-white rounded-xl border-0 py-2.5 pl-3 text-slate-600 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm shadow-sm cursor-pointer font-medium"
                          value={newTaskAssignee[project.id] || ""}
                          onChange={(e) => setNewTaskAssignee({ ...newTaskAssignee, [project.id]: e.target.value })}
                        >
                          <option value="">Unassigned</option>
                          {project.members.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={!newTaskTitle[project.id]?.trim()}
                          className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
