import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import GenericNavbar from "@/shared/GenericNavbar";
import { createAdminNavbarConfig } from "@/shared/navbarConfigs";
import AdminSidebar from "@/shared/AdminSidebar";
import ComplaintManagement from "./admin_complaint/ComplaintManagement";
import ComplaintDetailPage from "../../shared/ComplaintDetailPage";
import ComplaintResponsePage from "../../shared/ComplaintResponsePage";
import AdminStaffPage from "./admin_staff";
import StaffDetailPage from "./admin_staff/StaffDetailPage";
import StaffSchedulePage from "../staff/staff_schedule/components/StaffSchedulePage";
import StaffStudentsPage from "../staff/staff_students";
import EditStudentPage from "../staff/staff_students/EditStudentPage";
import StudentDetailPage from "../staff/staff_students/StudentDetailPage";
import TeacherManagement from "../staff/staff_teachers";
import AddEditTeacherPage from "../staff/staff_teachers/AddTeacherPage";
import EditTeacherPage from "../staff/staff_teachers/EditTeacherPage";
import TeacherDetailPage from "../staff/staff_teachers/TeacherDetailPage";
import AdminAnalytics from "./admin_analytics";
import StaffRoomsPage from "../staff/staff_rooms";
import AdminProfilePage from "./AdminProfilePage";
import AdminTransactionsPage from "./admin_transactions";

export default function AdminHome() {
        const [mobileOpen, setMobileOpen] = useState(false);
        const [collapsed, setCollapsed] = useState(true); 
        const [userAccount, setUserAccount] = useState(null);
        const navigate = useNavigate();

        const contentShiftClass = collapsed ? "lg:ml-16" : "lg:ml-64";

        // Load user account data and verify role
        useEffect(() => {
            const userData = localStorage.getItem('userInfo'); 
            if (userData) {
                const account = JSON.parse(userData);
                setUserAccount(account);
                
                // Check if user is actually an admin
                const userRole = account?.roleNames?.[0];
                if (userRole !== 'Admin') {
                    // Redirect to appropriate home based on role
                    if (userRole === 'AcademicStaff' || userRole === 'AccountantStaff') {
                        navigate('/staff/analytics', { replace: true });
                    } else {
                        // Unknown role, redirect to login
                        navigate('/login', { replace: true });
                    }
                }
            } else {
                // No user data, redirect to login
                navigate('/login', { replace: true });
            }
        }, [navigate]);

        return (
            <div className="">
                <GenericNavbar 
                    config={createAdminNavbarConfig(userAccount)} 
                    collapsed={collapsed}
                    mobileOpen={mobileOpen}
                />
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
                    <Route path="/" element={<AdminAnalytics />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="staffs" element={<AdminStaffPage />} />
                    <Route path="staffs/:id" element={<StaffDetailPage />} />
                    <Route path="teachers" element={<TeacherManagement />} />
            <Route path="teachers/add" element={<AddEditTeacherPage />} />
            <Route path="teachers/:id" element={<TeacherDetailPage />} />
            <Route path="teachers/edit/:id" element={<EditTeacherPage />} />
            <Route path="schedule" element={<StaffSchedulePage />} />
            <Route path="rooms" element={<StaffRoomsPage />} />
            <Route path="students" element={<StaffStudentsPage />} />
            <Route path="students/:id" element={<StudentDetailPage />} />
            <Route path="students/edit/:id" element={<EditStudentPage />} />
                    <Route path="transactions" element={<AdminTransactionsPage />} />
                    <Route path="reports" element={<ComplaintManagement />} />
                    <Route path="reports/:id" element={<ComplaintDetailPage />} />
                    <Route path="reports/:id/response" element={<ComplaintResponsePage />} />
                    <Route path="profile" element={<AdminProfilePage />} />
                </Routes>
            </div>
            </div>
        </div>
    )
}