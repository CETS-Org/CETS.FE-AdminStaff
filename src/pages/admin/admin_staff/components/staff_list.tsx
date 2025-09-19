import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable, { type FilterConfig, type BulkAction } from "@/components/ui/DataTable";
import { type TableColumn } from "@/components/ui/Table";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Eye, Edit, Trash2, Plus, Loader2, User, Users, UserCheck, UserX, Shield, TrendingUp, Download, X } from "lucide-react";
import { getStaffs } from "@/api/staff.api";
import type { Account } from "@/types/account.type";
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

  // Filter configurations for DataTable
  const filterConfigs: FilterConfig[] = [
    {
      key: "statusName",
      label: "Status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
        { label: "Pending", value: "Pending" },
        { label: "Suspended", value: "Suspended" }
      ]
    },
    {
      key: "roleNames",
      label: "Role",
      options: [
        { label: "All Roles", value: "all" },
        { label: "Academic", value: "Academic" },
        { label: "Accountant", value: "Accountant" }
      ]
    }
  ];

  // Bulk actions for DataTable
  const bulkActions: BulkAction<Account>[] = [
    {
      id: "bulk-ban",
      label: "Ban Selected",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "danger",
      onClick: (selectedStaffs) => {
        // Handle bulk ban action
        selectedStaffs.forEach(staff => {
          if (!staff.isDeleted) {
            setIsDelete(staff.accountId);
          }
        });
        fetchStaffs(); // Refresh data
      }
    },
    {
      id: "bulk-unban",
      label: "Unban Selected", 
      icon: <User className="w-4 h-4" />,
      variant: "secondary",
      onClick: (selectedStaffs) => {
        // Handle bulk unban action
        selectedStaffs.forEach(staff => {
          if (staff.isDeleted) {
            setIsActive(staff.accountId);
          }
        });
        fetchStaffs(); // Refresh data
      }
    }
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

      {/* Staff Management with DataTable */}
      <DataTable
        title="Staff Management"
        description="Manage and oversee all staff members"
        data={staffs}
        columns={columns}
        searchFields={['fullName', 'email', 'phoneNumber']}
        filterConfigs={filterConfigs}
        bulkActions={bulkActions}
        onAdd={handleAdd}
        addButtonLabel="Add Staff"
        addButtonIcon={<Plus className="w-4 h-4" />}
        loading={loading}
        error={error}
        onRefresh={fetchStaffs}
        emptyStateTitle="No staff found"
        emptyStateDescription="Get started by adding your first staff member"
        emptyStateAction={{
          label: "Add Staff",
          onClick: handleAdd
        }}
        getItemId={(staff) => staff.accountId}
        enableSelection={true}
        itemsPerPage={8}
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
