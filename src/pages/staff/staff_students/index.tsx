import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import StudentsList from "./components/students_list";
import { Users, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { useStudentStore } from "@/store/student.store";
import { getStudents } from "@/api/student.api";

export default function StaffStudentsPage() {
  const { students } = useStudentStore();

  const handleExportData = async () => {
    try {
      // Fetch current student data to ensure we have the latest
      const studentData = await getStudents();
      
      const dataToExport = studentData.map(student => ({
        'Full Name': student.fullName || 'N/A',
        'Email': student.email || 'N/A',
        'Phone': student.phoneNumber || 'N/A',
        'Student Code': student.studentInfo?.studentCode || 'N/A',
        'Status': student.statusName || (student.isDeleted ? 'Inactive' : 'Active'),
        'Date of Birth': student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A',
        'Created Date': new Date(student.createdAt).toLocaleDateString(),
        'Guardian': student.studentInfo?.guardianName || 'N/A',
        'School': student.studentInfo?.school || 'N/A',
        'Address': student.address || 'N/A',
        'CID': student.cid || 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students List');
      XLSX.writeFile(workbook, 'students-list.xlsx');
    } catch (err) {
      console.error('Error exporting students:', err);
    }
  };

  const breadcrumbItems = [
    { label: "Students" }
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title="Student Management"
        description="Manage and track your students' progress with comprehensive tools"
        icon={<Users className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Export Data',
            variant: 'secondary',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExportData
          }
        ]}
      />

      {/* Students List Component */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <StudentsList />
      </div>

    </div>
  );
}
