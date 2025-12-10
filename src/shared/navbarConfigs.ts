import { Home, Info, Phone, Users, BarChart3, BookOpenText, Settings, HelpCircle, UserCheck, GraduationCap, FileText, User, Package as PackageIcon } from "lucide-react";
import type { NavbarConfig } from "@/types/navbar.type";
import { createNavbarUserInfo } from "@/types/navbar.type";

// Guest navbar configuration for unauthenticated users
export const createGuestNavbarConfig = (): NavbarConfig => ({
  userInfo: createNavbarUserInfo(null, "Guest"),
  navigationItems: [

    {
      name: "Login",
      href: "/login",
      icon: Users,
      description: "Sign in to your account"
    }
  ],
  userMenuItems: [],
  quickStats: [],
  portalName: "CETS Admin Portal"
});

// Admin navbar configuration
export const createAdminNavbarConfig = (userAccount: any): NavbarConfig => {
  // Determine role from userAccount.roleNames if available
  const userRole = userAccount?.roleNames?.[0] || "Admin";
  // Determine profile href based on actual role
  const profileHref = userRole === "Admin" ? "/admin/profile" : "/staff/profile";
  return {
  userInfo: createNavbarUserInfo(userAccount, userRole),
  navigationItems: [
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      description: "View analytics dashboard"
    },
    {
      name: "Staff",
      href: "/admin/staffs",
      icon: UserCheck,
      description: "Manage staff accounts"
    },
    {
      name: "Teacher", 
      href: "/admin/teachers",
      icon: GraduationCap,
      description: "Manage teacher accounts"
    },
    {
      name: "Student",
      href: "/admin/students", 
      icon: Users,
      description: "Manage student accounts"
    },
    {
      name: "Courses",
      href: "/admin/courses",
      icon: BookOpenText,
      description: "Manage courses"
    },
    {
      name: "Packages",
      href: "/admin/packages",
      icon: PackageIcon,
      description: "Manage course packages"
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: FileText,
      description: "View and manage reports"
    }
  ],
  userMenuItems: [
    {
      name: "My Profile",
      href: profileHref,
      icon: User,
      description: "View and edit your profile"
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      description: "Account settings"
    },
    {
      name: "Help",
      href: "/admin/help", 
      icon: HelpCircle,
      description: "Get help and support"
    }
  ],
  quickStats: [
    { label: "Total Staff", value: "24", color: "blue" },
    { label: "Active Teachers", value: "156", color: "green" },
    { label: "Students", value: "1,248", color: "purple" }
  ],
  portalName: "CETS Admin Portal"
  };
};

// Academic Staff navbar configuration  
export const createAcademicStaffNavbarConfig = (userAccount: any): NavbarConfig => {
  // Determine role from userAccount.roleNames if available
  const userRole = userAccount?.roleNames?.[0] || "AcademicStaff";
  return {
  userInfo: createNavbarUserInfo(userAccount, userRole),
  navigationItems: [
    {
      name: "Analytics",
      href: "/staff/analytics", 
      icon: BarChart3,
      description: "View analytics and reports"
    },
    {
      name: "Schedule",
      href: "/staff/schedule",
      icon: GraduationCap, 
      description: "Manage schedules"
    }
  ],
  userMenuItems: [
    {
      name: "My Profile",
      href: "/staff/profile",
      icon: User,
      description: "View and edit your profile"
    },
    {
      name: "Settings",
      href: "/staff/settings",
      icon: Settings,
      description: "Account settings"
    },
    {
      name: "Help",
      href: "/staff/help",
      icon: HelpCircle,
      description: "Get help and support"
    }
  ],
  quickStats: [
    { label: "Active Courses", value: "12", color: "blue" },
    { label: "Teachers", value: "156", color: "green" },
    { label: "Students", value: "1,248", color: "purple" }
  ],
  portalName: "CETS Academic Staff Portal"
  };
};

// Accountant Staff navbar configuration
export const createAccountantStaffNavbarConfig = (userAccount: any): NavbarConfig => {
  // Determine role from userAccount.roleNames if available
  const userRole = userAccount?.roleNames?.[0] || "AccountantStaff";
  return {
  userInfo: createNavbarUserInfo(userAccount, userRole),
  navigationItems: [
    {
      name: "Analytics", 
      href: "/staff/analytics",
      icon: BarChart3,
      description: "View financial analytics"
    },
    {
      name: "Promotions",
      href: "/staff/promotions",
      icon: FileText,
      description: "Manage bpromotions"
    }
  ],
  userMenuItems: [
    {
      name: "My Profile",
      href: "/staff/profile",
      icon: User,
      description: "View and edit your profile"
    },
    {
      name: "Settings",
      href: "/staff/settings",
      icon: Settings,
      description: "Account settings"
    },
    {
      name: "Help", 
      href: "/staff/help",
      icon: HelpCircle,
      description: "Get help and support"
    }
  ],
  quickStats: [
    { label: "Monthly Revenue", value: "$24,500", color: "green" },
    { label: "Pending Payments", value: "18", color: "orange" },
    { label: "Students", value: "1,248", color: "blue" }
  ],
  portalName: "CETS Accountant Staff Portal"
  };
};
