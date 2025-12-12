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
      name: "Courses",
      href: "/admin/courses",
      icon: BookOpenText,
      description: "Manage courses"
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
    }
  ],
  quickStats: [],
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
      name: "Courses",
      href: "/staff/courses",
      icon: BookOpenText,
      description: "Manage courses"
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
    }
  ],
  quickStats: [],
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
      name: "Promotions",
      href: "/staff/promotions",
      icon: FileText,
      description: "Manage promotions"
    }
  ],
  userMenuItems: [
    {
      name: "My Profile",
      href: "/staff/profile",
      icon: User,
      description: "View and edit your profile"
    }
  ],
  quickStats: [],
  portalName: "CETS Accountant Staff Portal"
  };
};
