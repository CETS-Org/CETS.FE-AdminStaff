import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table, { type TableColumn } from "@/components/ui/Table";
import Pagination from "@/shared/pagination";
import { 
  Search, Filter, X, Plus, Users, Clock, Eye, Edit, Trash2, 
  Grid3X3, List, Star, TrendingUp, AlertCircle, 
  CheckSquare, Square, Download, RefreshCw, Loader2
} from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import DeleteClassDialog from "./DeleteClassDialog";
import CourseSelectionModal from "./CourseSelectionModal";

type Course = {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "active" | "inactive";
  enrolledStudents: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
  instructor?: string;
  category?: string;
  rating?: number;
  featured?: boolean;
};

type Class = {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacher: string;
  schedule: string;
  room: string;
  currentStudents: number;
  maxStudents: number;
  status: "active" | "inactive" | "full";
  startDate: string;
  endDate: string;
};

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

const mockClasses: Class[] = [
  {
    id: "1",
    name: "React Class A",
    courseId: "1",
    courseName: "React Fundamentals",
    teacher: "John Doe",
    schedule: "Mon, Wed, Fri 9:00-11:00",
    room: "Room 101",
    currentStudents: 15,
    maxStudents: 20,
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-03-15",
  },
  {
    id: "2",
    name: "React Class B",
    courseId: "1",
    courseName: "React Fundamentals",
    teacher: "Jane Smith",
    schedule: "Tue, Thu 14:00-16:00",
    room: "Room 102",
    currentStudents: 20,
    maxStudents: 20,
    status: "full",
    startDate: "2024-01-15",
    endDate: "2024-03-15",
  },
  {
    id: "3",
    name: "JavaScript Advanced",
    courseId: "2",
    courseName: "Vue.js Advanced",
    teacher: "Mike Johnson",
    schedule: "Mon, Wed 18:00-20:00",
    room: "Room 103",
    currentStudents: 12,
    maxStudents: 25,
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-04-15",
  },
];

