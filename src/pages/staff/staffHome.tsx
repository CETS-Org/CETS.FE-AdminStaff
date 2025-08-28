
import { useState } from "react";
import Navbar from "@/shared/navbar";
import Sidebar from "@/shared/sidebar";
import TeacherList from "./staff_teachers/teacher_list";

export default function StaffHome() {
    const [isToggleMenu, setIsToggleMenu] = useState(false);

    return (
        <div className="">        
        <Navbar toggleSidebar={()=> setIsToggleMenu(!isToggleMenu)}/>              
        <Sidebar isOpen ={isToggleMenu}/>
        <main className=" mt-16 p-4 md:p-8 lg:pl-70 bg-gray-100 ">
            <TeacherList/>  
            </main>
        </div>        
    )
}