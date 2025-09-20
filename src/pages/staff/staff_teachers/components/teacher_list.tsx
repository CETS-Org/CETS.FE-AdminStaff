import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import DataTable, { type BulkAction, type FilterConfig } from "@/components/ui/DataTable";
import { type TableColumn } from "@/components/ui/Table";
import { 
  Eye, Edit, UserX, Plus, User, Download, 
  GraduationCap, Award
} from "lucide-react";
import { getTeachers } from "@/api/teacher.api";
import type { Teacher } from "@/types/teacher.type";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
import { setIsDelete, setIsActive } from "@/api/account.api";


export default function TeacherList() {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teacher: Teacher | null; action?: 'ban' | 'unban' }>({ open: false, teacher: null });
  
  // Data states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Define columns for DataTable
  const columns: TableColumn<Teacher>[] = [
    { 
      header: "Teacher", 
      className: "w-2", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
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
    { 
      header: "Experience", 
      accessor: (row) => (
        <div className="text-sm">
          {row.teacherInfo?.yearsExperience ? (
            <div className="flex items-center gap-1">
              <Award className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>{row.teacherInfo.yearsExperience} years</span>
            </div>
          ) : (
            "N/A"
          )}
        </div>
      )
    },
    { 
      header: "Credentials", 
      accessor: (row) => (
        <div className="text-sm flex items-center gap-1">
          <GraduationCap className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
          <span>
            {row.teacherInfo?.teacherCredentials?.length || 0} credential{(row.teacherInfo?.teacherCredentials?.length || 0) !== 1 ? 's' : ''}
          </span>
        </div>
      )
    },
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
          <Button
            size="sm"
            onClick={() => handleEdit(row)}
            className="!p-2 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Edit className="w-4 h-4" />
          </Button>
          {row.statusName === 'Blocked' || row.statusName === 'Locked' ? (
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

  // Define search fields for DataTable
  const searchFields: (keyof Teacher)[] = ['fullName', 'email'];

  // Define filter configurations for DataTable
  const filterConfigs: FilterConfig[] = useMemo(() => {
    const uniqueStatuses = [...new Set(teachers.map(t => t.statusName).filter(Boolean))];
    return [
      {
        key: 'statusName',
        label: 'Status',
        options: [
          { label: 'All Status', value: 'all' },
          ...uniqueStatuses.map(status => ({ label: status || 'Unknown', value: status || 'unknown' }))
        ]
      }
    ];
  }, [teachers]);

  // Define bulk actions for DataTable
  const bulkActions: BulkAction<Teacher>[] = [
    {
      id: 'export',
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      onClick: (selectedTeachers) => {
        console.log('Bulk export:', selectedTeachers);
      },
      variant: 'secondary',
      className: 'text-blue-600 border-blue-300 hover:bg-blue-100'
    },
    {
      id: 'delete',
      label: 'Ban Users',
      icon: <UserX className="w-4 h-4" />,
      onClick: (selectedTeachers) => {
        console.log('Bulk delete:', selectedTeachers);
      },
      variant: 'secondary',
      className: 'text-red-600 border-red-300 hover:bg-red-100'
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


  return (
    <div className="space-y-6">
      <DataTable
        title="Teachers Management"
        description="Manage and organize your teaching staff"
        data={teachers}
        columns={columns}
        searchFields={searchFields}
        filterConfigs={filterConfigs}
        bulkActions={bulkActions}
        onAdd={handleAdd}
        addButtonLabel="Add Teacher"
        addButtonIcon={<Plus className="w-4 h-4" />}
        loading={loading}
        error={error}
        onRefresh={fetchTeachers}
        emptyStateTitle="No teachers found"
        emptyStateDescription="Get started by adding your first teacher"
        emptyStateAction={{
          label: "Add Teacher",
          onClick: handleAdd
        }}
        getItemId={(teacher) => teacher.accountId}
        enableSelection={true}
        itemsPerPage={8}
      />

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