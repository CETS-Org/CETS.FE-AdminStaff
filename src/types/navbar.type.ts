// Navbar-related types and interfaces
import type { Account } from "./account.type";

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  description: string;
}

export interface UserMenuItem {
  name: string;
  href: string;
  icon: any;
  description: string;
}

export interface QuickStat {
  label: string;
  value: string | number;
  color: string;
}

export interface NavbarUserInfo {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  initials: string;
}

export interface NavbarConfig {
  userInfo: NavbarUserInfo;
  navigationItems: NavigationItem[];
  userMenuItems: UserMenuItem[];
  quickStats: QuickStat[];
  portalName: string; // e.g., "Learning Platform", "Teacher Portal", "Admin Portal"
}

export interface GenericNavbarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  fullWidth?: boolean;
  config: NavbarConfig;
}

// Utility function to convert Account to NavbarUserInfo
export function createNavbarUserInfo(userInfo: Account | null, role: string): NavbarUserInfo {
  const defaultName = role === 'Admin' ? 'Admin' : 
                    role === 'AcademicStaff' ? 'Academic Staff' : 
                    role === 'AccountantStaff' ? 'Accountant Staff' : 'Guest';
  const defaultInitials = role === 'Admin' ? 'AD' : 
                         role === 'AcademicStaff' ? 'AS' : 
                         role === 'AccountantStaff' ? 'AC' : 'GU';
  
  return {
    name: userInfo?.fullName || userInfo?.email || defaultName,
    email: userInfo?.email || '',
    role,
    initials: userInfo?.fullName ? 
      userInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 
      defaultInitials,
    avatar: userInfo?.avatarUrl || undefined 
  };
}
