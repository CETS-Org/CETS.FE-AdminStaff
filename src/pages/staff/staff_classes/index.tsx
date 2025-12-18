import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { type TableColumn } from "@/components/ui/Table";
import DataTable, { type FilterConfig, type BulkAction } from "@/components/ui/DataTable";
import { Eye, Pencil, Users, TrendingUp, AlertCircle, BookOpen, Download, BarChart3, Loader2, Plus, Trash2, CheckSquare, Square } from "lucide-react";
import { getStaffClasses, calculateClassStatistics, deleteClass, type ClassData } from "@/api/class.api";
import DeleteClassDialog from "./components/DeleteClassDialog";

// Type alias for compatibility with existing code
type ClassRow = ClassData;

export default function StaffClassesPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    fullClasses: 0,
    totalStudents: 0
  });

  // Fetch classes data from API
  useEffect(() => {
    fetchClassesData();
  }, []);

  const fetchClassesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API to get staff classes
      const classesData = await getStaffClasses();
      
      // Sort classes by className (name field) in ascending order
      const sortedClasses = classesData.sort((b, a) => 
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );
      
      // Update rows with sorted API data
      setRows(sortedClasses);
      
      // Calculate and update statistics
      const calculatedStats = calculateClassStatistics(sortedClasses);
      setStats(calculatedStats);
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      const errorMessage = err.response?.data?.message || "Failed to load classes. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
  };

  const handleViewAnalytics = () => {
    navigate("/staff/analytics");
  };

  const handleRetry = () => {
    fetchClassesData();
  };

  const handleDelete = (classRow: ClassRow) => {
    setSelectedClass(classRow);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClass) return;
    
    try {
      // Call API to delete class
      await deleteClass(selectedClass.id);
      
      // Update local state
      setRows(prev => prev.filter(c => c.id !== selectedClass.id));
      
      // Recalculate statistics
      const updatedClasses = rows.filter(c => c.id !== selectedClass.id);
      const calculatedStats = calculateClassStatistics(updatedClasses);
      setStats(calculatedStats);
    } catch (err: any) {
      console.error("Error deleting class:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete class. Please try again.";
      alert(errorMessage);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedClass(null);
    }
  };

  const breadcrumbItems = [
    { label: "Classes" }
  ];

  const itemsPerPage = 8;

  // Filter configurations for DataTable
  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Full", value: "full" },
      ],
    },
  ];

  // Bulk actions for DataTable
  const bulkActions: BulkAction<ClassRow>[] = [
    {
      id: "export",
      label: "Export",
      icon: <Download className="w-4 h-4" />,
      onClick: (selectedClasses) => {
      },
      variant: "secondary",
      className: "text-blue-600 border-blue-300 hover:bg-blue-100",
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (selectedClasses) => {
      },
      variant: "secondary",
      className: "text-red-600 border-red-300 hover:bg-red-100",
    },
  ];

  const columns: TableColumn<ClassRow>[] = [
    { 
      header: "Class",
      className: "w-1/4",
      accessor: (r) => (
        <div>
          <div className="font-semibold text-gray-900">{r.name}</div>
          <div className="text-sm text-gray-600">{r.courseName}</div>
        </div>
      )
    },
    { 
      header: "Teacher",
      className: "w-1/5",
      accessor: (r) => (
        <div className="text-sm text-gray-900">{r.teacher}</div>
      )
    },
    { 
      header: "Room",
      className: "w-1/6",
      accessor: (r) => (
        <div className="text-sm text-gray-900">{r.room}</div>
      )
    },
    { 
      header: "Students",
      className: "w-1/6",
      accessor: (r) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{r.currentStudents}/{r.maxStudents}</span>
            <span className="text-gray-500">
              {Math.round((r.currentStudents / r.maxStudents) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(r.currentStudents / r.maxStudents) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: "Status",
      className: "w-1/6",
      accessor: (r) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
          ${r.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}
          ${r.status === 'full' ? 'bg-red-50 text-red-700 border-red-200' : ''}
          ${r.status === 'inactive' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
        `}>
          <div className={`w-1.5 h-1.5 rounded-full mr-1.5
            ${r.status === 'active' ? 'bg-green-500' : ''}
            ${r.status === 'full' ? 'bg-red-500' : ''}
            ${r.status === 'inactive' ? 'bg-gray-400' : ''}
          `} />
          {r.status}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "w-40",
      accessor: (r) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={() => navigate(`/staff/classes/${r.id}`)}
            className="!p-2 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/staff/classes/${r.id}/edit`)}
            className="!p-2 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => handleDelete(r)}
            className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Card render function for DataTable
  const renderClassCard = (classRow: ClassRow, isSelected: boolean, onToggleSelect: () => void) => (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Card Header */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center">
        <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-blue-700 font-bold text-2xl shadow-lg">
          {classRow.name.charAt(0)}
        </div>
        
        {/* Selection Checkbox */}
        <button
          onClick={onToggleSelect}
          className="absolute top-3 left-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-primary-600" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      <div className="p-5">
        {/* Class Title */}
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1 mb-2">
          {classRow.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3">{classRow.courseName}</p>
        
        {/* Class Meta */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Teacher:</span>
            <span className="font-medium text-gray-900">{classRow.teacher}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Room:</span>
            <span className="font-medium text-gray-900">{classRow.room}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Students:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{classRow.currentStudents}/{classRow.maxStudents}</span>
              <div className="w-12 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(classRow.currentStudents / classRow.maxStudents) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
            ${classRow.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}
            ${classRow.status === 'full' ? 'bg-red-50 text-red-700 border-red-200' : ''}
            ${classRow.status === 'inactive' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
          `}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5
              ${classRow.status === 'active' ? 'bg-green-500' : ''}
              ${classRow.status === 'full' ? 'bg-red-500' : ''}
              ${classRow.status === 'inactive' ? 'bg-gray-400' : ''}
            `} />
            {classRow.status}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => navigate(`/staff/classes/${classRow.id}`)}
            className="!flex-1 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/staff/classes/${classRow.id}/edit`)}
            className="!flex-1 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            onClick={() => handleDelete(classRow)}
            className="!flex-1 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title="Class Management"
        description="Manage individual class sessions and schedules"
        icon={<Users className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'View Analytics',
            variant: 'secondary',
            icon: <BarChart3 className="w-4 h-4" />,
            onClick: handleViewAnalytics
          },
          {
            type: 'button',
            label: 'Export Data',
            variant: 'secondary',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExportData
          }
        ]}
      />

      {/* Stats Cards */}
      {error ? (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">Error Loading Statistics</h3>
              <p className="text-red-700">{error}</p>
            </div>
            <Button variant="secondary" onClick={handleRetry} className="text-red-600 border-red-300 hover:bg-red-100">
              Try Again
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <BookOpen className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Classes</p>
                <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                  {loading ? "..." : stats.totalClasses}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {loading ? "Loading..." : "All sessions"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <TrendingUp className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Active Classes</p>
                <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                  {loading ? "..." : stats.activeClasses}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {loading ? "Loading..." : "Currently running"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <AlertCircle className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Full Classes</p>
                <p className="text-3xl font-bold text-red-900 group-hover:text-red-600 transition-colors">
                  {loading ? "..." : stats.fullClasses}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {loading ? "Loading..." : "At capacity"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Users className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Total Students</p>
                <p className="text-3xl font-bold text-purple-900 group-hover:text-purple-600 transition-colors">
                  {loading ? "..." : stats.totalStudents}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {loading ? "Loading..." : "Across all classes"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Classes DataTable */}
      <DataTable<ClassRow>
        title="Classes Management"
        description="Manage individual class sessions and schedules"
        data={rows}
        columns={columns}
        searchFields={['name', 'courseName', 'teacher', 'room']}
        filterConfigs={filterConfigs}
        bulkActions={bulkActions}
        onAdd={() => navigate("/staff/classes/add")}
        addButtonLabel="Add Class"
        addButtonIcon={<Plus className="w-4 h-4" />}
        viewModes={["table"]}
        defaultViewMode="table"
        itemsPerPage={itemsPerPage}
        loading={loading}
        error={error}
        onRefresh={handleRetry}
        emptyStateTitle="No classes found"
        emptyStateDescription="Get started by creating your first class"
        emptyStateAction={{
          label: "Add Class",
          onClick: () => navigate("/staff/classes/add")
        }}
        renderCard={renderClassCard}
        getItemId={(classRow) => classRow.id}
        enableSelection={true}
        className=""
        headerClassName=""
      />
      <DeleteClassDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        classData={selectedClass as any}
      />
    </div>
  );
}