export default function CoursesList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showClassList, setShowClassList] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; course: Course | null }>({ open: false, course: null });
  const [deleteClassDialog, setDeleteClassDialog] = useState<{ open: boolean; classData: Class | null }>({ open: false, classData: null });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [showCourseSelection, setShowCourseSelection] = useState(false);

  const itemsPerPage = 8;

  const filteredCourses = useMemo(() => {
    let filtered = mockCourses.filter((course) => {
      const matchesSearch = searchTerm === "" || 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || course.status === statusFilter;
      const matchesLevel = levelFilter === "all" || course.level === levelFilter;
      const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesLevel && matchesCategory;
    });

    return filtered;
  }, [searchTerm, statusFilter, levelFilter, categoryFilter]);

  const filteredClasses = useMemo(() => {
    return mockClasses;
  }, []);

  const currentData = useMemo(
    () => filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredCourses, currentPage]
  );

  const paginatedClasses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredClasses.slice(startIndex, endIndex);
  }, [filteredClasses, currentPage]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const totalClassPages = Math.ceil(filteredClasses.length / itemsPerPage);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, levelFilter, categoryFilter]);

  // Simulate loading
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, levelFilter, categoryFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLevelFilter("all");
    setCategoryFilter("all");
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };


  const handleBulkDelete = () => {
    console.log("Bulk delete:", selectedCourses);
    setSelectedCourses([]);
  };

  const handleBulkExport = () => {
    console.log("Bulk export:", selectedCourses);
  };

  const activeFiltersCount = [searchTerm, statusFilter, levelFilter, categoryFilter].filter(item => item !== "" && item !== "all").length;

  const columns: TableColumn<Course>[] = [
    { 
      header: "Course",
      className: "w-2/5", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleCourseSelection(row.id)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {selectedCourses.includes(row.id) ? (
              <CheckSquare className="w-4 h-4 text-primary-600" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </button>
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

  const classColumns: TableColumn<Class>[] = [
    { header: "Class Name", accessor: (row) => row.name },
    { 
      header: "Teacher", 
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <img 
            src="https://via.placeholder.com/32x32?text=?" 
            alt={row.teacher} 
            className="w-8 h-8 rounded-full"
          />
          <span>{row.teacher}</span>
        </div>
      )
    },
    { header: "Schedule", accessor: (row) => row.schedule },
    { header: "Room", accessor: (row) => row.room },
    { 
      header: "Students", 
      accessor: (row) => `${row.currentStudents}/${row.maxStudents}`
    },
    { header: "Status", accessor: (row) => row.status },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            onClick={() => handleViewClass(row)}
            className="!p-2 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100 hover:!text-blue-700 hover:!border-blue-300 !transition-colors !rounded-md"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleEditClass(row)}
            className="!p-2 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100 hover:!text-green-700 hover:!border-green-300 !transition-colors !rounded-md"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleDeleteClass(row)}
            className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100 hover:!text-red-700 hover:!border-red-300 !transition-colors !rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
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

  // Class action handlers
  const handleViewClass = (classData: Class) => {
    navigate(`/staff/courses/${classData.courseId}/classes/${classData.id}`);
  };

  const handleEditClass = (classData: Class) => {
    navigate(`/staff/courses/${classData.courseId}/classes/${classData.id}/edit`);
  };

  const handleDeleteClass = (classData: Class) => {
    setDeleteClassDialog({ open: true, classData });
  };

  const handleConfirmDeleteClass = () => {
    if (deleteClassDialog.classData) {
      console.log("Delete class:", deleteClassDialog.classData.id);
      // Add delete logic here
      setDeleteClassDialog({ open: false, classData: null });
    }
  };

  const handleAddClass = () => {
    setShowCourseSelection(true);
  };

  const handleSelectCourse = (courseId: string) => {
    setShowCourseSelection(false);
    navigate(`/staff/courses/${courseId}/classes/add`);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Courses List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Courses Management</h2>
              <p className="text-gray-600 mt-1">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
                {selectedCourses.length > 0 && ` • ${selectedCourses.length} selected`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Bulk Actions */}
              {selectedCourses.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedCourses.length} selected
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
              
              {/* View Mode Toggle */}
              <div className="flex border border-gray-200 rounded-lg bg-white">
                <Button
                  variant={viewMode === "table" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "card" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setViewMode("card")}
                  className="rounded-l-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Add Course Button */}
              <Button onClick={() => navigate("/staff/courses/add")} className="whitespace-nowrap" iconLeft={<Plus className="w-4 h-4" />}>
                Add Course
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
                  placeholder="Search courses, instructors, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {loading && (
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
                
                {activeFiltersCount > 0 && (
                  <Button
                    variant="secondary"
                    onClick={clearFilters}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
                
                <Button
                  variant="secondary"
                  onClick={() => window.location.reload()}
                  className="p-2"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { label: "All Status", value: "all" },
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                  />
                  <Select
                    label="Level"
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    options={[
                      { label: "All Levels", value: "all" },
                      { label: "Beginner", value: "beginner" },
                      { label: "Intermediate", value: "intermediate" },
                      { label: "Advanced", value: "advanced" },
                    ]}
                  />
                  <Select
                    label="Category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    options={[
                      { label: "All Categories", value: "all" },
                      { label: "Web Development", value: "Web Development" },
                      { label: "Programming", value: "Programming" },
                      { label: "Design", value: "Design" },
                      { label: "Data Science", value: "Data Science" },
                      { label: "Mobile Development", value: "Mobile Development" },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content Area with Loading State */}
          {loading ? (
            <div className="space-y-4">
              {viewMode === "table" ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-48"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-full"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Courses</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || activeFiltersCount > 0 
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first course"
                }
              </p>
              <Button onClick={() => navigate("/staff/courses/add")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {viewMode === "table" ? (
                <>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <Table columns={columns} data={currentData} />
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredCourses.length}
                    startIndex={(currentPage - 1) * itemsPerPage + 1}
                    endIndex={Math.min(currentPage * itemsPerPage, filteredCourses.length)}
                  />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentData.map((course) => (
                      <div 
                        key={course.id} 
                        className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                      >
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
                            onClick={() => toggleCourseSelection(course.id)}
                            className="absolute top-3 left-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                          >
                            {selectedCourses.includes(course.id) ? (
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
                    ))}
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredCourses.length}
                    startIndex={(currentPage - 1) * itemsPerPage + 1}
                    endIndex={Math.min(currentPage * itemsPerPage, filteredCourses.length)}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Class List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Class Management</h2>
              <p className="text-gray-600 mt-1">Manage individual class sessions and schedules</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowClassList(!showClassList)}
                className={`transition-colors ${showClassList ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}`}
              >
                {showClassList ? "Hide" : "Show"} Classes
                <span className="bg-indigo-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                  {mockClasses.length}
                </span>
              </Button>
              <Button 
                onClick={handleAddClass}
                iconLeft={<Plus className="w-4 h-4" />}
              >
                Add Class
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {showClassList && (
            <div className="space-y-6">
              {/* Enhanced Class Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-900">{mockClasses.length}</div>
                      <div className="text-sm text-blue-700">Total Classes</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-900">
                        {mockClasses.filter(c => c.status === "active").length}
                      </div>
                      <div className="text-sm text-green-700">Active Classes</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-900">
                        {mockClasses.filter(c => c.status === "full").length}
                      </div>
                      <div className="text-sm text-red-700">Full Classes</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-900">
                        {mockClasses.reduce((sum, c) => sum + c.currentStudents, 0)}
                      </div>
                      <div className="text-sm text-purple-700">Total Students</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Class Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <Table columns={classColumns} data={paginatedClasses} />
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalClassPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredClasses.length}
                startIndex={(currentPage - 1) * itemsPerPage + 1}
                endIndex={Math.min(currentPage * itemsPerPage, filteredClasses.length)}
              />
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, course: deleteDialog.course })}
        onConfirm={handleConfirmDelete}
        title="Delete Course"
        message={deleteDialog.course ? `Are you sure you want to delete the course "${deleteDialog.course.name}"? This action cannot be undone.` : ""}
      />

      <DeleteClassDialog
        open={deleteClassDialog.open}
        onOpenChange={(open) => setDeleteClassDialog({ open, classData: deleteClassDialog.classData })}
        onConfirm={handleConfirmDeleteClass}
        classData={deleteClassDialog.classData}
      />

      <CourseSelectionModal
        isOpen={showCourseSelection}
        onClose={() => setShowCourseSelection(false)}
        onSelectCourse={handleSelectCourse}
        courses={mockCourses}
      />
    </div>
  );
}