import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/shared/navbar";
import AdminSidebar from "@/shared/AdminSidebar";
import ComplaintManagement from "./ComplaintManagement";
import ComplaintDetailPage from "../../shared/ComplaintDetailPage";
import ComplaintResponsePage from "../../shared/ComplaintResponsePage";
import AdminStaffPage from "./admin_staff";
import StaffDetailPage from "./admin_staff/StaffDetailPage";

export default function AdminHome() {
        const [mobileOpen, setMobileOpen] = useState(false);
        const [collapsed, setCollapsed] = useState(false);

        const contentShiftClass = collapsed ? "lg:ml-16" : "lg:ml-64";

        return (
            <div className="">
                <Navbar toggleSidebar={() => setMobileOpen(!mobileOpen)} />
            <AdminSidebar 
                collapsed={collapsed}
                mobileOpen={mobileOpen}
                onToggleCollapse={() => setCollapsed(!collapsed)}
                onCloseMobile={() => setMobileOpen(false)}
                onNavigate={() => setMobileOpen(false)}
            />
            <div
        className={[
          "transition-all duration-300",
          contentShiftClass,
          mobileOpen ? "hidden lg:block" : "",
        ].join(" ")}
      >
            <div className="px-6 lg:px-8">
                <Routes>
                    <Route path="/" element={<AdminStaffPage />} />       
                    <Route path="staffs" element={<AdminStaffPage />} />
                    <Route path="staffs/:id" element={<StaffDetailPage />} />
                    <Route path="reports" element={<ComplaintManagement />} />
                    <Route path="reports/:id" element={<ComplaintDetailPage />} />
                    <Route path="reports/:id/response" element={<ComplaintResponsePage />} />
                </Routes>
            </div>
            </div>
        </div>
    )
}