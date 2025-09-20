// src/shared/StaffSidebar.tsx
import GenericSidebar from "./GenericSidebar";
import { staffSidebarConfig } from "./sidebarConfigs";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate?: () => void;
};

export default function StaffSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
}: Props) {
  return (
    <GenericSidebar
      collapsed={collapsed}
      mobileOpen={mobileOpen}
      onToggleCollapse={onToggleCollapse}
      onCloseMobile={onCloseMobile}
      onNavigate={onNavigate}
      config={staffSidebarConfig}
    />
  );
}