// src/shared/StaffSidebar.tsx
import GenericSidebar from "./GenericSidebar";
import { staffSidebarConfig } from "./sidebarConfigs";
import type { SidebarConfig } from "./GenericSidebar";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate?: () => void;
  config?: SidebarConfig; // Optional config prop, defaults to staffSidebarConfig
};

export default function StaffSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigate,
  config = staffSidebarConfig, // Default to legacy config for backward compatibility
}: Props) {
  return (
    <GenericSidebar
      collapsed={collapsed}
      mobileOpen={mobileOpen}
      onToggleCollapse={onToggleCollapse}
      onCloseMobile={onCloseMobile}
      onNavigate={onNavigate}
      config={config}
    />
  );
}