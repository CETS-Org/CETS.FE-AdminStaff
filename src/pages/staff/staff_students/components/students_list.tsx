import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Pagination from "@/shared/pagination";
import AddEditStudentDialog from "./AddEditStudentDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { Eye, Edit, Trash2 } from "lucide-react";

export type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  level: string;
  enrolledCourses: string[];
  status: "active" | "inactive" | "graduated";
  joinDate: string;
  avatar?: string;
};

export default function StudentsList() {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; student: Student | null }>({ open: false, student: null });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
    const [students, setStudents] = useState<Student[]>([
      { id: 1, name: "Nguyen Van A", email: "nguyenvana@email.com", phone: "0123456789", age: 18, level: "B1", enrolledCourses: ["IELTS Foundation"], status: "active", joinDate: "2024-09-01" },
      { id: 2, name: "Tran Thi B", email: "tranthib@email.com", phone: "0987654321", age: 22, level: "C1", enrolledCourses: ["TOEIC Advanced", "Business English"], status: "active", joinDate: "2024-08-15" },
      { id: 3, name: "Le Van C", email: "levanc@email.com", phone: "0555666777", age: 16, level: "Beginner", enrolledCourses: ["Kids English"], status: "active", joinDate: "2024-10-01" },
      { id: 4, name: "Pham Thi D", email: "phamthid@email.com", phone: "0111222333", age: 25, level: "B2", enrolledCourses: ["IELTS Foundation"], status: "graduated", joinDate: "2024-06-01" },
      { id: 5, name: "Hoang Van E", email: "hoangvane@email.com", phone: "0444555666", age: 20, level: "A2", enrolledCourses: ["Conversation Club"], status: "inactive", joinDate: "2024-07-01" },
    ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const currentData = useMemo(
    () => students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [students, currentPage]
  );

  const columns: TableColumn<Student>[] = [
    { 
      header: "Student", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-neutral-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { header: "Phone", accessor: (row) => row.phone },
    { header: "Age", accessor: (row) => row.age },
    { header: "Level", accessor: (row) => row.level },
    { 
      header: "Courses", 
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.enrolledCourses.map((course, idx) => (
            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
              {course}
            </span>
          ))}
        </div>
      )
    },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.status === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${row.status === 'graduated' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
        `}>
          {row.status}
        </span>
      )
    },
    { header: "Join Date", accessor: (row) => new Date(row.joinDate).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(row)}
            className="p-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 rounded-full border border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const handleAdd = () => {
    setEditingStudent(null);
    setOpenDialog(true);
  };

  const handleView = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setOpenDialog(true);
  };

  const handleDelete = (student: Student) => {
    setDeleteDialog({ open: true, student });
  };

  const handleSave = (payload: Omit<Student, 'id'>) => {
    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...payload, id: s.id } : s));
    } else {
      setStudents(prev => [{ ...payload, id: prev.length ? Math.max(...prev.map(s => s.id)) + 1 : 1 }, ...prev]);
    }
    setOpenDialog(false);
    setEditingStudent(null);
  };

  const confirmDelete = () => {
    if (deleteDialog.student) {
      setStudents(prev => prev.filter(s => s.id !== deleteDialog.student!.id));
      setDeleteDialog({ open: false, student: null });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">

        <Button onClick={handleAdd}>Add New Student</Button>
      </div>
      
      <Card title="Students List">
        <Table columns={columns} data={currentData} />
      </Card>
      
      <div className="mt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <AddEditStudentDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
        onSave={handleSave} 
        initial={editingStudent} 
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) => setDeleteDialog({ open, student: null })}
        onConfirm={confirmDelete}
        title="Delete Student"
        message={`Are you sure you want to delete "${deleteDialog.student?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
