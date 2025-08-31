import Navbar from "@/shared/navbar";
import Sidebar from "@/shared/sidebar";
import { useState } from "react";
import StudentsList from "./components/students_list";


export default function StaffStudentsPage() {
  const [isToggleMenu, setIsToggleMenu] = useState(false);

  return (
    <div >    
      <main className="mt-16 p-4 md:p-8 lg:pl-70 bg-gray-100">
        <StudentsList />
      </main>
    </div>
  );
}
