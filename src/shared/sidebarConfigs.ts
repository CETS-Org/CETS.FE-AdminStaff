// src/shared/sidebarConfigs.ts
import {
  BarChart3, BookOpenText, Users, GraduationCap, CalendarDays,
  UserPlus, Mail, MessageSquare, FileText, UserCheck, Percent,
  Receipt, CreditCard, TrendingUp, PieChart, School, Clock, DoorOpen
} from "lucide-react";
import type { SidebarConfig } from "./GenericSidebar";

// Academic Staff Sidebar Configuration
export const academicStaffSidebarConfig: SidebarConfig = {
  title: "Academic Staff",
  showUpcomingDeadlines: true,
  items: [
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/staff/analytics" },
    { id: "courses", label: "Courses", icon: BookOpenText, path: "/staff/courses" },
    { id: "classes", label: "Classes", icon: School, path: "/staff/classes" },
    { id: "schedule", label: "Schedule", icon: CalendarDays, path: "/staff/schedule" },
    { id: "timetable", label: "Timetable", icon: Clock, path: "/staff/timetable" },
    { id: "rooms", label: "Rooms", icon: DoorOpen, path: "/staff/rooms" },
    { id: "assign-teacher", label: "Assign Teacher", icon: UserPlus, path: "/staff/assign-teacher" },
    { id: "complaints", label: "Complaints", icon: MessageSquare, path: "/staff/complaints" },
    { id: "requests", label: "Requests", icon: Mail, path: "/staff/requests" },
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
    { id: "reports", label: "Complaint Management", icon: FileText, path: "/admin/reports" },
  ]
};
