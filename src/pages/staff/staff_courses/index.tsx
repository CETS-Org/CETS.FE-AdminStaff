import Navbar from "@/shared/navbar";
import Sidebar from "@/shared/sidebar";
import { useState } from "react";
import CoursesList from "./components/courses_list";

export default function StaffCoursesPage() {
  const [isToggleMenu, setIsToggleMenu] = useState(false);

  return (
    <div>
    
    <main className=" mt-16 p-4 md:p-8 lg:pl-70 bg-gray-100">
        <CoursesList />
      </main>
    </div>
  );
}
