import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import { type TableColumn } from "@/components/ui/Table";
import DataTable, { type FilterConfig, type BulkAction } from "@/components/ui/DataTable";
import { 
  Plus, Clock, Eye, Edit, Trash2, 
  Star, 
  CheckSquare, Square, Download
} from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
// Removed class management components
import type { Course } from "@/types/course.types";


const mockCourses: Course[] = [
  {
    id: "1",
    name: "React Fundamentals",
    description: "Learn the basics of React development with modern hooks and patterns",
    duration: "8 weeks",
    level: "beginner",
    status: "active",
    enrolledStudents: 25,
    maxStudents: 30,
    startDate: "2024-01-15",
    endDate: "2024-03-15",
    instructor: "Sarah Johnson",
    category: "Web Development",
    rating: 4.8,
    featured: true,
  },
  {
    id: "2",
    name: "Advanced JavaScript",
    description: "Master advanced JavaScript concepts including async/await, closures, and design patterns",
    duration: "10 weeks",
    level: "advanced",
    status: "active",
    enrolledStudents: 18,
    maxStudents: 25,
    startDate: "2024-02-01",
    endDate: "2024-04-15",
    instructor: "Mike Chen",
    category: "Programming",
    rating: 4.9,
    featured: false,
  },
  {
    id: "3",
    name: "UI/UX Design Principles",
    description: "Create beautiful user interfaces and exceptional user experiences",
    duration: "6 weeks",
    level: "intermediate",
    status: "inactive",
    enrolledStudents: 0,
    maxStudents: 20,
    startDate: "2024-03-01",
    endDate: "2024-04-15",
    instructor: "Emily Rodriguez",
    category: "Design",
    rating: 4.7,
    featured: false,
  },
  {
    id: "4",
    name: "Python for Data Science",
    description: "Learn Python programming with focus on data analysis and machine learning",
    duration: "12 weeks",
    level: "intermediate",
    status: "active",
    enrolledStudents: 22,
    maxStudents: 25,
    startDate: "2024-01-20",
    endDate: "2024-04-20",
    instructor: "Dr. Alex Kumar",
    category: "Data Science",
    rating: 4.6,
    featured: true,
  },
  {
    id: "5",
    name: "Mobile App Development",
    description: "Build cross-platform mobile applications using React Native",
    duration: "14 weeks",
    level: "advanced",
    status: "active",
    enrolledStudents: 15,
    maxStudents: 20,
    startDate: "2024-02-15",
    endDate: "2024-05-15",
    instructor: "James Wilson",
    category: "Mobile Development",
    rating: 4.5,
    featured: false,
  },
];

// Class management removed for staff courses list

export default function CoursesList() {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; course: Course | null }>({ open: false, course: null });
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const itemsPerPage = 8;

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleBulkDelete = (selectedCourses: Course[]) => {
    console.log("Bulk delete:", selectedCourses);
  };

  const handleBulkExport = (selectedCourses: Course[]) => {
    console.log("Bulk export:", selectedCourses);
  };


  // Filter configurations for DataTable
  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      key: "level",
      label: "Level",
      options: [
        { label: "All Levels", value: "all" },
        { label: "Beginner", value: "beginner" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Advanced", value: "advanced" },
      ],
    },
    {
      key: "category",
      label: "Category",
      options: [
        { label: "All Categories", value: "all" },
        { label: "Web Development", value: "Web Development" },
        { label: "Programming", value: "Programming" },
        { label: "Design", value: "Design" },
        { label: "Data Science", value: "Data Science" },
        { label: "Mobile Development", value: "Mobile Development" },
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
          <div className="relative w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center text-primary-700 font-bold text-lg shadow-sm">
            {row.name.charAt(0)}
            {row.featured && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-2.5 h-2.5 text-white fill-current" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-900 truncate">{row.name}</div>
              {row.featured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{row.description}</div>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>By {row.instructor}</span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-current text-yellow-400" />
                {row.rating}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Students",
      className: "w-32",
      accessor: (row) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{row.enrolledStudents}/{row.maxStudents}</span>
            <span className="text-gray-500">
              {Math.round((row.enrolledStudents / row.maxStudents) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(row.enrolledStudents / row.maxStudents) * 100}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: "Category & Level",
      className: "w-38",
      accessor: (row) => (
        <div className="space-y-1">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {row.category}
          </span>
          <div className="text-sm text-gray-600 capitalize">{row.level}</div>
        </div>
      )
    },
    {
      header: "Duration & Date",
      className: "w-40",
      accessor: (row) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1 text-gray-900">
            <Clock className="w-3 h-3 text-gray-400" />
            {row.duration}
          </div>
          <div className="text-gray-600">
            {new Date(row.startDate).toLocaleDateString()}
          </div>
        </div>
      )
    },
    { 
      header: "Status",
      className: "w-32", 
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
            ${row.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}
            ${row.status === 'inactive' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
          `}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5
              ${row.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}
            `} />
            {row.status}
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

  const handleView = (course: Course) => {
    navigate(`/staff/courses/${course.id}`);
  };

  const handleEdit = (course: Course) => {
    navigate(`/staff/courses/edit/${course.id}`);
  };

  const handleDelete = (course: Course) => {
    setDeleteDialog({ open: true, course });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.course) {
      console.log("Delete course:", deleteDialog.course);
      setDeleteDialog({ open: false, course: null });
    }
  };

  // Class management removed

  // Card render function for DataTable
  const renderCourseCard = (course: Course, isSelected: boolean, onToggleSelect: () => void) => (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Card Header */}
      <div className="relative aspect-video bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex items-center justify-center">
        <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-primary-700 font-bold text-2xl shadow-lg">
          {course.name.charAt(0)}
        </div>
        
        {/* Featured Badge */}
        {course.featured && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Featured
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
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {course.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-600 ml-2">
            <Star className="w-3 h-3 fill-current text-yellow-400" />
            {course.rating}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
        
        {/* Course Meta */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Instructor:</span>
            <span className="font-medium text-gray-900">{course.instructor}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Duration:</span>
            <span className="font-medium text-gray-900">{course.duration}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Students:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{course.enrolledStudents}/{course.maxStudents}</span>
              <div className="w-12 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(course.enrolledStudents / course.maxStudents) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status and Category */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
            ${course.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
          `}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5
              ${course.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}
            `} />
            {course.status}
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
            {course.category}
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
        data={mockCourses}
        columns={columns}
        searchFields={['name', 'description', 'instructor']}
        filterConfigs={filterConfigs}
        bulkActions={bulkActions}
        onAdd={() => navigate("/staff/courses/add")}
        addButtonLabel="Add Course"
        addButtonIcon={<Plus className="w-4 h-4" />}
        viewModes={["table", "card"]}
        defaultViewMode="table"
        itemsPerPage={itemsPerPage}
        loading={loading}
        error={error}
        onRefresh={() => window.location.reload()}
        emptyStateTitle="No courses found"
        emptyStateDescription="Get started by creating your first course"
        emptyStateAction={{
          label: "Add Course",
          onClick: () => navigate("/staff/courses/add")
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
        message={deleteDialog.course ? `Are you sure you want to delete the course "${deleteDialog.course.name}"? This action cannot be undone.` : ""}
      />

      {/* Removed DeleteClassDialog and CourseSelectionModal */}
    </div>
  );
}