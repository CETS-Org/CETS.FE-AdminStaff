import { usePageTitle } from "@/hooks/usePageTitle";

import TeacherList from "./components/teacher_list";
import TeacherDetailPage from "./TeacherDetailPage";
import AddEditTeacherPage from "./AddEditTeacherPage";

export default function TeacherManagement() {
    usePageTitle("Teachers")
return (
    <div>
          
         <main className=" p-4 md:p-8 lg:pl-70 bg-gray-100">
         <h1 className="text-xl font-bold text-gray-600">Teacher Management</h1>
    <TeacherList/>

    </main>
    </div>
   
)
}