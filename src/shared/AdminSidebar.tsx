// src/components/admin/AdminSidebar.tsx
import GenericSidebar from "@/shared/GenericSidebar";
import { adminSidebarConfig } from "@/shared/sidebarConfigs";

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigate?: () => void;
};

export default function AdminSidebar({
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
      config={adminSidebarConfig}
    />
  );
}