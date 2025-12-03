import TeacherList from "./components/teacher_list";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Users, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { getTeachers } from "@/api/teacher.api";

export default function TeacherManagement() {
    const handleExportData = async () => {
        try {
            // Fetch current teacher data
            const teacherData = await getTeachers();
            
            const dataToExport = teacherData.map(teacher => ({
                'Full Name': teacher.fullName || 'N/A',
                'Email': teacher.email || 'N/A',
                'Phone': teacher.phoneNumber || 'N/A',
                'Teacher Code': teacher.teacherInfo?.teacherCode || 'N/A',
                'Status': teacher.statusName || 'Unknown',
                'Date of Birth': teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : 'N/A',
                'Years Experience': teacher.teacherInfo?.yearsExperience || 'N/A',
                'Join Date': new Date(teacher.createdAt).toLocaleDateString()
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Teachers List');
            XLSX.writeFile(workbook, 'teachers-list.xlsx');
        } catch (err) {
            console.error('Error exporting teachers:', err);
        }
    };

    const breadcrumbItems = [
        { label: "Teachers" }
    ];

    return (
        <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
            {/* Breadcrumbs */}
            <Breadcrumbs items={breadcrumbItems} />
            
            {/* Page Header */}
            <PageHeader
                title="Teacher Management"
                description="Manage and organize your teaching staff with comprehensive tools"
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

            {/* Teacher List Component */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <TeacherList />
            </div>

        </div>
    );
}