import { usePageTitle } from "@/hooks/usePageTitle";
import AddSearchTeacher from "./components/add_search_teacher";
import TeacherList from "./components/teacher_list";
import AssignTeacherPage from "../staff_assign_teacher";

export default function TeacherManagement() {
    usePageTitle("Teachers")
return (
    <div>
          
         <main className=" p-4 md:p-8 lg:pl-70 bg-gray-100">
         <h1 className="text-xl font-bold text-gray-600">Teacher Management</h1>
            <AddSearchTeacher/>
    <TeacherList/>

    </main>
    </div>
   
)
}