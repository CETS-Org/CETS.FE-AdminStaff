import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/shared/pagination";
import DeleteConfirmDialog from "./delete_confirm_dialog";
import { Search, Filter, X, Eye, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { getTeachers, type Teacher } from "@/pages/api/account.api";

// interface Qualification {
//   id: string;
//   degree: string;
//   institution: string;
//   year: string;
//   field: string;
// }

// type Teacher = {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   dateOfBirth: string;
//   hireDate: string;
//   specialization: string;
//   experience: string;
//   status: "active" | "inactive";
//   avatar?: string;
//   qualifications: Qualification[];
// };

export default function TeacherList() {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teacher: Teacher | null }>({ open: false, teacher: null });
  
  // Data states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch teachers data
  useEffect(() => {
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

    fetchTeachers();
  }, []);

  // Filter and search logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      const matchesSearch = searchTerm === "" || 
        teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.phoneNumber && teacher.phoneNumber.includes(searchTerm)) ||
        teacher.roleNames.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || teacher.statusName.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchTerm, statusFilter]);

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
  }, [searchTerm, statusFilter]);

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
      header: "Role", 
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roleNames.map((role, index) => (
            <span 
              key={index}
              className="inline-flex px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-700 border border-blue-200"
            >
              {role}
            </span>
          ))}
        </div>
      )
    },
    { 
      header: "Date of Birth", 
      accessor: (row) => row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : "N/A" 
    },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.statusName.toLowerCase() === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.statusName.toLowerCase() === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${row.statusName.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
          ${row.statusName.toLowerCase() === 'suspended' ? 'bg-red-100 text-red-700 border-red-200' : ''}
        `}>
          {row.statusName}
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
    navigate("/staff/teachers/add");
  };

  const handleEdit = (teacher: Teacher) => {
    navigate(`/staff/teachers/edit/${teacher.accountId}`);
  };

  const handleView = (teacher: Teacher) => {
    navigate(`/staff/teachers/${teacher.accountId}`);
  };

  const handleDelete = (teacher: Teacher) => {
    setDeleteDialog({ open: true, teacher });
  };


  const confirmDelete = () => {
    if (deleteDialog.teacher) {
      setTeachers(prev => prev.filter(t => t.accountId !== deleteDialog.teacher!.accountId));
      setDeleteDialog({ open: false, teacher: null });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  // Get unique statuses for filter options
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(teachers.map(t => t.statusName))];
    return uniqueStatuses.sort();
  }, [teachers]);

  return (
    <div>
      <Card 
        title="Teacher List" 
        description="View and manage all teachers"
        actions={
          <Button onClick={handleAdd} size="sm" className="inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Teacher
          </Button>
        }
      >
        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search teachers by name, email, phone, or specialization..."
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
                    {[searchTerm, statusFilter].filter(f => f !== "" && f !== "all").length}
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
                  ...statuses.map(status => ({ label: status, value: status.toLowerCase() }))
                ]}
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
        title="Delete Teacher"
        message={`Are you sure you want to delete "${deleteDialog.teacher?.fullName}"? This action cannot be undone.`}
      />
      
    </div>
  );
}