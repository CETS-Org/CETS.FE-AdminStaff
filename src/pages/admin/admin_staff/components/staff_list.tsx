import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/shared/pagination";
import { Search, X, Eye, Edit, Trash2, Plus, Loader2, User } from "lucide-react";
import { filterStaff, getStaffs } from "@/api/staff.api";
import type { Account } from "@/types/account.type";
import type { FilterUserParam } from "@/types/filter.type";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
import AddEditStaffDialog from "./AddEditStaffDialog";
import { setIsDelete, setIsActive } from "@/api/account.api";

export default function StaffList() {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; staff: Account | null; action?: 'ban' | 'unban' }>({ open: false, staff: null });
  const [addEditDialog, setAddEditDialog] = useState<{ open: boolean; staff: Account | null; mode: "add" | "edit" }>({ open: false, staff: null, mode: "add" });
  
  // Data states
  const [staffs, setStaffs] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortOrderDisplay, setSortOrderDisplay] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);

  // Parse sortOrder to get sortBy and sortOrder
  const parseSortOrder = (sortValue: string) => {
    if (!sortValue) {
      setSortBy("");
      setSortOrder("");
      return;
    }

    switch (sortValue) {
      case "name_asc":
        setSortBy("name");
        setSortOrder("asc");
        break;
      case "name_desc":
        setSortBy("name");
        setSortOrder("desc");
        break;
      case "email_asc":
        setSortBy("email");
        setSortOrder("asc");
        break;
      case "email_desc":
        setSortBy("email");
        setSortOrder("desc");
        break;
      case "created_desc":
        setSortBy("createdat");
        setSortOrder("desc");
        break;
      case "created_asc":
        setSortBy("createdat");
        setSortOrder("asc");
        break;
      default:
        setSortBy("");
        setSortOrder("");
        break;
    }
  };

  // Manual filter function
  const filterStaffsAPI = async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      // Always call API with current parameters (including sorting)
      
      if(roleFilter === "all") {
        const filterParams: FilterUserParam = {
          name: searchTerm.trim() || null,
          email: emailFilter.trim() || null,
          phoneNumber: phoneNumber.trim() || null,
          statusName: statusFilter === "all" ? null : statusFilter,
          roleName: null,
          sortOrder: sortOrder || null,
          currentRole: null,
          sortBy: sortBy || null
        };

        const filteredResults = await filterStaff(filterParams);
        setStaffs(filteredResults);
      } else {
        // Prepare filter parameters
        const filterParams: FilterUserParam = {
          name: searchTerm.trim() || null,
          email: emailFilter.trim() || null,
          phoneNumber: phoneNumber.trim() || null,
          statusName: statusFilter === "all" ? null : statusFilter,
          roleName: roleFilter,
          sortOrder: sortOrder || null,
          currentRole: null,
          sortBy: sortBy || null
        };

        console.log("Filtering staffs with params:", filterParams);
        const filteredResults = await filterStaff(filterParams);
        console.log("Filter results:", filteredResults);
        setStaffs(filteredResults);
      }
    } catch (err) {
      console.error("Error filtering staffs:", err);
      setError("Failed to filter staffs");
    } finally {
      setIsSearching(false);
    }
  };

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStaffs();
      console.log("Staffs data:", data);
      setStaffs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staffs');
      console.error('Error fetching staffs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);
  // No need for client-side filtering anymore
  const filteredStaffs = staffs;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);
  const currentData = useMemo(
    () => filteredStaffs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredStaffs, currentPage]
  );

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [staffs]);

  const columns: TableColumn<Account>[] = [
    { 
      header: "Staff", 
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
          ${row.statusName?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.statusName?.toLowerCase() === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${row.statusName?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
          ${row.statusName?.toLowerCase() === 'suspended' ? 'bg-red-100 text-red-700 border-red-200' : ''}
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
          {row.isDeleted ? (
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
    setAddEditDialog({ open: true, staff: null, mode: "add" });
  };

  const handleView = (staff: Account) => {
    navigate(`/admin/staffs/${staff.accountId}`);
  };

  const handleEdit = (staff: Account) => {
    setAddEditDialog({ open: true, staff, mode: "edit" });
  };

  const handleBan = (staff: Account) => {
    setDeleteDialog({ open: true, staff, action: 'ban' });
  };

  const handleUnban = (staff: Account) => {
    setDeleteDialog({ open: true, staff, action: 'unban' });
  };

  const confirmDelete = async () => {
    if (deleteDialog.staff) {
      try {
        if (deleteDialog.action === 'ban') {
          await setIsDelete(deleteDialog.staff.accountId);
          console.log("Banned staff:", deleteDialog.staff.accountId);
        } else if (deleteDialog.action === 'unban') {
          await setIsActive(deleteDialog.staff.accountId);
          console.log("Unbanned staff:", deleteDialog.staff.accountId);
        }
        
        // Refresh data from API to get updated status
        await fetchStaffs();
        
        setDeleteDialog({ open: false, staff: null });
      } catch (error) {
        console.error("Error updating staff status:", error);
      }
    }
  };

  const handleUpdateSuccess = () => {
    // Refresh the staff list after successful update
    fetchStaffs();
  };

  const clearFilters = async () => {
    setSearchTerm("");
    setEmailFilter("");
    setPhoneNumber("");
    setStatusFilter("all");
    setRoleFilter("all");
    setSortOrderDisplay("");
    setSortBy("");
    setSortOrder("");
    // Reset to original data
    try {
      setLoading(true);
      setError(null);
      const data = await getStaffs();
      setStaffs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staffs');
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = searchTerm !== "" || emailFilter !== "" || phoneNumber !== "" || statusFilter !== "all" || roleFilter !== "all" || sortOrderDisplay !== "";

  // Get unique statuses for filter options
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(staffs.map(s => s.statusName).filter(Boolean))];
    return uniqueStatuses.sort();
  }, [staffs]);

  // Get unique roles for filter options
  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(staffs.flatMap(s => s.roleNames))];
    return uniqueRoles.sort();
  }, [staffs]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading staffs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Staffs</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="secondary" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage academic and accountant staff members</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Staff
          </div>
        </Button>
      </div>

       {/* Search and Filter */}
       <Card title="Search & Filter" description="Enter your search criteria and click Search to filter staff members">
         <div className="space-y-4">
           {/* Filter Options */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <Input
               label="Name"
               placeholder="Enter staff name..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
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
             <Select
               label="Role"
               value={roleFilter}
               onChange={(e) => setRoleFilter(e.target.value)}
               options={[
                 { label: "All Roles", value: "all" },
                 ...roles.map(role => ({ label: role, value: role }))
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

           {/* Action Buttons */}
           <div className="flex flex-end justify-end items-center gap-3 pt-4 border-t">
           {hasActiveFilters && (
               <div className="flex items-center gap-2 text-sm text-gray-600">
                 <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-md">
                    {[searchTerm, emailFilter, phoneNumber, statusFilter, roleFilter, sortOrderDisplay].filter(f => f !== "" && f !== "all").length} filters active
                 </span>
               </div>
             )}
             <Button
               onClick={filterStaffsAPI}
               disabled={isSearching}
               className="flex items-center gap-2"
             >
               {isSearching ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" />
                   Searching...
                 </>
               ) : (
                 <div className="flex items-center gap-2">
                   <Search className="w-4 h-4" />
                   Search
                 </div>
               )}
             </Button>
             <Button
               onClick={clearFilters}
               variant="secondary"
               className="flex items-center gap-2 text-red-500"
             >
               <div className="flex items-center gap-2">
               <X className="w-4 h-4" />
               Clear All
               </div>
             </Button>
            
           </div>
         </div>
       </Card>

      {/* Staff Table */}
      <Card title="Staff List" description="View and manage all staff members">
        <Table
          columns={columns}
          data={currentData}
          emptyState={
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your search or filter criteria" 
                  : "Get started by adding your first staff member"
                }
              </p>
              {!hasActiveFilters && (
                <Button onClick={handleAdd} className="flex  items-center gap-2 mx-auto">
                  <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Staff
                  </div>
                </Button>
              )}
            </div>
          }
        />
      </Card>

      {/* Pagination */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredStaffs.length}
        startIndex={(currentPage - 1) * itemsPerPage}
        endIndex={Math.min(currentPage * itemsPerPage, filteredStaffs.length)}
      />
    
      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) => setDeleteDialog({ open, staff: null })}
        onConfirm={confirmDelete}
        title={deleteDialog.action === 'ban' ? "Ban Staff" : "Unban Staff"}
        message={deleteDialog.action === 'ban' 
          ? `Are you sure you want to ban "${deleteDialog.staff?.fullName}"? This will deactivate their account.`
          : `Are you sure you want to unban "${deleteDialog.staff?.fullName}"? This will reactivate their account.`
        }
      />


      <AddEditStaffDialog
        open={addEditDialog.open}
        onOpenChange={(open: boolean) => setAddEditDialog({ open, staff: null, mode: "add" })}
        onUpdateSuccess={handleUpdateSuccess}
        staff={addEditDialog.staff}
        mode={addEditDialog.mode}
      />
    </div>
  );
}
