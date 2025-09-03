import { usePageTitle } from "@/hooks/usePageTitle";
import AddSearchCourse from "./components/AddSearchCourse";
import CoursesList from "./components/courses_list";
import OverViewCourse from "./components/OverViewCourse";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageHeader from "@/components/ui/PageHeader";
import AddEditCoursePage from "./AddEditCoursePage";

export default function StaffCoursesPage() {

  return (
    <main className=" p-4 md:p-8 lg:pl-70 bg-gray-100">
        <Breadcrumbs
        items={[
          { label: "Courses" },
        ]}
      />      
      <PageHeader
        title="Course"
        subtitle="Manage all courses"
      />
   
      <OverViewCourse />
      <AddSearchCourse/>
        <CoursesList />\
     
      </main>
  );
}
