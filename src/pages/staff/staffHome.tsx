
import { useState } from "react";
import Navbar from "@/shared/navbar";
import Sidebar from "@/shared/sidebar";
import TeacherList from "./staff_teachers/teacher_list";
import { Routes, Route } from "react-router-dom";
import StaffSchedulePage from "./staff_schedule";

export default function StaffHome() {
    const [isToggleMenu, setIsToggleMenu] = useState(false);

    return (
        <div className="">        
        <Navbar toggleSidebar={()=> setIsToggleMenu(!isToggleMenu)}/>              
        <Sidebar isOpen ={isToggleMenu}/>
        <main className=" mt-16 p-4 md:p-8 lg:pl-70 bg-gray-100 ">

      <Routes>
  <Route index element={<TeacherList />} />
  <Route path="schedule" element={<StaffSchedulePage />} />
</Routes>
            </main>
        </div>        
    )
}