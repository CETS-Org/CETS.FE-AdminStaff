// src/shared/sidebarConfigs.ts
import {
  BarChart3, BookOpenText, Users, GraduationCap, CalendarDays,
  Mail, MessageSquare, FileText, UserCheck, Percent,
  Receipt, CreditCard, TrendingUp, PieChart, School, DoorOpen, ClipboardList,
  Package as PackageIcon, HelpCircle
} from "lucide-react";
import type { SidebarConfig } from "./GenericSidebar";

// Academic Staff Sidebar Configuration
export const academicStaffSidebarConfig: SidebarConfig = {
  title: "Academic Staff",
  showUpcomingDeadlines: true,
  submenuPathPrefix: "/staff/placement-test",
  items: [
    { id: "classes", label: "Classes", icon: School, path: "/staff/classes" },
    { id: "schedule", label: "Schedule", icon: CalendarDays, path: "/staff/schedule" },
    { id: "rooms", label: "Rooms", icon: DoorOpen, path: "/staff/rooms" },
    { id: "courses", label: "Courses", icon: BookOpenText, path: "/staff/courses" },
    {
      id: "user-management",
      label: "User Management",
      icon: Users,
      path: "#",
      subItems: [
        { id: "teachers", label: "Teachers", icon: GraduationCap, path: "/staff/teachers" },
        { id: "students", label: "Students", icon: Users, path: "/staff/students" },
      ],
    },
    { id: "requests", label: "Requests", icon: Mail, path: "/staff/requests" },
    {
      id: "placement-test",
      label: "Placement Test",
      icon: ClipboardList,
      path: "/staff/placement-test",
      subItems: [
        { id: "placement-test-management", label: "Test Management", icon: ClipboardList, path: "/staff/placement-test" },
        { id: "placement-questions", label: "Questions", icon: HelpCircle, path: "/staff/placement-test/questions" },
      ],
    },
  ],
};

// Accountant Staff Sidebar Configuration
export const accountantStaffSidebarConfig: SidebarConfig = {
  title: "Accountant Staff",
  showUpcomingDeadlines: true,
  items: [
    { id: "analytics", label: "Financial Analytics", icon: TrendingUp, path: "/staff/analytics" },
    { id: "billing", label: "Billing & Payments", icon: Receipt, path: "/staff/billing" },
    { id: "transactions", label: "Transactions", icon: CreditCard, path: "/staff/transactions" },
    { id: "promotions", label: "Promotions", icon: Percent, path: "/staff/promotions" },
    { id: "contracts", label: "Contracts", icon: FileText, path: "/staff/contracts" },
    { id: "complaints", label: "Complaints", icon: MessageSquare, path: "/staff/complaints" },
    { id: "requests", label: "Requests", icon: Mail, path: "/staff/requests" },
  ],
};

// Legacy config for backward compatibility (defaults to Academic Staff)
export const staffSidebarConfig: SidebarConfig = academicStaffSidebarConfig;

export const adminSidebarConfig: SidebarConfig = {
  title: "Admin",
  items: [
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    {
      id: "user-management",
      label: "User Management",
      icon: Users,
      path: "#",
      subItems: [
        { id: "staffs", label: "Staff Management", icon: UserCheck, path: "/admin/staffs" },
        { id: "teachers", label: "Teacher Management", icon: GraduationCap, path: "/admin/teachers" },
        { id: "students", label: "Student Management", icon: Users, path: "/admin/students" },
      ]
     
    },
    { id: "courses", label: "Courses", icon: BookOpenText, path: "/admin/courses" },
    { id: "packages", label: "Packages", icon: PackageIcon, path: "/admin/packages" },
    { id: "rooms", label: "Rooms Management", icon: DoorOpen, path: "/admin/rooms" },
    { id: "reports", label: "System Report", icon: FileText, path: "/admin/reports" },
  ]
};
