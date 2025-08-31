import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/shared/navbar";
import Sidebar from "@/sidebar";
import StaffSchedulePage from "./staff_schedule";
import StaffStudentsPage from "./staff_students";
import StaffCoursesPage from "./staff_courses";
import TeacherManagement from "./staff_teachers";
import StaffAnalytics from "./staff_analys";


export default function StaffHome() {
    const [isToggleMenu, setIsToggleMenu] = useState(false);

    return (
        <div className="">
            <Navbar toggleSidebar={() => setIsToggleMenu(!isToggleMenu)} />
            <Sidebar isOpen={isToggleMenu} />
            <main className="mt-16">

                <Routes>
                    <Route path="/" element={<StaffAnalytics />} />
                    <Route path="analytics" element={<StaffAnalytics />} />
                    <Route path="teachers" element={<TeacherManagement />} />          
                    <Route path="schedule" element={<StaffSchedulePage />} />
                    <Route path="students" element={<StaffStudentsPage />} />
                    <Route path="courses" element={<StaffCoursesPage />} />
                </Routes>
            </main>
        </div>
    )
}