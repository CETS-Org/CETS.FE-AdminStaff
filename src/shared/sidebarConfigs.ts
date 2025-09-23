// src/shared/sidebarConfigs.ts
import {
  BarChart3, BookOpenText, Users, GraduationCap, CalendarDays,
  UserPlus, Mail, Calendar, MessageSquare, FileText, UserCheck, Percent
} from "lucide-react";
import type { SidebarConfig } from "./GenericSidebar";
import AdminFooterContent from "./AdminFooterContent";

export const staffSidebarConfig: SidebarConfig = {
  title: "Staff",
  showUpcomingDeadlines: true,
  items: [
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/staff/analytics" },
    { id: "courses", label: "Courses", icon: BookOpenText, path: "/staff/courses" },
    { id: "students", label: "Students", icon: Users, path: "/staff/students" },
    { id: "teachers", label: "Teachers", icon: GraduationCap, path: "/staff/teachers" },
    { id: "schedule", label: "Schedule", icon: CalendarDays, path: "/staff/schedule" },
    { id: "assign-teacher", label: "Assign Teacher", icon: UserPlus, path: "/staff/assign-teacher" },
    { id: "promotions", label: "Promotions", icon: Percent, path: "/staff/promotions" },
    { id: "events", label: "Events", icon: Calendar, path: "/staff/events" },
    { id: "complaints", label: "Complaints", icon: MessageSquare, path: "/staff/complaints" },
    { id: "requests", label: "Requests", icon: Mail, path: "/staff/requests" },
  ],
};

export const adminSidebarConfig: SidebarConfig = {
  title: "Admin",
  items: [
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
