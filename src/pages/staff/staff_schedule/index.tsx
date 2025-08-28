import Navbar from "@/shared/navbar";
import Sidebar from "@/shared/sidebar";
import { useState } from "react";
import ScheduleList from "./schedule_list";

export default function StaffSchedulePage() {
  const [isToggleMenu, setIsToggleMenu] = useState(false);

  return (
    <div>
      
      <main className="">
        <ScheduleList />
      </main>
    </div>
  );
}


