import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/shared/navbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import UserManagement from "./UserManagement";
import UserDetailPage from "./UserDetailPage";
import ComplaintManagement from "./ComplaintManagement";
import ComplaintDetailPage from "../shared/ComplaintDetailPage";
import ComplaintResponsePage from "../shared/ComplaintResponsePage";

export default function AdminHome() {
    const [isToggleMenu, setIsToggleMenu] = useState(false);

    return (
        <div className="">
            <Navbar toggleSidebar={() => setIsToggleMenu(!isToggleMenu)} />
            <AdminSidebar isOpen={isToggleMenu} />
            <main className="mt-10">
                <Routes>
                    <Route path="/" element={<UserManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="users/:id" element={<UserDetailPage />} />          
                    <Route path="reports" element={<ComplaintManagement />} />
                    <Route path="reports/:id" element={<ComplaintDetailPage />} />
                    <Route path="reports/:id/response" element={<ComplaintResponsePage />} />
                </Routes>
            </main>
        </div>
    )
}