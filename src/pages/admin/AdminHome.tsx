import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/shared/navbar";
import AdminSidebar from "@/shared/AdminSidebar";
import ComplaintManagement from "./admin_complaint/ComplaintManagement";
import ComplaintDetailPage from "../../shared/ComplaintDetailPage";
import ComplaintResponsePage from "../../shared/ComplaintResponsePage";
import AdminStaffPage from "./admin_staff";
import StaffDetailPage from "./admin_staff/StaffDetailPage";
import StaffSchedulePage from "../staff/staff_schedule";
import StaffStudentsPage from "../staff/staff_students";
import EditStudentPage from "../staff/staff_students/EditStudentPage";
import StudentDetailPage from "../staff/staff_students/StudentDetailPage";
import TeacherManagement from "../staff/staff_teachers";
import AddEditTeacherPage from "../staff/staff_teachers/AddTeacherPage";
import EditTeacherPage from "../staff/staff_teachers/EditTeacherPage";
import TeacherDetailPage from "../staff/staff_teachers/TeacherDetailPage";

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
                    <Route path="teachers" element={<TeacherManagement />} />
            <Route path="teachers/add" element={<AddEditTeacherPage />} />
            <Route path="teachers/:id" element={<TeacherDetailPage />} />
            <Route path="teachers/edit/:id" element={<EditTeacherPage />} />
            <Route path="schedule" element={<StaffSchedulePage />} />
            <Route path="students" element={<StaffStudentsPage />} />
            <Route path="students/:id" element={<StudentDetailPage />} />
            <Route path="students/edit/:id" element={<EditStudentPage />} />
                    <Route path="reports" element={<ComplaintManagement />} />
                    <Route path="reports/:id" element={<ComplaintDetailPage />} />
                    <Route path="reports/:id/response" element={<ComplaintResponsePage />} />
                </Routes>
            </div>
            </div>
        </div>
    )
}