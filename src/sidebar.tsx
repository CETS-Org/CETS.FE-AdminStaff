import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BookOpenText,
  Users,
  GraduationCap,
  CalendarDays,
  UserPlus,
  Mail,
} from "lucide-react";
import { cn } from "./lib/utils";

// --- Component gốc ---
const SidebarContainer = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { isOpen: boolean }
>(({ className, isOpen, children, ...props }, ref) => (
  <aside
    ref={ref}
    className={cn(
      // Nền trắng ngà có ánh xanh rất nhẹ, sáng và sạch sẽ
      "fixed top-0 left-0 z-40 flex h-screen w-64 flex-col bg-sky-100 border-r border-sky-100 transition-transform duration-300",
      "lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full",
      className
    )}
    {...props}
  >
    {children}
  </aside>
));
SidebarContainer.displayName = "SidebarContainer";

// --- Header ---
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      
      "flex h-16 shrink-0 items-center justify-center border-b border-sky-100 px-4 shadow-sm shadow-sky-100",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SidebarHeader.displayName = "SidebarHeader";

// --- Content (Scrollable) ---
const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-hide", className)}
    {...props}
  >
    {children}
  </div>
));
SidebarContent.displayName = "SidebarContent";

// --- Group ---
const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
    {children}
  </div>
));
SidebarGroup.displayName = "SidebarGroup";

// --- Item ---
interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SidebarItem = ({ to, icon, children, className }: SidebarItemProps) => {
  // THAY ĐỔI Ở ĐÂY: Thêm class border và border-sky-200
  const navItemClasses = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors border border-sky-200 hover:bg-sky-200/70";
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          navItemClasses,
          // Khi active: nền xanh rực rỡ, chữ trắng và viền đậm hơn một chút
          isActive && "bg-sky-500 text-white font-semibold shadow-md shadow-sky-200 border-sky-500",
          className
        )
      }
    >
      {icon}
      {children}
    </NavLink>
  );
};

// --- Footer ---
const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("shrink-0 mt-auto p-4", className)}
    {...props}
  >
    {children}
  </div>
));
SidebarFooter.displayName = "SidebarFooter";


//__________________________________________________________________________________________
//
// COMPONENT SIDEBAR CHÍNH ĐỂ EXPORT
//__________________________________________________________________________________________

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <h1 className="text-xl font-bold text-sky-600">CETS</h1>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarItem to="/analytics" icon={<BarChart3 className="h-4 w-4" />}>Analytics</SidebarItem>
          <SidebarItem to="/courses" icon={<BookOpenText className="h-4 w-4" />}>Courses</SidebarItem>
          <SidebarItem to="/students" icon={<Users className="h-4 w-4" />}>Students</SidebarItem>
          <SidebarItem to="/teachers" icon={<GraduationCap className="h-4 w-4" />}>Teachers</SidebarItem>
          <SidebarItem to="/schedule" icon={<CalendarDays className="h-4 w-4" />}>Schedule</SidebarItem>
          <SidebarItem to="/assign-teacher" icon={<UserPlus className="h-4 w-4" />}>Assign Teacher</SidebarItem>
          <SidebarItem to="/requests" icon={<Mail className="h-4 w-4" />}>Requests</SidebarItem>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <h2 className="font-semibold text-slate-800 mb-2 text-sm">Upcoming Deadlines</h2>
        <div className="flex flex-col gap-2">
          <div className="rounded-lg p-2 bg-white border border-sky-100">
            <h3 className="text-xs font-semibold text-sky-800">Math 101 Registration</h3>
            <p className="text-[11px] text-gray-500">Due, Jan 15, 2025</p>
          </div>
           <div className="rounded-lg p-2 bg-white border border-sky-100">
            <h3 className="text-xs font-semibold text-sky-800">Math 101 Registration</h3>
            <p className="text-[11px] text-gray-500">Due, Jan 15, 2025</p>
          </div>
        </div>
      </SidebarFooter>
    </SidebarContainer>
  );
}