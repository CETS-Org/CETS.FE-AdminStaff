import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/shared/pagination";
import AddEditStudentDialog from "./AddEditStudentDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { Eye, Edit, Trash2, Search, Filter, X, Plus } from "lucide-react";

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
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
    const [students, setStudents] = useState<Student[]>([
      { id: 1, name: "Nguyen Van A", email: "nguyenvana@email.com", phone: "0123456789", age: 18, level: "B1", enrolledCourses: ["IELTS Foundation"], status: "active", joinDate: "2024-09-01" },
      { id: 2, name: "Tran Thi B", email: "tranthib@email.com", phone: "0987654321", age: 22, level: "C1", enrolledCourses: ["TOEIC Advanced", "Business English"], status: "active", joinDate: "2024-08-15" },
      { id: 3, name: "Le Van C", email: "levanc@email.com", phone: "0555666777", age: 16, level: "Beginner", enrolledCourses: ["Kids English"], status: "active", joinDate: "2024-10-01" },
      { id: 4, name: "Pham Thi D", email: "phamthid@email.com", phone: "0111222333", age: 25, level: "B2", enrolledCourses: ["IELTS Foundation"], status: "graduated", joinDate: "2024-06-01" },
      { id: 5, name: "Hoang Van E", email: "hoangvane@email.com", phone: "0444555666", age: 20, level: "A2", enrolledCourses: ["Conversation Club"], status: "inactive", joinDate: "2024-07-01" },
    ]);

  // Filter and search logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = searchTerm === "" || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      const matchesLevel = levelFilter === "all" || student.level === levelFilter;
      
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [students, searchTerm, statusFilter, levelFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentData = useMemo(
    () => filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredStudents, currentPage]
  );

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, levelFilter]);

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
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleView(row)}
            className="inline-flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">View</span>
            </div>
            
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(row)}
            className="inline-flex items-center justify-center gap-2"
          >
            <div className="flex items-center gap-2">
            <Edit className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">Edit</span>
            </div>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDelete(row)}
            className="inline-flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
          >
            <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">Delete</span>
            </div>
            
          </Button>
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

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLevelFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || levelFilter !== "all";

  return (
    <div>
      {/* Search and Filter Section */}
      <Card className="mb-6" title="Search and Filter" description="Search and filter your students">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              className="flex items-center gap-2 text-primary-500"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {hasActiveFilters && (
                  <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {[searchTerm, statusFilter, levelFilter].filter(f => f !== "" && f !== "all").length}
                  </span>
                )}
              </span>
            </Button>
            <Button
              onClick={clearFilters}
              variant="secondary"
              className="whitespace-nowrap text-red-500"
            >
              <span className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Clear Filters
              </span>
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                  { label: "Graduated", value: "graduated" },
                ]}
              />
              <Select
                label="Level"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                options={[
                  { label: "All Levels", value: "all" },
                  { label: "Beginner", value: "Beginner" },
                  { label: "A1", value: "A1" },
                  { label: "A2", value: "A2" },
                  { label: "B1", value: "B1" },
                  { label: "B2", value: "B2" },
                  { label: "C1", value: "C1" },
                  { label: "C2", value: "C2" },
                ]}
              />
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
            <span>
              Showing {currentData.length} of {filteredStudents.length} students
              {hasActiveFilters && " (filtered)"}
            </span>
            {hasActiveFilters && (
              <span className="text-primary-600">
                {students.length - filteredStudents.length} students hidden by filters
              </span>
            )}
          </div>
        </div>
      </Card>
      
      <Card title="Students List" description="View and manage your students" actions={
        <Button onClick={handleAdd} size="sm" className="inline-flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Student
          </div>
        </Button>    
      }>
        <Table 
          columns={columns} 
          data={currentData}
          emptyState={
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasActiveFilters ? "No students match your filters" : "No students found"}
              </h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria or clear the filters."
                  : "Get started by adding your first student."
                }
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearFilters} variant="secondary">
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={handleAdd} className="inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Student
                </Button>
              )}
            </div>
          }
        />
      </Card>
      
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredStudents.length}
        startIndex={(currentPage - 1) * itemsPerPage}
        endIndex={Math.min(currentPage * itemsPerPage, filteredStudents.length)}
      />

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
