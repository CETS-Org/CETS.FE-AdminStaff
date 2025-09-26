import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, { type TableColumn } from "@/components/ui/Table";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Eye, Edit, Trash2, Plus, Loader2, User, Users, UserCheck, UserX, Shield, TrendingUp, Download, X, Search, Filter, CheckSquare, Square, RefreshCw } from "lucide-react";
import { getStaffs, filterStaff } from "@/api/staff.api";
import type { Account } from "@/types/account.type";
import type { FilterUserParam } from "@/types/filter.type";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
import AddEditStaffDialog from "./AddEditStaffDialog";
import { setIsDelete, setIsActive } from "@/api/account.api";

export default function StaffList() {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; staff: Account | null; action?: 'ban' | 'unban' }>({ open: false, staff: null });
  const [addEditDialog, setAddEditDialog] = useState<{ open: boolean; staff: Account | null; mode: "add" | "edit" }>({ open: false, staff: null, mode: "add" });
  const [selectedStaffs, setSelectedStaffs] = useState<string[]>([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortOrderDisplay, setSortOrderDisplay] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Data states
  const [staffs, setStaffs] = useState<Account[]>([]);
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

  // Filter staffs with API
  const filterStaffsAPI = async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      const filterParam: FilterUserParam = {
        name: searchTerm || null,
        email: emailFilter || null,
        phoneNumber: phoneNumber || null,
        statusName: statusFilter === "all" ? null : statusFilter,
        roleName: roleFilter === "all" ? null : roleFilter,
        sortBy: sortBy || null,
        sortOrder: sortOrder || null,
        currentRole: "Staff"
      };
      
      const data = await filterStaff(filterParam);
      setStaffs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter staffs');
      console.error('Error filtering staffs:', err);
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

  // Reset page when filters change
  useEffect(() => {
    // Reset any pagination if needed
  }, [searchTerm, emailFilter, phoneNumber, statusFilter, roleFilter, sortOrder]);

  const clearFilters = async () => {
    setSearchTerm("");
    setEmailFilter("");
    setPhoneNumber("");
    setStatusFilter("all");
    setRoleFilter("all");
    setSortOrderDisplay("");
    setSortBy("");
    setSortOrder("");
    
    // Reload initial staff list without showing loading state
    try {
      setError(null);
      const data = await getStaffs();
      setStaffs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staffs');
      console.error('Error fetching staffs:', err);
    }
  };

  const toggleStaffSelection = (staffId: string) => {
    setSelectedStaffs(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleBulkExport = () => {
    console.log("Bulk export:", selectedStaffs);
  };

  const handleBulkDelete = () => {
    console.log("Bulk delete:", selectedStaffs);
    setSelectedStaffs([]);
  };

  const activeFiltersCount = [searchTerm, emailFilter, phoneNumber, statusFilter, roleFilter, sortOrderDisplay].filter(item => item !== "" && item !== "all").length;

  // Get unique statuses for filter options
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(staffs.map(s => s.statusName).filter(Boolean))];
    return uniqueStatuses.sort();
  }, [staffs]);

  // Get unique roles for filter options
  const roles = useMemo(() => {
    const allRoles = staffs.flatMap(s => s.roleNames);
    const uniqueRoles = [...new Set(allRoles)];
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

  const columns: TableColumn<Account>[] = [
    { 
      header: "Staff", 
      className: "w-2/5",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleStaffSelection(row.accountId)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {selectedStaffs.includes(row.accountId) ? (
              <CheckSquare className="w-4 h-4 text-primary-600" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </button>
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
          ${row.statusName?.toLowerCase() === 'blocked' || row.statusName?.toLowerCase() === 'locked' ? 'bg-red-100 text-red-700 border-red-200' : ''}
          ${row.isDeleted ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${!row.statusName && !row.isDeleted ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
        `}>
          {row.statusName || (row.isDeleted ? 'Inactive' : 'Active')}
        </span>
      )
    },
    { 
      header: "Created Date", 
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
          <Button
            size="sm"
            onClick={() => handleEdit(row)}
            className="!p-2 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Edit className="w-4 h-4" />
          </Button>
          {row.statusName === 'Blocked' || row.statusName === 'Locked' || row.isDeleted ? (
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

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Staff Management", href: "/admin/staffs" }
  ];

  // Statistics calculations
  const stats = {
    total: staffs.length,
    active: staffs.filter(s => s.statusName?.toLowerCase() === 'active').length,
    inactive: staffs.filter(s => s.statusName?.toLowerCase() === 'inactive').length,
    suspended: staffs.filter(s => s.statusName?.toLowerCase() === 'suspended').length,
    academic: staffs.filter(s => s.roleNames.some(role => role.toLowerCase().includes('academic'))).length,
    accountant: staffs.filter(s => s.roleNames.some(role => role.toLowerCase().includes('accountant'))).length
  };

  const handleExport = () => {
    const dataToExport = staffs.map(staff => ({
      'Full Name': staff.fullName,
      'Email': staff.email,
      'Phone': staff.phoneNumber || 'N/A',
      'Roles': staff.roleNames.join(', '),
      'Status': staff.statusName || 'Unknown',
      'Date of Birth': staff.dateOfBirth ? new Date(staff.dateOfBirth).toLocaleDateString() : 'N/A',
      'Created Date': new Date(staff.createdAt).toLocaleDateString()
    }));
    
    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };


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
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title="Staff Management"
        description="Manage and oversee all staff members with comprehensive tools"
        icon={<Users className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Export',
            variant: 'secondary',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExport
          }
        ]}
      />

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-700">Active</p>
              <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                {stats.active}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% of total` : '0% of total'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Inactive</p>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
                {stats.inactive}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Not active
              </p>
            </div>
          </div>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <UserX className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-700">Suspended</p>
              <p className="text-3xl font-bold text-red-900 group-hover:text-red-600 transition-colors">
                {stats.suspended}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Restricted access
              </p>
            </div>
          </div>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-700">Academic</p>
              <p className="text-3xl font-bold text-purple-900 group-hover:text-purple-600 transition-colors">
                {stats.academic}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Teaching staff
              </p>
            </div>
          </div>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-700">Accountant</p>
              <p className="text-3xl font-bold text-yellow-900 group-hover:text-yellow-600 transition-colors">
                {stats.accountant}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Finance team
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Staff List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Staff Management</h2>
              <p className="text-gray-600 mt-1">
                {staffs.length} staff member{staffs.length !== 1 ? 's' : ''} found
                {selectedStaffs.length > 0 && ` • ${selectedStaffs.length} selected`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Bulk Actions */}
              {selectedStaffs.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedStaffs.length} selected
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
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Add Staff Button */}
              <Button onClick={handleAdd} className="whitespace-nowrap" iconLeft={<Plus className="w-4 h-4" />}>
                Add Staff
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
                  placeholder="Search staff by name, email, or phone..."
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
                  onClick={filterStaffsAPI}
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
                  onClick={fetchStaffs}
                  className="p-2"
                  title="Refresh"
                >
                 <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              </div>
            )}
          </div>

          {/* Content Area with Enhanced States */}
          {staffs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No staff found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || activeFiltersCount > 0 
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first staff member"
                }
              </p>
              <Button onClick={handleAdd} iconLeft={<Plus className="w-4 h-4" />}>
                Add Staff
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table columns={columns} data={staffs} />
              </div>
            </div>
          )}
        </div>
      </div>
    
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
