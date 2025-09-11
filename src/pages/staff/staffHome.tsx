// src/pages/staff/StaffHome.tsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/shared/navbar";
import Sidebar from "@/sidebar";

import StaffSchedulePage from "./staff_schedule";
import StaffStudentsPage from "./staff_students";
import StaffCoursesPage from "./staff_courses";
import TeacherManagement from "./staff_teachers";
import StaffAnalytics from "./staff_analys";
import CourseDetailPage from "./staff_courses/CourseDetailPage";
import AddEditCoursePage from "./staff_courses/AddEditCoursePage";
import AssignTeacherPage from "./staff_assign_teacher";
import StaffRequestPage from "./staff_request";
import StaffEventsPage from "./staff_events";
import EventDetailPage from "./staff_events/EventDetailPage";
import StaffComplaintManagement from "./staff_complaints";
import StudentDetailPage from "./staff_students/StudentDetailPage";
import TeacherDetailPage from "./staff_teachers/TeacherDetailPage";
import AddEditTeacherPage from "./staff_teachers/AddEditTeacherPage";
import ComplaintDetailPage from "@/shared/ComplaintDetailPage";
import ComplaintResponsePage from "@/shared/ComplaintResponsePage";
import { getTeachers } from "../api/account.api";



export default function StaffHome() {
    const [isToggleMenu, setIsToggleMenu] = useState(false);
const teachers = getTeachers();
    return (
        <div className="">
            <Navbar toggleSidebar={() => setIsToggleMenu(!isToggleMenu)} />
            <Sidebar isOpen={isToggleMenu} />
            <main className="mt-10  ">

                <Routes>               
                    <Route path="analytics" element={<StaffAnalytics />} />
                    <Route path="teachers" element={<TeacherManagement />} /> 
                    <Route path="teachers/add" element={<AddEditTeacherPage />} /> 
                    <Route path="teachers/:id" element={<TeacherDetailPage />} />         
                    <Route path="teachers/edit/:id" element={<AddEditTeacherPage />} />
                    <Route path="schedule" element={<StaffSchedulePage />} />
                    <Route path="students" element={<StaffStudentsPage />} />
                    <Route path="courses" element={<StaffCoursesPage />} />
                    <Route path="courses/add" element={<AddEditCoursePage />} />
                    <Route path="courses/edit/:id" element={<AddEditCoursePage />} />
                    <Route path="courses/:id" element={<CourseDetailPage/>} />
                                    <Route path="assign-teacher" element={<AssignTeacherPage />} />
                <Route path="events" element={<StaffEventsPage />} />
                <Route path="events/:id" element={<EventDetailPage />} />
                <Route path="complaints" element={<StaffComplaintManagement />} />
                <Route path="complaints/:id" element={<ComplaintDetailPage />} />
                <Route path="complaints/:id/response" element={<ComplaintResponsePage />} />
                <Route path="requests" element={<StaffRequestPage />} />
                <Route path="students/:id" element={<StudentDetailPage />} />
                </Routes>
            </main>
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const contentShiftClass = collapsed ? "lg:ml-16" : "lg:ml-64";

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar toggleSidebar={() => setMobileOpen((v) => !v)} />

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((v) => !v)}
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
        {/* Chỉ giữ padding ngang, bỏ margin/padding top */}
        <div className="px-6 lg:px-8">
          <Routes>
            <Route path="analytics" element={<StaffAnalytics />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="teachers/add" element={<AddEditTeacherPage />} />
            <Route path="teachers/:id" element={<TeacherDetailPage />} />
            <Route path="teachers/edit/:id" element={<AddEditTeacherPage />} />
            <Route path="schedule" element={<StaffSchedulePage />} />
            <Route path="students" element={<StaffStudentsPage />} />
            <Route path="students/:id" element={<StudentDetailPage />} />
            <Route path="courses" element={<StaffCoursesPage />} />
            <Route path="courses/add" element={<AddEditCoursePage />} />
            <Route path="courses/edit/:id" element={<AddEditCoursePage />} />
            <Route path="courses/:id" element={<CourseDetailPage />} />
            <Route path="assign-teacher" element={<AssignTeacherPage />} />
            <Route path="events" element={<StaffEventsPage />} />
            <Route path="events/:id" element={<EventDetailPage />} />
            <Route path="complaints" element={<StaffComplaintManagement />} />
            <Route path="complaints/:id" element={<ComplaintDetailPage />} />
            <Route path="complaints/:id/response" element={<ComplaintResponsePage />} />
            <Route path="requests" element={<StaffRequestPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
