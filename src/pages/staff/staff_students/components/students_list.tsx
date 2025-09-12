import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/shared/pagination";
import AddEditStudentDialog from "./AddEditStudentDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { Eye, Edit, Trash2, Search, Filter, X, Plus, Loader2 } from "lucide-react";
import { getStudents, filterStudent } from "@/api/student.api";
import type { FilterUserParam } from "@/types/filter.type";

export type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  level: string;
  status: "active" | "inactive" | "graduated";
  joinDate: string;
  avatar?: string;
  accountId?: string; // Store original accountId for API operations
  studentCode?: string;
  guardianName?: string;
  school?: string;
};

export default function StudentsList() {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; student: Student | null }>({ open: false, student: null });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch students data from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiStudents = await getStudents();
        
        // Convert API data to component format
        const convertedStudents: Student[] = apiStudents.map((apiStudent, index) => {
          // Calculate age from dateOfBirth if available
          const age = apiStudent.dateOfBirth 
            ? new Date().getFullYear() - new Date(apiStudent.dateOfBirth).getFullYear()
            : 18; // Default age if not available
          
          // Determine status based on API data
          let status: "active" | "inactive" | "graduated";
          if (apiStudent.isDeleted) {
            status = "inactive";
          } else if (apiStudent.statusName === "Active" || apiStudent.accountStatusID === "ac2b0bff-d3b2-4fb0-afb6-3c8c86e883da") {
            status = "active";
          } else {
            status = "active"; // Default to active
          }
          
          return {
            id: index + 1, // Use index as ID
            name: apiStudent.fullName,
            email: apiStudent.email,
            phone: apiStudent.phoneNumber || "0123456789", // Default phone if not available
            age: age,
            level: "Beginner", // Default level - will be updated with separate API
            status: status,
            joinDate: apiStudent.createdAt.split('T')[0],
            avatar: apiStudent.avatarUrl || undefined,
            accountId: apiStudent.accountId,
            studentCode: apiStudent.studentInfo?.studentCode || undefined,
            guardianName: apiStudent.studentInfo?.guardianName || undefined,
            school: apiStudent.studentInfo?.school || undefined,
          };
        });
        
        setStudents(convertedStudents);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Combined search and filter with debouncing
  useEffect(() => {
    const filterStudentsAPI = async () => {
      try {
        setIsSearching(true);
        
        // Prepare filter parameters
        const filterParams: FilterUserParam = {
          name: searchTerm.trim() || null,
          email: emailFilter.trim() || null,
          phoneNumber: phoneNumber.trim() || null,
          statusName: statusFilter === "all" ? null : statusFilter,
          sortOrder: sortOrder || null,
          currentRole: "Student"
        };

        const filteredResults = await filterStudent(filterParams);
        
        // Convert API results to Student type
        const convertedStudents: Student[] = filteredResults.map((apiStudent, index) => {
          const age = apiStudent.dateOfBirth ? new Date().getFullYear() - new Date(apiStudent.dateOfBirth).getFullYear() : 18;
          let status: "active" | "inactive" | "graduated";
          if (apiStudent.isDeleted) { 
            status = "inactive"; 
          } else if (apiStudent.statusName === "Active" || apiStudent.accountStatusID === "ac2b0bff-d3b2-4fb0-afb6-3c8c86e883da") { 
            status = "active"; 
          } else { 
            status = "active"; 
          }
          let level = "Beginner"; // Hardcoded for now, will be updated
          if (apiStudent.studentInfo?.academicNote) {
            const note = apiStudent.studentInfo.academicNote.toLowerCase();
            if (note.includes("advanced") || note.includes("expert")) {
              level = "Advanced";
            } else if (note.includes("intermediate") || note.includes("medium")) {
              level = "Intermediate";
            } else {
              level = "Beginner";
            }
          }
          return {
            id: index + 1,
            name: apiStudent.fullName,
            email: apiStudent.email,
            phone: apiStudent.phoneNumber || "0123456789",
            age: age,
            level: level,
            status: status,
            joinDate: apiStudent.createdAt.split('T')[0],
            avatar: apiStudent.avatarUrl || undefined,
            accountId: apiStudent.accountId,
            studentCode: apiStudent.studentInfo?.studentCode || undefined,
            guardianName: apiStudent.studentInfo?.guardianName || undefined,
            school: apiStudent.studentInfo?.school || undefined,
          };
        });
        
        setStudents(convertedStudents);
      } catch (err) {
        console.error("Error filtering students:", err);
        setError("Failed to filter students");
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce filter
    const timeoutId = setTimeout(filterStudentsAPI, 1000); // 1000ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, emailFilter, phoneNumber, statusFilter, sortOrder]);

  // No need for client-side filtering anymore
  const filteredStudents = students;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentData = useMemo(
    () => filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredStudents, currentPage]
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, emailFilter, phoneNumber, statusFilter, sortOrder]);

  const columns: TableColumn<Student>[] = [
    { 
      header: "Student", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold overflow-hidden">
            {row.avatar ? (
              <img 
                src={row.avatar} 
                alt={row.name}
                className="w-full h-full object-cover"
              />
            ) : (
              row.name.charAt(0)
            )}
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-neutral-500">{row.email}</div>
            {row.accountId && (
              <div className="text-xs text-gray-400 font-mono">
                ID: {row.accountId.substring(0, 8)}...
              </div>
            )}
          </div>
        </div>
      )
    },
    { header: "Phone", accessor: (row) => row.phone },
    { header: "Age", accessor: (row) => row.age },
  
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
    // Use accountId for navigation to student detail page
    if (student.accountId) {
      navigate(`/staff/students/${student.accountId}`);
    } else {
      console.error("No accountId found for student:", student);
    }
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
    setEmailFilter("");
    setPhoneNumber("");
    setStatusFilter("all");
    setSortOrder("");
    // The useEffect will automatically trigger with empty values
    // which will call filterStudent with null values to get all students
  };

  const hasActiveFilters = searchTerm !== "" || emailFilter !== "" || phoneNumber !== "" || statusFilter !== "all" || sortOrder !== "";

  // Get unique statuses for filter options
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(students.map(s => s.status))];
    return uniqueStatuses.sort();
  }, [students]);

  // Sort order options
  const sortOptions = [
    { label: "Default", value: "" },
    { label: "Name A-Z", value: "name_asc" },
    { label: "Name Z-A", value: "name_desc" },
    { label: "Email A-Z", value: "email_asc" },
    { label: "Email Z-A", value: "email_desc" },
    { label: "Created Date (Newest)", value: "created_desc" },
    { label: "Created Date (Oldest)", value: "created_asc" }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-gray-600">Loading students...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Students</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="secondary"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Card title="Students List" description="View and manage your students" actions={
        <Button onClick={handleAdd} size="sm" className="inline-flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Student
          </div>
        </Button>    
      }>
        {/* Search and Filter Section */}
    
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              )}
              <Input
                placeholder="Search students by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isSearching}
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
                    {[searchTerm, emailFilter, phoneNumber, statusFilter, sortOrder].filter(f => f !== "" && f !== "all").length}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <Input
                label="Email"
                placeholder="Enter email..."
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
              />
              <Input
                label="Phone Number"
                placeholder="Enter phone number..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: "All Status", value: "all" },
                  ...statuses.map(status => ({ label: status, value: status }))
                ]}
              />
              <Select
                label="Sort Order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                options={sortOptions}
              />
            </div>
          )}

        </div>
     
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
