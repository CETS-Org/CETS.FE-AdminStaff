import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/shared/pagination";
import { Search, Filter, X, Eye, Edit, Trash2, Plus, Loader2, User } from "lucide-react";
import { filterTeacher, getTeachers } from "@/api/teacher.api";
import type { Teacher } from "@/types/teacher.type";
import type { FilterUserParam } from "@/types/filter.type";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
import EditTeacherProfileDialog from "./EditTeacherProfileDialog";
import { setIsDelete, setIsActive } from "@/api/account.api";


export default function TeacherList() {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teacher: Teacher | null; action?: 'ban' | 'unban' }>({ open: false, teacher: null });
  const [editDialog, setEditDialog] = useState<{ open: boolean; teacher: Teacher | null }>({ open: false, teacher: null });
  
  // Data states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        sortBy: sortBy || null,
        sortOrder: sortOrder || null,
        roleName: "Teacher",
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


  // No need for client-side filtering anymore
  const filteredTeachers = teachers;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const currentData = useMemo(
    () => filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredTeachers, currentPage]
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, emailFilter, phoneNumber, statusFilter, sortOrder]);

  const columns: TableColumn<Teacher>[] = [
    { 
      header: "Teacher", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
            {row.avatarUrl ? (
              <img 
                src={row.avatarUrl} 
                alt={row.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              row.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-medium">{row.fullName}</div>
            <div className="text-sm text-neutral-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { 
      header: "Phone", 
      accessor: (row) => row.phoneNumber || "N/A" 
    },
    { 
      header: "Date of Birth", 
      accessor: (row) => row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : "N/A" 
    },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.statusName?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.statusName?.toLowerCase() === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${row.statusName?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
          ${row.statusName?.toLowerCase() === 'locked' ? 'bg-red-100 text-red-700 border-red-200' : ''}
        `}>
          {row.statusName || 'Unknown'}
        </span>
      )
    },
    { 
      header: "Created Date", 
      accessor: (row) => new Date(row.createdAt).toLocaleDateString() 
    },
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
          {row.statusName === 'Blocked' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleUnban(row)}
              className="inline-flex items-center justify-center gap-2 text-green-600 hover:text-green-700"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="leading-none">Unban</span>
              </div>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBan(row)}
              className="inline-flex items-center justify-center gap-2 text-red-600 hover:text-red-700"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 flex-shrink-0" />
                <span className="leading-none">Ban</span>
              </div>
            </Button>
          )}
        </div>
      )
    }
  ];

  const handleAdd = () => {
    navigate("/staff/teachers/add");
  };

  const handleEdit = (teacher: Teacher) => {
    setEditDialog({ open: true, teacher });
  };

  const handleView = (teacher: Teacher) => {
    navigate(`/staff/teachers/${teacher.accountId}`);
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

  const handleSaveTeacher = (updatedTeacher: Teacher) => {
    setTeachers(prev => 
      prev.map(teacher => 
        teacher.accountId === updatedTeacher.accountId ? updatedTeacher : teacher
      )
    );
    setEditDialog({ open: false, teacher: null });
  };

  const clearFilters = async () => {
    setSearchTerm("");
    setEmailFilter("");
    setPhoneNumber("");
    setStatusFilter("all");
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

  const hasActiveFilters = searchTerm !== "" || emailFilter !== "" || phoneNumber !== "" || statusFilter !== "all" || sortOrderDisplay !== "";

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

  return (
    <div>
      <Card 
        title="Teacher List" 
        description="View and manage all teachers"
        actions={
          <Button onClick={handleAdd} size="sm" className="inline-flex items-center gap-2">
            <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Teacher
            </div>
          </Button>
        }
      >
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
                  placeholder="Search teachers by name..."
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
              onClick={filterTeachersAPI}
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
                  ...statuses.map(status => ({ label: status || "Unknown", value: status || "unknown" }))
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading teachers...</h3>
            <p className="text-gray-500">Please wait while we fetch the data.</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading teachers</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="secondary">
              Try Again
            </Button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <Table 
            columns={columns} 
            data={currentData}
            emptyState={
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {hasActiveFilters ? "No teachers match your filters" : "No teachers found"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters 
                    ? "Try adjusting your search criteria or clear the filters."
                    : "Get started by adding your first teacher."
                  }
                </p>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters} variant="secondary">
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={handleAdd} className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Teacher
                  </Button>
                )}
              </div>
            }
          />
        )}
      </Card>      
      
      {/* Pagination */}
      {!loading && !error && filteredTeachers.length > 0 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredTeachers.length}
          startIndex={(currentPage - 1) * itemsPerPage}
          endIndex={Math.min(currentPage * itemsPerPage, filteredTeachers.length)}
        />
      )}

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

      <EditTeacherProfileDialog
        open={editDialog.open}
        onOpenChange={(open: boolean) => setEditDialog({ open, teacher: null })}
        teacher={editDialog.teacher}
        onSave={handleSaveTeacher}
      />
      
    </div>
  );
}