import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Loader from "@/components/ui/Loader";
import Table from "@/components/ui/Table";
import type { TableColumn } from "@/components/ui/Table";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { UserPlus, Search, Calendar, Upload, Check, Users, Filter, X, BarChart3, Download, Loader2, TrendingUp, BookOpen, Clock } from "lucide-react";
import AssignTeacherDialog from "./components/AssignTeacherDialog";
import ConfirmAssignDialog from "./components/ConfirmAssignDialog";
import Pagination from "@/shared/pagination";

interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization: string;
  status: "active" | "inactive";
  currentWorkload: number;
  maxWorkload: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  department: string;
  semester: string;
  year: string;
  assignedTeachers: string[];
  status: "open" | "full" | "closed";
  createdDate: string;
  startDate: string;
  endDate: string;
}

interface Assignment {
  id: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseName: string;
  assignedDate: string;
  startDate: string;
  endDate: string;
  status: "active" | "pending" | "completed";
  notes?: string;
}

export default function AssignTeacherPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Mock data - trong thực tế sẽ fetch từ API
  useEffect(() => {
    const mockTeachers: Teacher[] = [
      { id: "1", name: "Dr. John Smith", email: "john.smith@university.edu", specialization: "Mathematics", status: "active", currentWorkload: 8, maxWorkload: 12 },
      { id: "2", name: "Prof. Sarah Johnson", email: "sarah.johnson@university.edu", specialization: "Physics", status: "active", currentWorkload: 6, maxWorkload: 12 },
      { id: "3", name: "Dr. Michael Brown", email: "michael.brown@university.edu", specialization: "Computer Science", status: "active", currentWorkload: 10, maxWorkload: 12 },
      { id: "4", name: "Prof. Emily Davis", email: "emily.davis@university.edu", specialization: "Chemistry", status: "active", currentWorkload: 4, maxWorkload: 12 },
      { id: "5", name: "Dr. Robert Wilson", email: "robert.wilson@university.edu", specialization: "Biology", status: "active", currentWorkload: 7, maxWorkload: 12 },
    ];

    const mockCourses: Course[] = [
      { id: "1", name: "Calculus I", code: "MATH101", credits: 4, department: "Mathematics", semester: "Fall", year: "2024", assignedTeachers: ["1"], status: "open", createdDate: "2024-01-15", startDate: "2024-09-01", endDate: "2024-12-15" },
      { id: "2", name: "Physics Fundamentals", code: "PHYS101", credits: 3, department: "Physics", semester: "Fall", year: "2024", assignedTeachers: ["2"], status: "open", createdDate: "2024-01-10", startDate: "2024-09-01", endDate: "2024-12-15" },
      { id: "3", name: "Introduction to Programming", code: "CS101", credits: 3, department: "Computer Science", semester: "Spring", year: "2025", assignedTeachers: ["3"], status: "open", createdDate: "2024-01-20", startDate: "2025-01-15", endDate: "2025-05-01" },
      { id: "4", name: "Organic Chemistry", code: "CHEM201", credits: 4, department: "Chemistry", semester: "Spring", year: "2025", assignedTeachers: [], status: "open", createdDate: "2024-01-25", startDate: "2025-01-15", endDate: "2025-05-01" },
      { id: "5", name: "Advanced Biology", code: "BIO301", credits: 3, department: "Biology", semester: "Spring", year: "2025", assignedTeachers: [], status: "open", createdDate: "2024-01-30", startDate: "2025-01-15", endDate: "2025-05-01" },
      { id: "6", name: "Linear Algebra", code: "MATH201", credits: 3, department: "Mathematics", semester: "Fall", year: "2024", assignedTeachers: [], status: "open", createdDate: "2024-02-01", startDate: "2024-09-01", endDate: "2024-12-15" },
      { id: "7", name: "Quantum Physics", code: "PHYS301", credits: 4, department: "Physics", semester: "Spring", year: "2025", assignedTeachers: [], status: "open", createdDate: "2024-02-05", startDate: "2025-01-15", endDate: "2025-05-01" },
      { id: "8", name: "Data Structures", code: "CS201", credits: 3, department: "Computer Science", semester: "Fall", year: "2024", assignedTeachers: [], status: "open", createdDate: "2024-02-10", startDate: "2024-09-01", endDate: "2024-12-15" },
      { id: "9", name: "Inorganic Chemistry", code: "CHEM101", credits: 3, department: "Chemistry", semester: "Fall", year: "2024", assignedTeachers: [], status: "open", createdDate: "2024-02-15", startDate: "2024-09-01", endDate: "2024-12-15" },
      { id: "10", name: "Cell Biology", code: "BIO201", credits: 4, department: "Biology", semester: "Spring", year: "2025", assignedTeachers: [], status: "open", createdDate: "2024-02-20", startDate: "2025-01-15", endDate: "2025-05-01" },
      { id: "11", name: "Statistics", code: "MATH301", credits: 3, department: "Mathematics", semester: "Spring", year: "2025", assignedTeachers: [], status: "open", createdDate: "2024-02-25", startDate: "2025-01-15", endDate: "2025-05-01" },
      { id: "12", name: "Thermodynamics", code: "PHYS201", credits: 4, department: "Physics", semester: "Fall", year: "2024", assignedTeachers: [], status: "open", createdDate: "2024-03-01", startDate: "2024-09-01", endDate: "2024-12-15" },
      { id: "13", name: "Database Systems", code: "CS301", credits: 3, department: "Computer Science", semester: "Spring", year: "2025", assignedTeachers: [], status: "open", createdDate: "2024-03-05", startDate: "2025-01-15", endDate: "2025-05-01" },
      { id: "14", name: "Physical Chemistry", code: "CHEM301", credits: 4, department: "Chemistry", semester: "Fall", year: "2024", assignedTeachers: [], status: "open", createdDate: "2024-03-10", startDate: "2024-09-01", endDate: "2024-12-15" },
      { id: "15", name: "Genetics", code: "BIO401", credits: 3, department: "Biology", semester: "Spring", year: "2025", assignedTeachers: [], status: "open", createdDate: "2024-03-15", startDate: "2025-01-15", endDate: "2025-05-01" },
    ];

    const mockAssignments: Assignment[] = [
      { id: "1", teacherId: "1", teacherName: "Dr. John Smith", courseId: "1", courseName: "Calculus I", assignedDate: "2024-01-15", startDate: "2024-09-01", endDate: "2024-12-15", status: "active" },
      { id: "2", teacherId: "2", teacherName: "Prof. Sarah Johnson", courseId: "2", courseName: "Physics Fundamentals", assignedDate: "2024-01-10", startDate: "2024-09-01", endDate: "2024-12-15", status: "active" },
      { id: "3", teacherId: "3", teacherName: "Dr. Michael Brown", courseId: "3", courseName: "Introduction to Programming", assignedDate: "2024-01-20", startDate: "2025-01-15", endDate: "2025-05-01", status: "pending" },
    ];

    setTeachers(mockTeachers);
    setCourses(mockCourses);
    setAssignments(mockAssignments);
    setLoading(false);
    
    // Simulate stats loading
    setTimeout(() => {
      setStatsLoading(false);
    }, 800);
  }, []);

  const handleAssignTeacher = (teacherId: string, courseId: string, additionalInfo: any) => {
    const teacher = teachers.find(t => t.id === teacherId);
    const course = courses.find(c => c.id === courseId);

    if (teacher && course) {
      const newAssignment: Assignment = {
        id: Date.now().toString(),
        teacherId: teacherId,
        teacherName: teacher.name,
        courseId: courseId,
        courseName: course.name,
        assignedDate: new Date().toISOString().split('T')[0],
        startDate: additionalInfo.startDate,
        endDate: additionalInfo.endDate,
        status: "active",
        notes: additionalInfo.notes
      };

      setAssignments([...assignments, newAssignment]);
      
      // Update teacher workload
      setTeachers(teachers.map(t => 
        t.id === teacherId 
          ? { ...t, currentWorkload: t.currentWorkload + course.credits }
          : t
      ));

      // Update course assigned teachers
      setCourses(courses.map(c => 
        c.id === courseId 
          ? { ...c, assignedTeachers: [...c.assignedTeachers, teacherId] }
          : c
      ));
    }
  };


  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || course.status === filterStatus;
    
    // Date filtering
    const courseDate = new Date(course.createdDate);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    let matchesDate = true;
    if (fromDate && toDate) {
      matchesDate = courseDate >= fromDate && courseDate <= toDate;
    } else if (fromDate) {
      matchesDate = courseDate >= fromDate;
    } else if (toDate) {
      matchesDate = courseDate <= toDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, dateFrom, dateTo]);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedTeachers([]);
  };

  const handleTeacherToggle = (teacherId: string) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourse) {
      const availableTeachers = teachers.filter(t => 
        t.status === "active" && 
        !selectedCourse.assignedTeachers.includes(t.id) &&
        t.currentWorkload + selectedCourse.credits <= t.maxWorkload
      );
      setSelectedTeachers(availableTeachers.map(t => t.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedTeachers([]);
  };

  const handleAssignSelected = () => {
    if (selectedCourse && selectedTeachers.length > 0) {
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmAssign = (additionalInfo: any) => {
    if (selectedCourse && selectedTeachers.length > 0) {
      selectedTeachers.forEach(teacherId => {
        handleAssignTeacher(teacherId, selectedCourse.id, additionalInfo);
      });
      setSelectedCourse(null);
      setSelectedTeachers([]);
    }
  };

  const handleImportExcel = () => {
    if (selectedCourse) {
      // Mock import - in real app would handle file upload
      alert("Import functionality would open file picker to select Excel file");
    }
  };

  const getAvailableTeachers = (course: Course) => {
    return teachers.filter(t => 
      t.status === "active" && 
      !course.assignedTeachers.includes(t.id) &&
      t.currentWorkload + course.credits <= t.maxWorkload
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  // Calculate statistics
  const statistics = {
    totalCourses: courses.length,
    openCourses: courses.filter(c => c.status === "open").length,
    totalAssignments: assignments.length,
    availableTeachers: teachers.filter(t => t.status === "active").length,
    avgWorkload: teachers.length > 0 ? Math.round((teachers.reduce((sum, t) => sum + t.currentWorkload, 0) / teachers.length) * 10) / 10 : 0,
    pendingAssignments: assignments.filter(a => a.status === "pending").length
  };

  const handleExportData = () => {
  };

  const handleViewAnalytics = () => {
  };

  // Table columns configuration
  const tableColumns: TableColumn<Course>[] = [
    {
      header: "Course",
      accessor: (course) => (
        <div>
          <div className="font-medium">{course.name}</div>
          <div className="text-sm text-gray-500">{course.code} ({course.credits} credits)</div>
        </div>
      )
    },
    {
      header: "Department",
      accessor: (course) => course.department
    },
    {
      header: "Semester",
      accessor: (course) => `${course.semester} ${course.year}`
    },
    {
      header: "Assigned Teachers",
      accessor: (course) => (
        <div className="flex flex-wrap gap-1">
          {course.assignedTeachers.map(teacherId => {
            const teacher = teachers.find(t => t.id === teacherId);
            return (
              <span key={teacherId} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {teacher?.name}
              </span>
            );
          })}
          {course.assignedTeachers.length === 0 && (
            <span className="text-gray-400 text-sm">No teachers assigned</span>
          )}
        </div>
      )
    },
    {
      header: "Status",
      accessor: (course) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          course.status === "open" ? "bg-green-100 text-green-800" :
          course.status === "full" ? "bg-yellow-100 text-yellow-800" :
          "bg-red-100 text-red-800"
        }`}>
          {course.status}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (course) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleCourseSelect(course)}
            className={`relative overflow-hidden transition-all duration-300 ${
              selectedCourse?.id === course.id 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105' 
                : 'bg-primary-500 text-blue-600 border border-blue-300 hover:bg-accent-400 hover:border-blue-400 hover:shadow-md'
            }`}
            size="sm"
          >
            <span className="flex items-center gap-2 relative z-10">
              <UserPlus className={`w-4 h-4 transition-all ${selectedCourse?.id === course.id ? 'text-white' : ''}`} />
              {selectedCourse?.id === course.id ? 'Selected' : 'Assign'}
            </span>
            {selectedCourse?.id === course.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 animate-pulse opacity-20"></div>
            )}
          </Button>
         
        </div>
      )
    }
  ];

  if (loading) {
    return <Loader />;
  }

  const breadcrumbItems = [
    { label: "Teacher Assignments" }
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title="Assign Teacher to Course"
        description="Select courses and assign available teachers with comprehensive management tools"
        icon={<UserPlus className="w-5 h-5 text-white" />}
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

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              {statsLoading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <BookOpen className="w-7 h-7 text-white" />}
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700">Total Courses</p>
              <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                {statsLoading ? "..." : statistics.totalCourses}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {statsLoading ? "Loading..." : `${statistics.openCourses} open for assignment`}
              </p>
            </div>
          </div>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              {statsLoading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Users className="w-7 h-7 text-white" />}
            </div>
            <div>
              <p className="text-sm font-medium text-green-700">Available Teachers</p>
              <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                {statsLoading ? "..." : statistics.availableTeachers}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {statsLoading ? "Loading..." : "Active and ready"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              {statsLoading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Clock className="w-7 h-7 text-white" />}
            </div>
            <div>
              <p className="text-sm font-medium text-amber-700">Avg Workload</p>
              <p className="text-3xl font-bold text-amber-900 group-hover:text-amber-600 transition-colors">
                {statsLoading ? "..." : `${statistics.avgWorkload} hrs`}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                {statsLoading ? "Loading..." : "Per teacher"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              {statsLoading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <TrendingUp className="w-7 h-7 text-white" />}
            </div>
            <div>
              <p className="text-sm font-medium text-purple-700">Total Assignments</p>
              <p className="text-3xl font-bold text-purple-900 group-hover:text-purple-600 transition-colors">
                {statsLoading ? "..." : statistics.totalAssignments}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {statsLoading ? "Loading..." : `${statistics.pendingAssignments} pending`}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Search & Filters</h3>
              <p className="text-sm text-gray-600">Filter courses by various criteria to find the perfect match</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-4 items-end">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search by course name, code, or department..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 h-12 text-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 h-12 px-6 border transition-all duration-200 ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <Filter className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button
                variant="secondary"
                onClick={clearFilters}
                className="h-12 px-6 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                disabled={!searchTerm && filterStatus === "all" && !dateFrom && !dateTo}
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            {/* Enhanced Filter Options */}
            {showFilters && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <label className="flex text-sm font-semibold text-gray-700 items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Course Status
                    </label>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      options={[
                        { label: "All Status", value: "all" },
                        { label: "Open", value: "open" },
                        { label: "Full", value: "full" },
                        { label: "Closed", value: "closed" }
                      ]}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex text-sm font-semibold text-gray-700 items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      From Date
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-green-500 transition-colors" />
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex text-sm font-semibold text-gray-700 items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      To Date
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-amber-500 transition-colors" />
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Results Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  <p className="text-sm font-medium text-gray-700">
                    Showing <span className="font-bold text-blue-600">{paginatedCourses.length}</span> of{" "}
                    <span className="font-bold text-blue-600">{filteredCourses.length}</span> courses
                  </p>
                </div>
                {filteredCourses.length !== courses.length && (
                  <div className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                    Filtered from {courses.length} total
                  </div>
                )}
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Page</span>
                  <div className="px-2 py-1 bg-gray-100 rounded font-medium">{currentPage}</div>
                  <span>of</span>
                  <div className="px-2 py-1 bg-gray-100 rounded font-medium">{totalPages}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Courses Table - Left Side */}
         <div className="lg:col-span-2">
           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
             <div className="p-6 border-b border-gray-200">
               <h3 className="text-lg font-semibold text-gray-900">Available Courses</h3>
             </div>
             <div className="p-6">
             <div className="space-y-4">
               <Table
                 columns={tableColumns}
                 data={paginatedCourses}
                 emptyState={
                   <div className="text-center py-12">
                     <div className="flex flex-col items-center">
                       <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                         <Search className="w-8 h-8 text-gray-400" />
                       </div>
                       <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                       <p className="text-gray-500 mb-4">
                         {filteredCourses.length === 0 && courses.length > 0
                           ? "Try adjusting your search criteria or filters"
                           : "No courses are available for assignment"
                         }
                       </p>
                       {(searchTerm || filterStatus !== "all" || dateFrom || dateTo) && (
                         <Button
                           variant="secondary"
                           onClick={clearFilters}
                           className="mt-2"
                         >
                           Clear all filters
                         </Button>
                       )}
                     </div>
                   </div>
                 }
               />
               
               {/* Pagination */}
               <Pagination
                     currentPage={currentPage}
                     totalPages={totalPages}
                     onPageChange={handlePageChange}
                     itemsPerPage={itemsPerPage}
                     totalItems={filteredCourses.length}
                     startIndex={startIndex}
                     endIndex={Math.min(endIndex, filteredCourses.length)}
                   />
             </div>
           </div>
         </div>
         </div>

        {/* Teacher Selection Card - Right Side */}
        <div className="lg:col-span-1">
          {selectedCourse ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Assign Teachers to {selectedCourse.name}</h3>
              </div>
              <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{selectedCourse.name}</h4>
                      <p className="text-sm text-blue-600 font-medium">{selectedCourse.code} • {selectedCourse.credits} credits</p>
                      <p className="text-xs text-gray-600">{selectedCourse.department} Department</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Available Teachers</h4>
                        <p className="text-xs text-gray-500">
                          {getAvailableTeachers(selectedCourse).length} teacher{getAvailableTeachers(selectedCourse).length !== 1 ? 's' : ''} ready for assignment
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full font-semibold">
                      {getAvailableTeachers(selectedCourse).length}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSelectAll}
                      size="sm"
                      className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white border-0 transition-all duration-200"
                      iconLeft={<Check className="w-3 h-3 mr-1.5" />}
                    >
                      Select All
                    </Button>
                    <Button
                      onClick={handleDeselectAll}
                      variant="secondary"
                      size="sm"
                      className="flex-1 py-2 border-gray-300 hover:bg-gray-100 transition-all duration-200"
                      iconLeft={<X className="w-3 h-3 mr-1.5" />}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                  {getAvailableTeachers(selectedCourse).map((teacher) => (
                    <div
                      key={teacher.id}
                      className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedTeachers.includes(teacher.id)
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20 scale-[1.02]'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-md hover:scale-[1.01]'
                      }`}
                      onClick={() => handleTeacherToggle(teacher.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedTeachers.includes(teacher.id)}
                            onChange={() => handleTeacherToggle(teacher.id)}
                            className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                          />
                          {selectedTeachers.includes(teacher.id) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-sm text-gray-900 truncate">{teacher.name}</div>
                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              teacher.currentWorkload < teacher.maxWorkload * 0.7 
                                ? 'bg-green-100 text-green-700' 
                                : teacher.currentWorkload < teacher.maxWorkload * 0.9
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {Math.round((teacher.currentWorkload / teacher.maxWorkload) * 100)}% loaded
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mb-2 truncate">{teacher.email}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md font-medium">
                              {teacher.specialization}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600">
                              <span className="font-medium">{teacher.currentWorkload}</span>/{teacher.maxWorkload} credits
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {getAvailableTeachers(selectedCourse).length === 0 && (
                  <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No Available Teachers</h4>
                    <p className="text-gray-500 text-sm">
                      All qualified teachers are at maximum capacity or already assigned to this course.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-6 border-t border-gray-200">
                   <Button
                     onClick={handleImportExcel}
                     variant="secondary"
                     className="flex-1 h-12 bg-accent-400  transition-all duration-200"
                     iconLeft={<Upload className="w-4 h-4 mr-2" />}
                   >
                     Import Excel
                   </Button>
                   <Button
                     onClick={handleAssignSelected}
                     disabled={selectedTeachers.length === 0}
                     className={`flex-1 h-12 transition-all duration-300 ${
                       selectedTeachers.length > 0
                         ? 'bg-gradient-to-r'
                         : 'opacity-50 cursor-not-allowed'
                     }`}
                     iconLeft={<Check className="w-4 h-4 mr-2" />}
                   >
                     Assign ({selectedTeachers.length})
                   </Button>
                 </div>
              </div>
            </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Teacher Selection</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-16 bg-gradient-to-b from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-200">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UserPlus className="w-10 h-10 text-purple-500" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-3">Ready to Assign Teachers</h4>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                    Choose a course from the table on the left to start assigning qualified teachers to it.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
                    <span>Waiting for course selection</span>
                    <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse animation-delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Assignment Dialog */}
      <ConfirmAssignDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        selectedCourse={selectedCourse}
        selectedTeachers={selectedTeachers.map(id => teachers.find(t => t.id === id)!).filter(Boolean)}
        onConfirm={handleConfirmAssign}
      />

      {/* Assign Teacher Dialog */}
      <AssignTeacherDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        teachers={teachers}
        courses={courses}
        onAssign={handleAssignTeacher}
      />
    </div>
  );
}
