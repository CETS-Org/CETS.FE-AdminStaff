import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Table, { type TableColumn } from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/shared/pagination";
import { 
  Eye, Edit, UserX, Search, Filter, X, Plus, Loader2, User, 
  Download, RefreshCw, AlertCircle, CheckSquare, Square, Users
} from "lucide-react";
import { getStudents, filterStudent } from "@/api/student.api";
import type { FilterUserParam } from "@/types/filter.type";
import type { Student } from "@/types/student.type";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
import { useStudentStore } from "@/store/student.store";
import { setIsDelete, setIsActive } from "@/api/account.api";

export default function StudentsList() {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; student: Student | null; action?: 'ban' | 'unban' }>({ open: false, student: null });
  const { students, setStudents } = useStudentStore();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

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

  useEffect(() => {
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
      className: "w-2/5", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleStudentSelection(row.accountId)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {selectedStudents.includes(row.accountId) ? (
              <CheckSquare className="w-4 h-4 text-primary-600" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <div className="relative w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-primary-700 font-bold text-lg shadow-sm overflow-hidden">
            {row.avatarUrl ? (
              <img 
                src={row.avatarUrl} 
                alt={row.fullName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              row.fullName.charAt(0)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 truncate">{row.fullName}</div>
            <div className="text-sm text-gray-600 truncate">{row.email}</div>
            {row.studentInfo?.studentCode && (
              <div className="text-xs text-gray-500 font-mono">
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
      className: "w-40",
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={() => handleView(row)}
            className="!p-2 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => handleEdit(row)}
            className="!p-2 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Edit className="w-4 h-4" />
          </Button>
          {row.statusName === 'Locked' ? (
            <Button
              size="sm"
              onClick={() => handleUnban(row)}
              className="!p-2 !bg-emerald-50 !text-emerald-600 !border !border-emerald-200 hover:!bg-emerald-100 hover:!text-emerald-700 hover:!border-emerald-300 !transition-colors !rounded-md"
            >
              <User className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleBan(row)}
              className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md"
            >
              <UserX className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleAdd = () => {
    navigate('/staff/students/add');
  };

  const handleView = (student: Student) => {
    // Use accountId for navigation to student detail page
    navigate(`/staff/students/${student.accountId}`);
  };

  const handleEdit = (student: Student) => {
    navigate(`/staff/students/edit/${student.accountId}`);
  };

  const handleBan = (student: Student) => {
    setDeleteDialog({ open: true, student, action: 'ban' });
  };

  const handleUnban = (student: Student) => {
    setDeleteDialog({ open: true, student, action: 'unban' });
  };

  // const handleSave = (updatedStudentData: UpdateStudent) => {
  //   console.log("Save student:", updatedStudentData);
  //   
  //   // Use store function to update student
  //   updatedStudent(updatedStudentData);
  //   
  //   setOpenDialog(false);
  //   setEditingStudent(null);
  // }; // Replaced with page navigation

  const confirmDelete = async () => {
    if (deleteDialog.student) {
      try {
        if (deleteDialog.action === 'ban') {
          await setIsDelete(deleteDialog.student.accountId);
          console.log("Banned student:", deleteDialog.student.accountId);
        } else if (deleteDialog.action === 'unban') {
          await setIsActive(deleteDialog.student.accountId);
          console.log("Unbanned student:", deleteDialog.student.accountId);
        }
        
        // Refresh data from API to get updated status
        await fetchStudents();
        
        setDeleteDialog({ open: false, student: null });
      } catch (error) {
        console.error("Error updating student status:", error);
      }
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

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleBulkExport = () => {
    console.log("Bulk export:", selectedStudents);
  };

  const handleBulkDelete = () => {
    console.log("Bulk delete:", selectedStudents);
    setSelectedStudents([]);
  };

  // const hasActiveFilters = searchTerm !== "" || emailFilter !== "" || phoneNumber !== "" || statusFilter !== "all" || sortOrderDisplay !== ""; // Not used
  const activeFiltersCount = [searchTerm, emailFilter, phoneNumber, statusFilter, sortOrderDisplay].filter(item => item !== "" && item !== "all").length;

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
    <div className="space-y-6">
      {/* Enhanced Students List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Students Management</h2>
              <p className="text-gray-600 mt-1">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                {selectedStudents.length > 0 && ` • ${selectedStudents.length} selected`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Bulk Actions */}
              {selectedStudents.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedStudents.length} selected
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleBulkExport}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 border-red-300 hover:bg-red-100"
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Add Student Button */}
              <Button onClick={handleAdd} className="whitespace-nowrap" iconLeft={<Plus className="w-4 h-4" />}>
                Add Student
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Enhanced Search and Filter Section */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search students by name, email, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {isSearching && (
                  <Loader2 className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`whitespace-nowrap transition-colors ${showFilters ? 'bg-primary-50 text-primary-700 border-primary-200' : ''}`}
                  iconLeft={<Filter className="w-4 h-4 mr-2" />}
                >
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5 ml-2 min-w-[18px] text-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
                
                <Button
                  onClick={filterStudentsAPI}
                  disabled={isSearching}
                  className="whitespace-nowrap bg-primary-600 hover:bg-primary-700 text-white"
                  iconLeft={isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                >
                  Search
                </Button>
                
                {activeFiltersCount > 0 && (
                  <Button
                    variant="secondary"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                    iconLeft={<X className="w-4 h-4" />}
                  >
                    Clear
                  </Button>
                )}
                
                <Button
                  variant="secondary"
                  onClick={fetchStudents}
                  className="p-2"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              </div>
            )}
          </div>

          {/* Content Area with Enhanced States */}
          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Students</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchStudents}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || activeFiltersCount > 0 
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first student"
                }
              </p>
              <Button onClick={handleAdd} iconLeft={<Plus className="w-4 h-4" />}>
                Add Student
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table columns={columns} data={currentData} />
              </div>
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredStudents.length}
                startIndex={(currentPage - 1) * itemsPerPage + 1}
                endIndex={Math.min(currentPage * itemsPerPage, filteredStudents.length)}
              />
            </div>
          )}
        </div>
      </div>

      {/* AddEditStudentDialog replaced with dedicated pages */}

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) => setDeleteDialog({ open, student: null })}
        onConfirm={confirmDelete}
        title={deleteDialog.action === 'ban' ? "Ban Student" : "Unban Student"}
        message={deleteDialog.action === 'ban' 
          ? `Are you sure you want to ban "${deleteDialog.student?.fullName}"? This will deactivate their account.`
          : `Are you sure you want to unban "${deleteDialog.student?.fullName}"? This will reactivate their account.`
        }
      />
    </div>
  );
}

