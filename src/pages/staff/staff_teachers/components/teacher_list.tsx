import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Table, { type TableColumn } from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { 
  Eye, UserX, Plus, User, Download,
  GraduationCap, Search, Filter, X, 
  Loader2, RefreshCw, CheckSquare, Square
} from "lucide-react";
import { getTeachers, filterTeacher } from "@/api/teacher.api";
import type { Teacher } from "@/types/teacher.type";
import type { FilterUserParam } from "@/types/filter.type";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
import { setIsDelete, setIsActive } from "@/api/account.api";
import Pagination from "@/shared/pagination";
import { isStaffUser } from "@/lib/utils";


export default function TeacherList() {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teacher: Teacher | null; action?: 'ban' | 'unban' }>({ open: false, teacher: null });
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const isStaff = isStaffUser();
  const basePath = isStaff ? '/staff' : '/admin';
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createdDateFrom, setCreatedDateFrom] = useState<string>("");
  const [createdDateTo, setCreatedDateTo] = useState<string>("");
  const [sortOrderDisplay, setSortOrderDisplay] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Data states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Filter teachers with API
  const filterTeachersAPI = async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      const filterParam: FilterUserParam = {
        name: searchTerm || null,
        email: emailFilter || null,
        phoneNumber: phoneNumber || null,
        statusName: statusFilter === "all" ? null : statusFilter,
        roleName: "Teacher",
        createdAtFrom: createdDateFrom || null,
        createdAtTo: createdDateTo || null,
        sortBy: sortBy || null,
        sortOrder: sortOrder || null,
        currentRole: "Teacher"
      };
      
      const data = await filterTeacher(filterParam);
      setTeachers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter teachers');
      console.error('Error filtering teachers:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch teachers data
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teachers');
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, emailFilter, phoneNumber, statusFilter, createdDateFrom, createdDateTo, sortOrderDisplay]);
  
  // Calculate pagination
  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeachers = useMemo(() => {
    return teachers.slice(startIndex, endIndex);
  }, [teachers, startIndex, endIndex]);

  const clearFilters = async () => {
    setSearchTerm("");
    setEmailFilter("");
    setPhoneNumber("");
    setStatusFilter("all");
    setCreatedDateFrom("");
    setCreatedDateTo("");
    setSortOrderDisplay("");
    setSortBy("");
    setSortOrder("");
    
    // Reload initial teacher list without showing loading state
    try {
      setError(null);
      const data = await getTeachers();
      setTeachers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teachers');
      console.error('Error fetching teachers:', err);
    }
  };

  const toggleTeacherSelection = (teacherId: string) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleBulkExport = () => {
    console.log("Bulk export:", selectedTeachers);
  };

  const handleBulkDelete = () => {
    console.log("Bulk delete:", selectedTeachers);
    setSelectedTeachers([]);
  };

  const activeFiltersCount = [searchTerm, emailFilter, phoneNumber, statusFilter, createdDateFrom, createdDateTo, sortOrderDisplay].filter(item => item !== "" && item !== "all").length;

  // Get unique statuses for filter options
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(teachers.map(t => t.statusName).filter(Boolean))];
    return uniqueStatuses.sort();
  }, [teachers]);

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

  // Define columns for DataTable
  const columns: TableColumn<Teacher>[] = [
    { 
      header: "Teacher", 
      className: "w-2/5", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleTeacherSelection(row.accountId)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {selectedTeachers.includes(row.accountId) ? (
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
            {row.teacherInfo?.teacherCode && (
              <div className="text-xs text-gray-500 font-mono">
                Code: {row.teacherInfo.teacherCode}
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
          {row.phoneNumber || "N/A"}
        </div>
      )
    },
    // { 
    //   header: "Experience", 
    //   accessor: (row) => (
    //     <div className="text-sm">
    //       {row.teacherInfo?.yearsExperience ? (
    //         <div className="flex items-center gap-1">
    //           <Award className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
    //           <span>{row.teacherInfo.yearsExperience} years</span>
    //         </div>
    //       ) : (
    //         "N/A"
    //       )}
    //     </div>
    //   )
    // },
    // { 
    //   header: "Credentials", 
    //   accessor: (row) => (
    //     <div className="text-sm flex items-center gap-1">
    //       <GraduationCap className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
    //       <span>
    //         {row.teacherInfo?.teacherCredentials?.length || 0} credential{(row.teacherInfo?.teacherCredentials?.length || 0) !== 1 ? 's' : ''}
    //       </span>
    //     </div>
    //   )
    // },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.statusName === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.statusName === 'Inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${row.statusName === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
          ${row.statusName === 'Locked' || row.statusName === 'Blocked' ? 'bg-red-100 text-red-700 border-red-200' : ''}
        `}>
          {row.statusName || 'Unknown'}
        </span>
      )
    },
    { 
      header: "Join Date", 
      accessor: (row) => new Date(row.createdAt).toLocaleDateString() 
    },
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
          {!isStaff && (
            row.statusName === 'Blocked' || row.statusName === 'Locked' ? (
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
            )
          )}
        </div>
      )
    }
  ];


  const handleAdd = () => {
    navigate(`${basePath}/teachers/add`);
  };

  const handleView = (teacher: Teacher) => {
    navigate(`${basePath}/teachers/${teacher.accountId}`);
  };

  const handleBan = (teacher: Teacher) => {
    setDeleteDialog({ open: true, teacher, action: 'ban' });
  };

  const handleUnban = (teacher: Teacher) => {
    setDeleteDialog({ open: true, teacher, action: 'unban' });
  };

  const confirmDelete = async () => {
    if (deleteDialog.teacher) {
      try {
        if (deleteDialog.action === 'ban') {
          await setIsDelete(deleteDialog.teacher.accountId);
          console.log("Banned teacher:", deleteDialog.teacher.accountId);
        } else if (deleteDialog.action === 'unban') {
          await setIsActive(deleteDialog.teacher.accountId);
          console.log("Unbanned teacher:", deleteDialog.teacher.accountId);
        }
        
        // Refresh data from API to get updated status
        await fetchTeachers();
        
        setDeleteDialog({ open: false, teacher: null });
      } catch (error) {
        console.error("Error updating teacher status:", error);
      }
    }
  };


  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-gray-600">Loading teachers...</span>
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Teachers</h3>
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
      {/* Enhanced Teachers List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Teachers Management</h2>
              <p className="text-gray-600 mt-1">
                {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} found
                {selectedTeachers.length > 0 && ` • ${selectedTeachers.length} selected`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Bulk Actions */}
              {selectedTeachers.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedTeachers.length} selected
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
              
              {/* Add Teacher Button */}
              {!isStaff && (
                <Button onClick={handleAdd} className="whitespace-nowrap" iconLeft={<Plus className="w-4 h-4" />}>
                  Add Teacher
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Enhanced Search and Filter Section */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search teachers by name, email, or code..."
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
                  onClick={filterTeachersAPI}
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
                  onClick={fetchTeachers}
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
                  <Select
                    label="Sort Order"
                    value={sortOrderDisplay}
                    onChange={(e) => {
                      setSortOrderDisplay(e.target.value);
                      parseSortOrder(e.target.value);
                    }}
                    options={sortOptions}
                  />
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
                      ...statuses.map(status => ({ label: status || "Unknown", value: status || "unknown" }))
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Created Date From"
                    type="date"
                    value={createdDateFrom}
                    onChange={(e) => setCreatedDateFrom(e.target.value)}
                  />
                  <Input
                    label="Created Date To"
                    type="date"
                    value={createdDateTo}
                    onChange={(e) => setCreatedDateTo(e.target.value)}
                    min={createdDateFrom || undefined}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content Area with Enhanced States */}
          {teachers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || activeFiltersCount > 0 
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first teacher"
                }
              </p>
              {!isStaff && (
                <Button onClick={handleAdd} iconLeft={<Plus className="w-4 h-4" />}>
                  Add Teacher
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table columns={columns} data={paginatedTeachers} />
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={teachers.length}
                    startIndex={startIndex + 1}
                    endIndex={Math.min(endIndex, teachers.length)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) => setDeleteDialog({ open, teacher: null })}
        onConfirm={confirmDelete}
        title={deleteDialog.action === 'ban' ? "Ban Teacher" : "Unban Teacher"}
        message={deleteDialog.action === 'ban' 
          ? `Are you sure you want to ban "${deleteDialog.teacher?.fullName}"? This will deactivate their account.`
          : `Are you sure you want to unban "${deleteDialog.teacher?.fullName}"? This will reactivate their account.`
        }
      />
    </div>
  );
}