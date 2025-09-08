import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3, BookOpenText, Users, GraduationCap, CalendarDays,
  UserPlus, Mail, Calendar, MessageSquare,
  ChevronLeft, ChevronRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate?: () => void;
};

const items = [
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/staff/analytics" },
  { id: "courses", label: "Courses", icon: BookOpenText, path: "/staff/courses" },
  { id: "students", label: "Students", icon: Users, path: "/staff/students" },
  { id: "teachers", label: "Teachers", icon: GraduationCap, path: "/staff/teachers" },
  { id: "schedule", label: "Schedule", icon: CalendarDays, path: "/staff/schedule" },
  { id: "assign-teacher", label: "Assign Teacher", icon: UserPlus, path: "/staff/assign-teacher" },
  { id: "events", label: "Events", icon: Calendar, path: "/staff/events" },
  { id: "complaints", label: "Complaints", icon: MessageSquare, path: "/staff/complaints" },
  { id: "requests", label: "Requests", icon: Mail, path: "/staff/requests" },
];

export default function StaffSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
}: Props) {
  const location = useLocation();

  const isActive = (path?: string) => path && location.pathname.startsWith(path);

  return (
    <>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close sidebar backdrop"
        />
      )}
      <aside
        aria-label="Sidebar"
        className={cn(
          "fixed top-16 bottom-0 left-0 z-50 border-r border-sky-100 bg-sky-50 shadow-sm transition-all duration-300",
          collapsed ? "w-16" : "w-72 lg:w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div
            className={cn(
              "sticky top-0 z-10 flex h-12 items-center border-b border-sky-100 bg-sky-50/95 px-3 backdrop-blur",
              (!collapsed || mobileOpen) ? "justify-between" : "justify-center"
            )}
          >
            {(!collapsed || mobileOpen) && (
              <span className="text-sm font-semibold text-sky-700">Staff</span>
            )}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            {mobileOpen && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-2">
              {items.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      onClick={onNavigate}
                      className={({ isActive: isNavItemActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors border border-sky-200 hover:bg-sky-200/70",
                          (active || isNavItemActive) && "bg-sky-500 text-white font-semibold shadow-md shadow-sky-200 border-sky-500",
                          collapsed && "lg:justify-center lg:px-2"
                        )}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-600")} />
                          <span className={cn("truncate flex-1", collapsed && "lg:hidden")}>{item.label}</span>
                        </div>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="sticky bottom-0 z-10 border-t border-sky-100 bg-sky-50/95 backdrop-blur">
            {(!collapsed || mobileOpen) && (
              <div className="p-3">
                <h2 className="font-semibold text-slate-800 mb-2 text-sm">Upcoming Deadlines</h2>
                <div className="flex flex-col gap-2">
                  <div className="rounded-lg p-2 bg-white border border-sky-100">
                    <h3 className="text-xs font-semibold text-sky-800">Math 101 Registration</h3>
                    <p className="text-[11px] text-gray-500">Due, Jan 15, 2025</p>
                  </div>
                  <div className="rounded-lg p-2 bg-white border border-sky-100">
                    <h3 className="text-xs font-semibold text-sky-800">Physics 201 Registration</h3>
                    <p className="text-[11px] text-gray-500">Due, Jan 20, 2025</p>
                  </div>
                </div>
              </div>
            )}
            <div className="p-3 text-center text-[11px] text-slate-500">
              © 2025 CETS
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}