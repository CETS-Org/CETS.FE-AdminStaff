import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Table, { type TableColumn } from "@/components/ui/Table";
import Pagination from "@/shared/pagination";
import { Search, Filter, X, Plus, Users, Clock, Calendar, Eye, Edit, Trash2, Grid3X3, List } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

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
};

type Class = {
  id: string;
  name: string;
  courseId: string;
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
    description: "Learn the basics of React development",
    duration: "8 weeks",
    level: "beginner",
    status: "active",
    enrolledStudents: 25,
    maxStudents: 30,
    startDate: "2024-01-15",
    endDate: "2024-03-15",
  },
  {
    id: "2",
    name: "Advanced JavaScript",
    description: "Master advanced JavaScript concepts",
    duration: "10 weeks",
    level: "advanced",
    status: "active",
    enrolledStudents: 18,
    maxStudents: 25,
    startDate: "2024-02-01",
    endDate: "2024-04-15",
  },
  {
    id: "3",
    name: "UI/UX Design",
    description: "Create beautiful user interfaces",
    duration: "6 weeks",
    level: "intermediate",
    status: "inactive",
    enrolledStudents: 0,
    maxStudents: 20,
    startDate: "2024-03-01",
    endDate: "2024-04-15",
  },
];

const mockClasses: Class[] = [
  {
    id: "1",
    name: "React Class A",
    courseId: "1",
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
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showClassList, setShowClassList] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; course: Course | null }>({ open: false, course: null });

  const itemsPerPage = 8;

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      const matchesSearch = searchTerm === "" || 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || course.status === statusFilter;
      const matchesLevel = levelFilter === "all" || course.level === levelFilter;
      
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [searchTerm, statusFilter, levelFilter]);

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
  }, [searchTerm, statusFilter, levelFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLevelFilter("all");
  };

  const activeFiltersCount = [searchTerm, statusFilter, levelFilter].filter(item => item !== "" && item !== "all").length;

  const columns: TableColumn<Course>[] = [
    { 
      header: "Course", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-neutral-500">{row.description}</div>
          </div>
        </div>
      )
    },
    { header: "Duration", accessor: (row) => row.duration },
    { header: "Level", accessor: (row) => row.level },
    { 
      header: "Status", 
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.status === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
        `}>
          {row.status}
        </span>
      )
    },
    { header: "Students", accessor: (row) => `${row.enrolledStudents}/${row.maxStudents}` },
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
        </div>
      )
    }
  ];

  const classColumns = [
    { header: "Class Name", accessor: (row: Class) => row.name },
    { 
      header: "Teacher", 
      accessor: (row: Class) => (
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
    { header: "Schedule", accessor: (row: Class) => row.schedule },
    { header: "Room", accessor: (row: Class) => row.room },
    { 
      header: "Students", 
      accessor: (row: Class) => `${row.currentStudents}/${row.maxStudents}`
    },
    { header: "Status", accessor: (row: Class) => row.status },
    {
      header: "Actions",
      accessor: (row: Class) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="inline-flex items-center justify-center gap-2">
            <span className="flex-shrink-0">👁️</span>
            <span className="leading-none">View</span>
          </Button>
          <Button variant="secondary" size="sm" className="inline-flex items-center justify-center gap-2">
            <span className="flex-shrink-0">✏️</span>
            <span className="leading-none">Edit</span>
          </Button>
          <Button variant="secondary" size="sm" className="inline-flex items-center justify-center gap-2">
            <span className="flex-shrink-0">🗑️</span>
            <span className="leading-none">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  const handleView = (course: Course) => {
    navigate(`/staff/courses/${course.id}`);
  };

  const handleEdit = (course: Course) => {
    navigate(`/staff/courses/${course.id}/edit`);
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

  const handleViewClass = (classData: Class) => {
    console.log("View class:", classData);
  };

  const handleEditClass = (classData: Class) => {
    console.log("Edit class:", classData);
  };

  const handleDeleteClass = (classData: Class) => {
    console.log("Delete class:", classData);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Card */}
      <Card title="Search & Filters" description="Filter courses by various criteria">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="text-primary-500 whitespace-nowrap"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Show/Hide Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1">
                    {activeFiltersCount}
                  </span>
                )}
              </span>
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="secondary"
                onClick={clearFilters}
                className="text-red-500 whitespace-nowrap"
              >
                <span className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Clear Filters
                </span>
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
              <Select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                options={[
                  { label: "All Levels", value: "all" },
                  { label: "Beginner", value: "beginner" },
                  { label: "Intermediate", value: "intermediate" },
                  { label: "Advanced", value: "advanced" },
                ]}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Courses List Card */}
      <Card 
        title="Courses List" 
        description="View and manage your courses"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-200 rounded-lg">
              <Button
                variant={viewMode === "table" ? undefined : "secondary"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-r-none"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "card" ? undefined : "secondary"}
                size="sm"
                onClick={() => setViewMode("card")}
                className="rounded-l-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
            <Button size="sm">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Course
              </span>
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {viewMode === "table" ? (
            <>
              <Table columns={columns} data={currentData} />
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
                  <Card key={course.id} className="overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-2xl">
                        {course.name.charAt(0)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{course.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium">{course.duration}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Level:</span>
                          <span className="font-medium">{course.level}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Students:</span>
                          <span className="font-medium">{course.enrolledStudents}/{course.maxStudents}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium
                          ${course.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {course.status}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleView(course)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(course)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDelete(course)}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
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
      </Card>

      {/* Class List Section */}
      <Card 
        title="Class List" 
        description="View and manage all classes"
        actions={
          <Button size="sm">
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Class
            </span>
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => setShowClassList(!showClassList)}
              className="text-primary-500"
            >
              <span className="flex items-center gap-2">
                {showClassList ? "Hide" : "Show"} Class List
                <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1">
                  {mockClasses.length}
                </span>
              </span>
            </Button>
          </div>

          {showClassList && (
            <>
              {/* Class Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mockClasses.length}</div>
                  <div className="text-sm text-gray-600">Total Classes</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {mockClasses.filter(c => c.status === "active").length}
                  </div>
                  <div className="text-sm text-gray-600">Active Classes</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {mockClasses.filter(c => c.status === "full").length}
                  </div>
                  <div className="text-sm text-gray-600">Full Classes</div>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {mockClasses.reduce((sum, c) => sum + c.currentStudents, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </Card>
              </div>

              {/* Class Table */}
              <Table columns={classColumns} data={paginatedClasses} />
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalClassPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredClasses.length}
                startIndex={(currentPage - 1) * itemsPerPage + 1}
                endIndex={Math.min(currentPage * itemsPerPage, filteredClasses.length)}
              />
            </>
                     )}
         </div>
       </Card>

       <DeleteConfirmDialog
         open={deleteDialog.open}
         onOpenChange={(open) => setDeleteDialog({ open, course: deleteDialog.course })}
         onConfirm={handleConfirmDelete}
         title="Delete Course"
         message={deleteDialog.course ? `Are you sure you want to delete the course "${deleteDialog.course.name}"? This action cannot be undone.` : ""}
       />
     </div>
   );
 }
