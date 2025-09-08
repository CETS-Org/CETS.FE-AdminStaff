import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Loader from "@/components/ui/Loader";
import Table from "@/components/ui/Table";
import type { TableColumn } from "@/components/ui/Table";
import { UserPlus, Search, Calendar, Upload, Check, Users, Filter, X } from "lucide-react";
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
        <Button
          onClick={() => handleCourseSelect(course)}
          className={` text-blue-600 hover:text-blue-700 border border-blue-300 hover:bg-blue-50 ${
            selectedCourse?.id === course.id ? 'bg-blue-50' : ''
          }`}
        >
          <span className="flex items-center gap-1">
          <UserPlus className="w-4 h-4" />
          Assign
          </span>
          
        </Button>
      )
    }
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6 mx-auto mt-16 lg:pl-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assign Teacher to Course</h1>
        <p className="text-gray-600">Select courses and assign available teachers</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6" title="Search & Filters" description="Filter courses by various criteria">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by course name or code..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2  text-primary-500"
            >
              <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4  "/>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </span>
            
            </Button>
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="whitespace-nowrap text-red-500"
            >
               <span className="flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Clear Filters
               </span>
              
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={[
                    { label: "All Status", value: "all" },
                    { label: "Open", value: "open" },
                    { label: "Full", value: "full" },
                    { label: "Closed", value: "closed" }
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex justify-between items-center pt-2 border-t">
            <p className="text-sm text-gray-600">
              Showing {paginatedCourses.length} of {filteredCourses.length} courses
              {filteredCourses.length !== courses.length && ` (filtered from ${courses.length} total)`}
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Courses Table - Left Side */}
         <div className="lg:col-span-2">
           <Card title="Available Courses">
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
           </Card>
         </div>

        {/* Teacher Selection Card - Right Side */}
        <div className="lg:col-span-1">
          {selectedCourse ? (
            <Card title={`Assign Teachers to ${selectedCourse.name}`}>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-sm">{selectedCourse.name}</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.code} ({selectedCourse.credits} credits)</p>
                  <p className="text-sm text-gray-600">{selectedCourse.department}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Available Teachers ({getAvailableTeachers(selectedCourse).length})</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSelectAll}
                      size="sm"
                      className="text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      onClick={handleDeselectAll}
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {getAvailableTeachers(selectedCourse).map((teacher) => (
                    <div
                      key={teacher.id}
                      className={`p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedTeachers.includes(teacher.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTeacherToggle(teacher.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTeachers.includes(teacher.id)}
                          onChange={() => handleTeacherToggle(teacher.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{teacher.name}</div>
                          <div className="text-xs text-gray-500">{teacher.email}</div>
                          <div className="text-xs text-gray-500">
                            {teacher.specialization} • {teacher.currentWorkload}/{teacher.maxWorkload} credits
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {getAvailableTeachers(selectedCourse).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p>No available teachers for this course</p>
                  </div>
                )}

                                 <div className="flex gap-2 pt-4 border-t">
                   <Button
                     onClick={handleImportExcel}
                     variant="secondary"
                     className="flex-1"
                   >
                     <Upload className="w-4 h-4 mr-2" />
                     Import
                   </Button>
                   <Button
                     onClick={handleAssignSelected}
                     disabled={selectedTeachers.length === 0}
                     className="flex-1"
                   >
                     <Check className="w-4 h-4 mr-2" />
                     Assign ({selectedTeachers.length})
                   </Button>
                 </div>
              </div>
            </Card>
          ) : (
            <Card title="Teacher Selection">
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="w-12 h-12 mx-auto mb-4" />
                <p>Select a course to assign teachers</p>
              </div>
            </Card>
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
