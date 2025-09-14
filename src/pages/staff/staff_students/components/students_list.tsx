import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/shared/pagination";
import AddEditStudentDialog from "./AddEditStudentDialog";
import { Eye, Edit, Trash2, Search, Filter, X, Plus, Loader2 } from "lucide-react";
import { getStudents, filterStudent, getStudentById } from "@/api/student.api";
import type { FilterUserParam } from "@/types/filter.type";
import type { Student, UpdateStudent} from "@/types/student.type";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
import { useStudentStore } from "@/store/student.store";

export default function StudentsList() {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; student: Student | null }>({ open: false, student: null });
  const [editingStudent, setEditingStudent] = useState<UpdateStudent | null>(null);
 const { students, setStudents, updatedStudent } = useStudentStore();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrderDisplay, setSortOrderDisplay] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse sort order from display value
  const parseSortOrder = (displayValue: string) => {
    if (displayValue === "") {
      setSortBy("");
      setSortOrder("");
      return;
    }
    
    const [sortByValue, sortOrderValue] = displayValue.split("_");
    setSortBy(sortByValue);
    setSortOrder(sortOrderValue);
  };

  // Filter students with API
  const filterStudentsAPI = async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      const filterParam: FilterUserParam = {
        name: searchTerm || null,
        email: emailFilter || null,
        phoneNumber: phoneNumber || null,
        statusName: statusFilter === "all" ? null : statusFilter,
        sortBy: sortBy || null,
        sortOrder: sortOrder || null,
        roleName: "Student",
        currentRole: "Student"
      };
      
      const data = await filterStudent(filterParam);
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter students');
      console.error('Error filtering students:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch students data from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiStudents = await getStudents();
        
        // Use API data directly
        setStudents(apiStudents);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);


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
            {row.avatarUrl ? (
              <img 
                src={row.avatarUrl} 
                alt={row.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              row.fullName.charAt(0)
            )}
          </div>
          <div>
            <div className="font-medium">{row.fullName}</div>
            <div className="text-sm text-neutral-500">{row.email}</div>
            {row.studentInfo?.studentCode && (
              <div className="text-xs text-gray-400 font-mono">
                Code: {row.studentInfo.studentCode}
              </div>
            )}
          </div>
        </div>
      )
    },
    { 
      header: "Phone", 
      accessor: (row) => (
        <div className="text-sm">
          <div>{row.phoneNumber || "N/A"}</div>
          {row.studentInfo?.guardianName && (
            <div className="text-xs text-gray-500">Guardian: {row.studentInfo.guardianName}</div>
          )}
        </div>
      )
    },
    { 
      header: "Age", 
      accessor: (row) => (
        <div className="text-sm">
          <div>{row.dateOfBirth ? new Date().getFullYear() - new Date(row.dateOfBirth).getFullYear() : "N/A"} years old</div>
          {row.studentInfo?.school && (
            <div className="text-xs text-gray-500">{row.studentInfo.school}</div>
          )}
        </div>
      )
    },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.statusName === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.isDeleted ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${!row.statusName && !row.isDeleted ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
        `}>
          {row.statusName || (row.isDeleted ? 'Inactive' : 'Active')}
        </span>
      )
    },
    { header: "Join Date", accessor: (row) => new Date(row.createdAt).toLocaleDateString() },
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
    navigate(`/staff/students/${student.accountId}`);
  };

  const handleEdit = async (student: Student) => {
    // Convert Student to the format expected by the dialog
    const getStudentByID= await getStudentById(student.accountId);

    const editingStudent = {
      accountID: getStudentByID.accountId,
      fullName: getStudentByID.fullName,
      email: getStudentByID.email,
      phoneNumber: getStudentByID.phoneNumber || "",     
      cid:getStudentByID.cid || "",
      address: getStudentByID.address || "",
      dateOfBirth: getStudentByID.dateOfBirth || "",
      avatarUrl: getStudentByID.avatarUrl,
      guardianName: getStudentByID.studentInfo?.guardianName,
      guardianPhone: getStudentByID.studentInfo?.guardianPhone,
      school: getStudentByID.studentInfo?.school,
      academicNote: getStudentByID.studentInfo?.academicNote,
    };
    setEditingStudent(editingStudent as any);
    
    setOpenDialog(true);
  };

  const handleDelete = (student: Student) => {
    // Convert Student to the format expected by the dialog
    const deleteStudent = {

      fullfullname: student.fullName,
      email: student.email,
      phone: student.phoneNumber || "",
      age: student.dateOfBirth ? new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear() : 18,
      level: "Beginner",
      status: student.statusName === 'Active' ? 'active' as const : 'inactive' as const,
      joinDate: student.createdAt.split('T')[0],
      avatar: student.avatarUrl,
      accountId: student.accountId,
      studentCode: student.studentInfo?.studentCode,
      guardianName: student.studentInfo?.guardianName,
      school: student.studentInfo?.school,
    };
    setDeleteDialog({ open: true, student: deleteStudent as any });
  };

  const handleSave = (updatedStudentData: UpdateStudent) => {
    console.log("Save student:", updatedStudentData);
    
    // Use store function to update student
    updatedStudent(updatedStudentData);
    
    setOpenDialog(false);
    setEditingStudent(null);
  };

  const confirmDelete = () => {
    if (deleteDialog.student) {
      // This function is for the dialog component which uses a different interface
      console.log("Delete student:", deleteDialog.student);
      setDeleteDialog({ open: false, student: null });
    }
  };

  const clearFilters = async () => {
    setSearchTerm("");
    setEmailFilter("");
    setPhoneNumber("");
    setStatusFilter("all");
    setSortOrderDisplay("");
    setSortBy("");
    setSortOrder("");
    
    // Reload initial student list without showing loading state
    try {
      setError(null);
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
      console.error('Error fetching students:', err);
    }
  };

  const hasActiveFilters = searchTerm !== "" || emailFilter !== "" || phoneNumber !== "" || statusFilter !== "all" || sortOrderDisplay !== "";

  // Get unique statuses for filter options
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(students.map(s => s.statusName || (s.isDeleted ? 'Inactive' : 'Active')))];
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
                    {[searchTerm, emailFilter, phoneNumber, statusFilter, sortOrderDisplay].filter(f => f !== "" && f !== "all").length}
                  </span>
                )}
              </span>
            </Button>
            <Button
              onClick={filterStudentsAPI}
              disabled={isSearching}
              className="whitespace-nowrap bg-primary-600 hover:bg-primary-700 text-white"
            >
              <span className="flex items-center gap-2">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </span>
            </Button>
            <Button
              onClick={clearFilters}
              variant="secondary"
              className="whitespace-nowrap text-red-500"
            >
              <span className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Clear All
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
                value={sortOrderDisplay}
                onChange={(e) => {
                  setSortOrderDisplay(e.target.value);
                  parseSortOrder(e.target.value);
                }}
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
        message={`Are you sure you want to delete this student? This action cannot be undone.`}
      />
    </div>
  );
}

