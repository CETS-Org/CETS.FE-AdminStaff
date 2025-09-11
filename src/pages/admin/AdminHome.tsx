import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/shared/navbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import UserManagement from "./UserManagement";
import UserDetailPage from "./UserDetailPage";
import ComplaintManagement from "./ComplaintManagement";
import ComplaintDetailPage from "../../shared/ComplaintDetailPage";
import ComplaintResponsePage from "../../shared/ComplaintResponsePage";

export default function AdminHome() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

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
            <div className={`transition-all duration-300 ${collapsed ? 'ml-0' : 'lg:ml-1'}`}>
                <Routes>
                    <Route path="/" element={<UserManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="users/:id" element={<UserDetailPage />} />          
                    <Route path="reports" element={<ComplaintManagement />} />
                    <Route path="reports/:id" element={<ComplaintDetailPage />} />
                    <Route path="reports/:id/response" element={<ComplaintResponsePage />} />
                </Routes>
            </div>
        </div>
    )
}