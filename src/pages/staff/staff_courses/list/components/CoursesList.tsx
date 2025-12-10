import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { type TableColumn } from "@/components/ui/Table";
import DataTable, { type FilterConfig, type BulkAction } from "@/components/ui/DataTable";
import { 
  Plus, Clock, Eye, Edit, Trash2, 
  Star, 
  CheckSquare, Square, Download,
  DollarSign,
  MessageSquare
} from "lucide-react";
import DeleteConfirmDialog from "../../shared/components/DeleteConfirmDialog";
import type { Course } from "@/types/course.types";
import { getCoursesList, deleteCourse } from "@/api/course.api";

export default function CoursesList() {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; course: Course | null }>({ open: false, course: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const itemsPerPage = 8;

  // Format Vietnamese currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getCoursesList();
        const coursesData: Course[] = response.data.value || response.data || [];
        setCourses(coursesData);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError(err.response?.data?.message || "Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [refreshTrigger]);

  const handleBulkDelete = (selectedCourses: Course[]) => {
    console.log("Bulk delete:", selectedCourses);
  };

  const handleBulkExport = (selectedCourses: Course[]) => {
    console.log("Bulk export:", selectedCourses);
  };


  // Extract unique categories and levels from actual data
  const uniqueCategories = Array.from(new Set(courses.map(c => c.categoryName).filter(Boolean)));
  const uniqueLevels = Array.from(new Set(courses.map(c => c.courseLevel).filter(Boolean)));

  // Filter configurations for DataTable
  const filterConfigs: FilterConfig[] = [
    {
      key: "isActive",
      label: "Status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
    {
      key: "courseLevel",
      label: "Level",
      options: [
        { label: "All Levels", value: "all" },
        ...uniqueLevels.map(level => ({ label: level, value: level })),
      ],
    },
    {
      key: "categoryName",
      label: "Category",
      options: [
        { label: "All Categories", value: "all" },
        ...uniqueCategories.map(category => ({ label: category, value: category })),
      ],
    },
  ];

  // Bulk actions for DataTable
  const bulkActions: BulkAction<Course>[] = [
    {
      id: "export",
      label: "Export",
      icon: <Download className="w-4 h-4" />,
      onClick: handleBulkExport,
      variant: "secondary",
      className: "text-blue-600 border-blue-300 hover:bg-blue-100",
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleBulkDelete,
      variant: "secondary",
      className: "text-red-600 border-red-300 hover:bg-red-100",
    },
  ];

  const columns: TableColumn<Course>[] = [
    { 
      header: "Course",
      className: "w-2/5", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          {row.courseImageUrl ? (
            <img 
              src={row.courseImageUrl} 
              alt={row.courseName}
              className="w-12 h-12 rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="relative w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-primary-700 font-bold text-lg shadow-sm">
              {row.courseName?.charAt(0) || 'C'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-900 truncate">{row.courseName}</div>
            </div>
            <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{row.description || 'No description'}</div>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              {row.teacherDetails && row.teacherDetails.length > 0 && (
                <span>By {row.teacherDetails.map(t => t.fullName).join(', ')}</span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-current text-yellow-400" />
                {row.rating?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Code",
      className: "w-32",
      accessor: (row) => (
        <div className="text-sm text-gray-700">
          {row.courseCode || 'N/A'}
        </div>
      )
    },
    {
      header: "Students",
      className: "w-32",
      accessor: (row) => (
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="text-sm font-medium">
            {row.studentsCount || 0}
          </div>
          <div className="text-xs text-gray-500">
            Enrolled
          </div>
        </div>
      )
    },
    {
      header: "Category",
      className: "w-36",
      accessor: (row) => (
        <div className="space-y-1">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {row.categoryName || 'Uncategorized'}
          </span>
          <div className="text-sm text-gray-600">{row.courseLevel || 'N/A'}</div>
        </div>
      )
    },
    {
      header: "Price",
      className: "w-36",
      accessor: (row) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1 text-gray-900">
            {formatVND(row.standardPrice || 0)} ₫
          </div>
          
        </div>
      )
    },
    {
      header: "Scores",
      className: "w-40",
      accessor: (row) => (
        <div className="space-y-1 text-sm">
          {row.standardScore !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-xs">Entry:</span>
              <span className="font-medium text-gray-900">{row.standardScore}</span>
            </div>
          )}
          {row.exitScore !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-xs">Exit:</span>
              <span className="font-medium text-gray-900">{row.exitScore}</span>
            </div>
          )}
        </div>
      )
    },
    { 
      header: "Status",
      className: "w-32", 
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
            ${row.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
          `}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5
              ${row.isActive ? 'bg-green-500' : 'bg-gray-400'}
            `} />
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
    {
      header: "Actions",
      className: "w-32",
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={() => handleViewFeedback(row)}
            className="!p-2 !bg-purple-50 !text-purple-600 !border !border-purple-200 hover:!bg-purple-100 hover:!text-purple-700 hover:!border-purple-300 !transition-colors !rounded-md"
            title="View Feedback"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
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
          <Button
            size="sm"
            onClick={() => handleDelete(row)}
            className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const handleViewFeedback = (course: Course) => {
    navigate(`/admin/courses/${course.id}/feedback`);
  };

  const handleView = (course: Course) => {
    navigate(`/admin/courses/${course.id}`);
  };

  const handleEdit = (course: Course) => {
    navigate(`/admin/courses/edit/${course.id}`);
  };

  const handleDelete = (course: Course) => {
    setDeleteDialog({ open: true, course });
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.course) {
      try {
        await deleteCourse(deleteDialog.course.id);
        setDeleteDialog({ open: false, course: null });
        // Refresh the courses list
        setRefreshTrigger(prev => prev + 1);
      } catch (err: any) {
        console.error("Error deleting course:", err);
        alert(err.response?.data?.message || "Failed to delete course. Please try again.");
      }
    }
  };

  // Class management removed

  // Card render function for DataTable
  const renderCourseCard = (course: Course, isSelected: boolean, onToggleSelect: () => void) => (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Card Header */}
      <div className="relative aspect-video bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex items-center justify-center">
        {course.courseImageUrl ? (
          <img 
            src={course.courseImageUrl} 
            alt={course.courseName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-primary-700 font-bold text-2xl shadow-lg">
            {course.courseName?.charAt(0) || 'C'}
          </div>
        )}
        
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
        {/* Course Title and Rating */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
              {course.courseName}
            </h3>
            {course.courseCode && (
              <div className="text-xs font-mono text-gray-500 mt-0.5">
                {course.courseCode}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 ml-2">
            <Star className="w-3 h-3 fill-current text-yellow-400" />
            {course.rating?.toFixed(1) || '0.0'}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description || 'No description available'}</p>
        
        {/* Course Meta */}
        <div className="space-y-2 mb-4">
          {course.teacherDetails && course.teacherDetails.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Instructor:</span>
              <span className="font-medium text-gray-900 truncate ml-2">{course.teacherDetails[0].fullName}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Duration:</span>
            <span className="font-medium text-gray-900">{course.duration || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Level:</span>
            <span className="font-medium text-gray-900">{course.courseLevel || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Students:</span>
            <span className="font-medium text-gray-900">{course.studentsCount || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Price:</span>
            <span className="font-semibold text-primary-600">{formatVND(course.standardPrice || 0)} ₫</span>
          </div>
          {course.standardScore !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Entry Score:</span>
              <span className="font-medium text-gray-900">{course.standardScore}</span>
            </div>
          )}
          {course.exitScore !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Exit Score:</span>
              <span className="font-medium text-gray-900">{course.exitScore}</span>
            </div>
          )}
        </div>

        {/* Status and Category */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
            ${course.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
          `}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5
              ${course.isActive ? 'bg-green-500' : 'bg-gray-400'}
            `} />
            {course.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {course.categoryName || 'Uncategorized'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleView(course)}
            className="!flex-1 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => handleEdit(course)}
            className="!flex-1 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            onClick={() => handleDelete(course)}
            className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Courses DataTable */}
      <DataTable<Course>
        title="Courses Management"
        description="Manage and organize your educational courses"
        data={courses}
        columns={columns}
        searchFields={['courseName', 'description', 'categoryName', 'courseCode']}
        filterConfigs={filterConfigs}
        bulkActions={bulkActions}
        onAdd={() => navigate("/admin/courses/add")}
        addButtonLabel="Add Course"
        addButtonIcon={<Plus className="w-4 h-4" />}
        viewModes={["table", "card"]}
        defaultViewMode="table"
        itemsPerPage={itemsPerPage}
        loading={loading}
        error={error}
        onRefresh={() => setRefreshTrigger(prev => prev + 1)}
        emptyStateTitle="No courses found"
        emptyStateDescription="Get started by creating your first course"
        emptyStateAction={{
          label: "Add Course",
          onClick: () => navigate("/admin/courses/add")
        }}
        renderCard={renderCourseCard}
        getItemId={(course) => course.id}
        enableSelection={true}
        className=""
        headerClassName=""
      />

      {/* Class management section removed */}

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, course: deleteDialog.course })}
        onConfirm={handleConfirmDelete}
        title="Delete Course"
        message={deleteDialog.course ? `Are you sure you want to delete the course "${deleteDialog.course.courseName}"? This action cannot be undone.` : ""}
      />

      {/* Removed DeleteClassDialog and CourseSelectionModal */}
    </div>
  );
}