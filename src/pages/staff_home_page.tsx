
import { useState } from "react";
import Navbar from "../shared/navbar";
import Sidebar from "../shared/sidebar";

export default function StaffHome() {
    const [isToggleMenu, setIsToggleMenu] = useState(false);

    return (
        <div className="flex">        
        <Navbar toggleSidebar={()=> setIsToggleMenu(!isToggleMenu)}/>              
        <Sidebar isOpen ={isToggleMenu}/>
      
        </div>        
    )
}