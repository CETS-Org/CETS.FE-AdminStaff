import PageHeader from "@/components/ui/PageHeader";
import StudentsList from "./components/students_list";
import Breadcrumbs from "@/components/ui/Breadcrumbs";


export default function StaffStudentsPage() {


  return (
    <div >    
      <main className="p-4 md:p-8 lg:pl-70 bg-gray-100">
      <Breadcrumbs
        items={[
          { label: "Students" },
        ]}
      />
      
      <PageHeader
        title="Manage Students"
        subtitle="View and search for your students"
      />
        <StudentsList />
      </main>
    </div>
  );
}
