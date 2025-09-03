import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Pagination from "@/shared/pagination";
import AddEditTeacherDialog from "./add_edit_teacher_dialog";
import DeleteConfirmDialog from "./delete_confirm_dialog";


type Teacher = {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  status: "active" | "inactive" | "on_leave";
  joinDate: string;
  avatar?: string;
};

export default function TeacherList() {
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teacher: Teacher | null }>({ open: false, teacher: null });
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: 1, name: "John Doe", email: "john.doe@email.com", phone: "0898123455", specialization: "IELTS", experience: "5 years", status: "active", joinDate: "2023-01-15" },
    { id: 2, name: "Jane Smith", email: "jane.smith@email.com", phone: "0898123456", specialization: "TOEIC", experience: "3 years", status: "active", joinDate: "2023-03-20" },
    { id: 3, name: "Alice Johnson", email: "alice.johnson@email.com", phone: "0898123457", specialization: "Kids English", experience: "4 years", status: "on_leave", joinDate: "2022-11-10" },
    { id: 4, name: "Bob Brown", email: "bob.brown@email.com", phone: "0898123458", specialization: "Business English", experience: "6 years", status: "active", joinDate: "2022-08-05" },
    { id: 5, name: "Chris Evans", email: "chris.evans@email.com", phone: "0898123459", specialization: "Conversation", experience: "2 years", status: "inactive", joinDate: "2023-06-12" },
    { id: 6, name: "Emma Watson", email: "emma.watson@email.com", phone: "0898123460", specialization: "IELTS", experience: "7 years", status: "active", joinDate: "2022-05-18" },
    { id: 7, name: "Michael Wilson", email: "michael.wilson@email.com", phone: "0898123461", specialization: "TOEIC", experience: "4 years", status: "active", joinDate: "2023-02-28" },
    { id: 8, name: "Sarah Davis", email: "sarah.davis@email.com", phone: "0898123462", specialization: "Kids English", experience: "3 years", status: "active", joinDate: "2023-04-15" },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const currentData = useMemo(
    () => teachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [teachers, currentPage]
  );

  const columns: TableColumn<Teacher>[] = [
    { 
      header: "Teacher", 
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
    { header: "Specialization", accessor: (row) => row.specialization },
    { header: "Experience", accessor: (row) => row.experience },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.status === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${row.status === 'on_leave' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
        `}>
          {row.status.replace('_', ' ')}
        </span>
      )
    },
    { header: "Join Date", accessor: (row) => new Date(row.joinDate).toLocaleDateString() },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-1">
          <Button variant="secondary" size="sm" onClick={() => handleEdit(row)}>Edit</Button>
          <Button variant="secondary" size="sm" onClick={() => handleDelete(row)}>Delete</Button>
        </div>
      )
    }
  ];

  const handleAdd = () => {
    setEditingTeacher(null);
    setOpenDialog(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setOpenDialog(true);
  };

  const handleDelete = (teacher: Teacher) => {
    setDeleteDialog({ open: true, teacher });
  };

  const handleSave = (payload: Omit<Teacher, 'id'>) => {
    if (editingTeacher) {
      setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...payload, id: t.id } : t));
    } else {
      setTeachers(prev => [{ ...payload, id: prev.length ? Math.max(...prev.map(t => t.id)) + 1 : 1 }, ...prev]);
    }
    setOpenDialog(false);
    setEditingTeacher(null);
  };

  const confirmDelete = () => {
    if (deleteDialog.teacher) {
      setTeachers(prev => prev.filter(t => t.id !== deleteDialog.teacher!.id));
      setDeleteDialog({ open: false, teacher: null });
    }
  };

  return (
    <div >
 
        {/* <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-600">Teacher Management</h1>
        <Button onClick={handleAdd}>Add New Teacher</Button>
      </div> */}
      
      <Card title="Teacher List">
        <Table columns={columns} data={currentData} />
      </Card>
      
      
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
     

      <AddEditTeacherDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
        onSave={handleSave} 
        initial={editingTeacher} 
      />

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) => setDeleteDialog({ open, teacher: null })}
        onConfirm={confirmDelete}
        title="Delete Teacher"
        message={`Are you sure you want to delete "${deleteDialog.teacher?.name}"? This action cannot be undone.`}
      />

      
    </div>
  );
}