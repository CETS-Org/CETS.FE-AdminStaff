import {
    BarChart3,
    BookOpenText,
    Users,
    GraduationCap,
    CalendarDays,
    UserPlus,
    Mail
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Sidebar({ isOpen }: { isOpen: boolean }) {

    return (
    //     <div className={cn(
    //     "fixed top-20 left-0 z-40 h-[85vh] w-64 bg-white shadow-xl p-4 rounded-xl transition-transform duration-300 overflow-y-auto scrollbar-hide",
    //     "lg:translate-x-0 lg:block lg:left-4",
    //     isOpen ? "translate-x-0" : "-translate-x-full"
    //   )}>
          <div className={cn(
        "fixed top-0 left-0 z-40 w-64 bg-primary-900 shadow-xl p-4  transition-transform duration-300 h-screen",
        "lg:translate-x-0 lg:block ",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
            <div className="h-16 fixed bg-primary-900 w-full top-0 left-0 flex items-center px-4 border-b border-neutral-200">
                 <h1 className="text-xl font-bold text-gray-200 ">Dashboard</h1>
            </div>
           

            <div className="h-[50%] flex flex-col gap-2 top-16 mt-16 overflow-y-auto scrollbar-hide">
                <NavLink
                    to="/analytics"
                    className={({ isActive }) => {
                        return isActive ? "navItemClasses bg-primary-800 text-white font-semibold border border-white shadow-[0_0_8px_white] " : "navItemClasses bg-white"
                    }}
                >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                </NavLink>

                <NavLink
                    to="/staff/courses"
                    className={({ isActive }) => {
                        return isActive ? "navItemClasses bg-primary-800 text-white font-semibold border border-white shadow-[0_0_8px_white] " : "navItemClasses bg-white"
                    }}
                >
                    <BookOpenText className="h-4 w-4" />
                    Courses
                </NavLink>

                <NavLink
                    to="/staff/students"
                    className={({ isActive }) => {
                        return isActive ? "navItemClasses bg-primary-800 text-white font-semibold border border-white shadow-[0_0_8px_white] " : "navItemClasses bg-white"
                    }}
                >
                    <Users className="h-4 w-4" />
                    Students
                </NavLink>

                <NavLink
                    to="/staff/teachers"
                    className={({ isActive }) => {
                        return isActive ? "navItemClasses bg-primary-800 text-white font-semibold border border-white shadow-[0_0_8px_white] " : "navItemClasses bg-white"
                    }}
                >
                    <GraduationCap className="h-4 w-4" />
                    Teachers
                </NavLink>

                <NavLink
                    to="/staff/schedule"
                    className={({ isActive }) => {
                        return isActive ? "navItemClasses bg-primary-800 text-white font-semibold border border-white shadow-[0_0_8px_white] " : "navItemClasses bg-white"
                    }}
                >
                    <CalendarDays className="h-4 w-4" />
                    Schedule
                </NavLink>

                <NavLink
                    to="/assign-teacher"
                    className={({ isActive }) => {
                        return isActive ? "navItemClasses bg-primary-800 text-white font-semibold border border-white shadow-[0_0_8px_white] " : "navItemClasses bg-white"
                    }}
                >
                    <UserPlus className="h-4 w-4" />
                    Assign Teacher
                </NavLink>

                <NavLink
                    to="/requests"
                    className={({ isActive }) => {
                        return isActive ? "navItemClasses bg-primary-800 text-white font-semibold border border-white shadow-[0_0_8px_white] " : "navItemClasses bg-white"
                    }}
                >
                    <Mail className="h-4 w-4" />
                    Requests
                </NavLink>
                 <NavLink
                    to="/requests"
                    className={({ isActive }) => {
                        return isActive ? "navItemClasses bg-primary-800 text-white font-semibold border border-white shadow-[0_0_8px_white] " : "navItemClasses bg-white"
                    }}
                >
                    <Mail className="h-4 w-4" />
                    Requests
                </NavLink>
            </div>

            <h2 className="font-bold mt-4  text-gray-500">Upcoming Deadlines</h2>
            <div className=" h-[30vh] mt-auto mb-4 bot-0 bg-primary-900 w-full px-2 overflow-y-auto scrollbar-hide">                
                <div className="flex flex-col gap-2 mt-4">
                    <div className="border border-neutral-200 rounded-md p-2 bg-neutral-100 hover:bg-gray-200">
                        <h3 className="text-sm">Math 101 Registration</h3>
                        <p className="text-[70%]">Due, Jan 15, 2025</p>
                    </div>
                    <div className="border border-neutral-200 rounded-md p-2 bg-neutral-100 hover:bg-gray-200">
                        <h3 className="text-sm">Physics 201 Registration</h3>
                        <p className="text-[70%]">Due, Jan 20, 2025</p>
                    </div>
                     <div className="border border-neutral-200 rounded-md p-2 bg-neutral-100 hover:bg-gray-200">
                        <h3 className="text-sm">Physics 201 Registration</h3>
                        <p className="text-[70%]">Due, Jan 20, 2025</p>
                    </div>
                    <div className="border border-neutral-200 rounded-md p-2 bg-neutral-100 hover:bg-gray-200">
                        <h3 className="text-sm">Physics 201 Registration</h3>
                        <p className="text-[70%]">Due, Jan 20, 2025</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
