import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  Shield,
  Settings,
  Database,
  FileText,
  Bell,
  Lock,
  Activity,
} from "lucide-react";
import { cn } from "../../lib/utils";

// --- Component gốc ---
const SidebarContainer = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { isOpen: boolean }
>(({ className, isOpen, children, ...props }, ref) => (
  <aside
    ref={ref}
    className={cn(
      // Nền admin với màu xanh sky nhẹ (giống staff)
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
  const navItemClasses = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors border border-sky-200 hover:bg-sky-200/70";
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          navItemClasses,
          // Khi active: nền xanh sky, chữ trắng
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
// COMPONENT ADMIN SIDEBAR CHÍNH ĐỂ EXPORT
//__________________________________________________________________________________________

export default function AdminSidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <h1 className="text-xl font-bold text-sky-600">CETS Admin</h1>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarItem to="/admin/users" icon={<Users className="h-4 w-4" />}>User Management</SidebarItem>
          <SidebarItem to="/admin/reports" icon={<FileText className="h-4 w-4" />}>Complaint Management </SidebarItem>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <h2 className="font-semibold text-slate-800 mb-2 text-sm">System Status</h2>
        <div className="flex flex-col gap-2">
          <div className="rounded-lg p-2 bg-white border border-sky-100">
            <h3 className="text-xs font-semibold text-sky-800">Server Status</h3>
            <p className="text-[11px] text-green-600">Online - All systems operational</p>
          </div>
          <div className="rounded-lg p-2 bg-white border border-sky-100">
            <h3 className="text-xs font-semibold text-sky-800">Active Users</h3>
            <p className="text-[11px] text-gray-500">247 users online</p>
          </div>
        </div>
      </SidebarFooter>
    </SidebarContainer>
  );
}