import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarCheck2, Pencil, TableIcon, Trash2, Plus, Eye, Search, Filter, X, BookOpen, User, Users, Award, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { TableColumn } from "@/components/ui/Table";
import Table from "@/components/ui/Table";
// Student interface for course detail page
interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountId: string;
  age: number;
  level: string;
  status: string;
  joinDate: string;
  currentClass?: string;
  enrolledCourses: string[];
}
import { Calendar,dateFnsLocalizer } from "react-big-calendar";
import DeleteClassDialog from "./components/DeleteClassDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/shared/pagination";

type Course = {
  id: string;
  name: string;
  level: string;
  duration: string;
  teacher: string;
  status: "active" | "inactive";
  description: string;
  image: string;
  price?: number;
  maxStudents?: number;
  currentStudents?: number;
};

  
  type ClassSession = {
    id: string;
    date: string;
    time: string;
    room: string;
  };

  type Class = {
    id: string;
    name: string;
    courseId: string;
    courseName: string;
    teacher: string;
    teacherAvatar?: string;
    schedule: string;
    room: string;
    currentStudents: number;
    maxStudents: number;
    status: "active" | "inactive" | "full";
    startDate: string;
    endDate: string;
  };
const coursesData: Record<string, Course> = {
  "ENGO01": {
    id: "ENGO01",
    name: "Basic English Communication",
    level: "Beginner",
    duration: "12 weeks",
    teacher: "Sarah Johnson",
    status: "active",
    description: "This course is designed for beginners to build foundational English communication skills, including speaking, listening, and basic grammar.",
    image: "https://conhocgioi.com/wp-content/uploads/2018/10/Kh%C3%B3a-h%E1%BB%8Dc-ti%E1%BA%BFng-anh-chu%E1%BA%A9n-Cambridge-e1543687916326.png",
    price: 12000000,
    maxStudents: 20,
    currentStudents: 15,
  },
  "ENGO02": {
    id: "ENGO02",
    name: "Intermediate Conversation",
    level: "Intermediate",
    duration: "16 weeks",
    teacher: "Michael Chen",
    status: "active",
    description: "An intermediate-level course focusing on improving conversational English with real-life scenarios and vocabulary expansion.",
    image: "https://via.placeholder.com/600x300?text=Intermediate+Conversation",
    price: 10000000,
    maxStudents: 18,
    currentStudents: 18,
  },
  // Thêm các khóa học khác nếu cần
};


const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const course = coursesData[id || "ENGO01"] || coursesData["ENGO01"];
  const [students] = useState<Student[]>([
    { id: "1", accountId: "ACC001", name: "Nguyen Van A", email: "nguyenvana@email.com", phone: "0123456789", age: 18, level: "B1", enrolledCourses: ["IELTS Foundation"], status: "active", joinDate: "2024-09-01", currentClass: "Basic English Class A" },
    { id: "2", accountId: "ACC002", name: "Tran Thi B", email: "tranthib@email.com", phone: "0987654321", age: 22, level: "C1", enrolledCourses: ["TOEIC Advanced", "Business English"], status: "active", joinDate: "2024-08-15", currentClass: "Basic English Class B" },
    { id: "3", accountId: "ACC003", name: "Le Van C", email: "levanc@email.com", phone: "0555666777", age: 16, level: "Beginner", enrolledCourses: ["Kids English"], status: "active", joinDate: "2024-10-01", currentClass: "Basic English Class A" },
    { id: "4", accountId: "ACC004", name: "Pham Thi D", email: "phamthid@email.com", phone: "0111222333", age: 25, level: "B2", enrolledCourses: ["IELTS Foundation"], status: "graduated", joinDate: "2024-06-01", currentClass: "Basic English Class B" },
    { id: "5", accountId: "ACC005", name: "Hoang Van E", email: "hoangvane@email.com", phone: "0444555666", age: 20, level: "A2", enrolledCourses: ["Conversation Club"], status: "inactive", joinDate: "2024-07-01", currentClass: "Basic English Class A" },
  ]);

  const [classSessions] = useState<ClassSession[]>([
    { id: "C001", date: "2025-09-05", time: "10:00 - 12:00", room: "Room 101" },
    { id: "C002", date: "2025-09-07", time: "14:00 - 16:00", room: "Room 102" },
    { id: "C003", date: "2025-09-10", time: "09:00 - 11:00", room: "Room 101" },
  ]);

  // Class data for the course
  const [classes, setClasses] = useState<Class[]>([
    { 
      id: "CL001", 
      name: "Basic English Class A", 
      courseId: id || "ENGO01", 
      courseName: course.name, 
      teacher: "Sarah Johnson", 
      teacherAvatar: "https://via.placeholder.com/40x40?text=SJ", 
      schedule: "Mon, Wed, Fri 9:00-11:00", 
      room: "Room 101", 
      currentStudents: 15, 
      maxStudents: 20, 
      status: "active", 
      startDate: "2024-01-15", 
      endDate: "2024-07-15" 
    },
    { 
      id: "CL002", 
      name: "Basic English Class B", 
      courseId: id || "ENGO01", 
      courseName: course.name, 
      teacher: "Michael Chen", 
      teacherAvatar: "https://via.placeholder.com/40x40?text=MC", 
      schedule: "Tue, Thu, Sat 14:00-16:00", 
      room: "Room 102", 
      currentStudents: 18, 
      maxStudents: 20, 
      status: "active", 
      startDate: "2024-02-01", 
      endDate: "2024-08-01" 
    },
  ]);

  // Dialog states
  const [addEditDialog, setAddEditDialog] = useState<{ open: boolean; classData: Class | null }>({ open: false, classData: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; classData: Class | null }>({ open: false, classData: null });
  const [deleteCourseDialog, setDeleteCourseDialog] = useState(false);

  const [subTab, setSubTab] = useState<"schedule" | "table">("schedule");
  const [activeTab, setActiveTab] = useState<"students" | "class">("students");
  
  // Student list filter states
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("");
  const [studentLevelFilter, setStudentLevelFilter] = useState("");
  const [studentDateFilter, setStudentDateFilter] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState("");
  const [showStudentFilters, setShowStudentFilters] = useState(false);
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const studentsPerPage = 5;

  // Class list filter states
  const [classSearch, setClassSearch] = useState("");
  const [classStatusFilter, setClassStatusFilter] = useState("");
  const [classTeacherFilter, setClassTeacherFilter] = useState("");
  const [showClassFilters, setShowClassFilters] = useState(false);

  const handleEdit = () => {
    navigate(`/staff/courses/edit/${id}`);
  };

  const handleDelete = () => {
    setDeleteCourseDialog(true);
  };

  const handleConfirmDeleteCourse = () => {
    navigate('/staff/courses');
  };


  // Class handlers
  const handleAddClass = () => {
    navigate(`/staff/courses/${id}/classes/add`);
  };

  const handleEditClass = (classData: Class) => {
    navigate(`/staff/courses/${id}/classes/${classData.id}/edit`);
  };

  const handleViewClass = (classData: Class) => {
    navigate(`/staff/courses/${id}/classes/${classData.id}`);
  };

  const handleDeleteClass = (classData: Class) => {
    setDeleteDialog({ open: true, classData });
  };

  const handleSaveClass = (classData: Partial<Class>) => {
    if (addEditDialog.classData) {
      // Edit existing class
      setClasses(prev => prev.map(c => 
        c.id === addEditDialog.classData!.id 
          ? { ...c, ...classData }
          : c
      ));
    } else {
      // Add new class
      const newClass: Class = {
        id: `CL${Date.now()}`,
        courseId: id || "ENGO01",
        courseName: course.name,
        ...classData
      } as Class;
      setClasses(prev => [...prev, newClass]);
    }
  };

  const handleConfirmDeleteClass = () => {
    if (deleteDialog.classData) {
      setClasses(prev => prev.filter(c => c.id !== deleteDialog.classData!.id));
    }
  };

  // Student filtering and pagination logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                           student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
                           student.phone.includes(studentSearch);
      
      const matchesStatus = !studentStatusFilter || student.status === studentStatusFilter;
      const matchesLevel = !studentLevelFilter || student.level === studentLevelFilter;
      const matchesDate = !studentDateFilter || student.joinDate === studentDateFilter;
      const matchesClass = !studentClassFilter || student.currentClass === studentClassFilter;
      
      return matchesSearch && matchesStatus && matchesLevel && matchesDate && matchesClass;
    });
  }, [students, studentSearch, studentStatusFilter, studentLevelFilter, studentDateFilter, studentClassFilter]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentStudentPage - 1) * studentsPerPage;
    return filteredStudents.slice(startIndex, startIndex + studentsPerPage);
  }, [filteredStudents, currentStudentPage]);

  const clearStudentFilters = () => {
    setStudentSearch("");
    setStudentStatusFilter("");
    setStudentLevelFilter("");
    setStudentDateFilter("");
    setStudentClassFilter("");
    setCurrentStudentPage(1);
  };

  // Reset current page when filters change
  useEffect(() => {
    setCurrentStudentPage(1);
  }, [studentSearch, studentStatusFilter, studentLevelFilter, studentDateFilter, studentClassFilter]);

  // Class filtering logic
  const filteredClasses = useMemo(() => {
    return classes.filter(classItem => {
      const matchesSearch = classItem.name.toLowerCase().includes(classSearch.toLowerCase()) ||
                           classItem.teacher.toLowerCase().includes(classSearch.toLowerCase()) ||
                           classItem.room.toLowerCase().includes(classSearch.toLowerCase());
      
      const matchesStatus = !classStatusFilter || classItem.status === classStatusFilter;
      const matchesTeacher = !classTeacherFilter || classItem.teacher === classTeacherFilter;
      
      return matchesSearch && matchesStatus && matchesTeacher;
    });
  }, [classes, classSearch, classStatusFilter, classTeacherFilter]);

  const clearClassFilters = () => {
    setClassSearch("");
    setClassStatusFilter("");
    setClassTeacherFilter("");
  };

  const breadcrumbItems = [

    { label: 'Courses', to: '/staff/courses' },
    { label: 'Course Detail', to: '/courses/detail' }, // 'to' có thể là đường dẫn đầy đủ
  ];
// Cột cho bảng List Students
const studentColumns:  TableColumn<Student>[] = [
    { 
      header: "Student", 
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
            {row.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-neutral-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { header: "Phone", accessor: (row) => row.phone },
    { header: "Age", accessor: (row) => row.age },
    { header: "Level", accessor: (row) => row.level },
    { header: "Class", accessor: (row) => row.currentClass || "Not assigned" },
    { 
      header: "Courses", 
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.enrolledCourses.map((course: string, idx: number) => (
            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
              {course}
            </span>
          ))}
        </div>
      )
    },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.status === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${row.status === 'graduated' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
        `}>
          {row.status}
        </span>
      )
    },
    { header: "Join Date", accessor: (row) => new Date(row.joinDate).toLocaleDateString() },
    
  ];

  // Cột cho bảng List Class (View by Table)
  const classColumns: TableColumn<Class>[] = [
    { header: "Class Name", accessor: (row) => row.name },
    { 
      header: "Teacher", 
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <img src={row.teacherAvatar || "https://via.placeholder.com/40x40?text=?"} alt={row.teacher} className="w-8 h-8 rounded-full" />
          <span>{row.teacher}</span>
        </div>
      )
    },
    { header: "Schedule", accessor: (row) => row.schedule },
    { header: "Room", accessor: (row) => row.room },
    { header: "Students", accessor: (row) => `${row.currentStudents}/${row.maxStudents}` },
    {
      header: "Status",
      accessor: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-md text-[75%] border
          ${row.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : ''}
          ${row.status === 'inactive' ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
          ${row.status === 'full' ? 'bg-red-100 text-red-700 border-red-200' : ''}
        `}>
          {row.status}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex gap-2">
          <button
            className="flex items-center justify-center w-6 h-6 rounded-full border text-gray-600 hover:border-gray-400 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors"
            onClick={() => handleViewClass(row)}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="flex items-center justify-center w-6 h-6 rounded-full border border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            onClick={() => handleEditClass(row)}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="flex items-center justify-center w-6 h-6 rounded-full border border-red-300 text-red-600 hover:border-red-400 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
            onClick={() => handleDeleteClass(row)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  //lịch class 
   //const localizer = momentLocalizer(new Date());
  
   const locales = {
    "en-US": enUS,
  };
  
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const events = classSessions.map((session) => {
    const [startTime, endTime] = session.time.split("-").map(t => t.trim());
  
    return {
      id: session.id,
      title: `${session.room}`,   // hoặc `${session.id} - ${session.room}`
      start: new Date(`${session.date}T${startTime}`),
      end: new Date(`${session.date}T${endTime}`),
    };
  });
  

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems}/>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/staff/courses')}
                iconLeft={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Courses
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                <p className="text-gray-600">Course ID: {course.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={handleEdit}
                iconLeft={<Pencil className="w-4 h-4" />}
              >
                Edit Course
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                iconLeft={<Trash2 className="w-4 h-4" />}
              >
                Delete Course
              </Button>
            </div>
          </div>
        </div>


      

        {/* Course Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Course Information</h2>
                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium border ${
                  course.status === 'active' 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                </span>
              </div>

              {/* Course Image */}
              <div className="mb-6">
                <img
                  src={course.image}
                  alt={course.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Course Name</p>
                      <p className="font-medium">{course.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Instructor</p>
                      <p className="font-medium">{course.teacher}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{course.duration}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Level</p>
                      <p className="font-medium">{course.level}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Students</p>
                      <p className="font-medium">
                        {course.currentStudents || 0}/{course.maxStudents || 0}
                      </p>
                    </div>
                  </div>

                  {course.price && (
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-medium">{course.price.toLocaleString()} VND</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-600">{course.description}</p>
              </div>
            </Card>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {course.currentStudents || 0}
                </div>
                <div className="text-sm text-gray-500">Enrolled Students</div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {classes.length}
                </div>
                <div className="text-sm text-gray-500">Active Classes</div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {course.price ? `${(course.price / 1000000).toFixed(1)}M` : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Price (VND)</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
           
            <button
              className={`py-3 px-4 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors ${
                activeTab === "students"
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : ""
              }`}
              onClick={() => setActiveTab("students")}
            >
              Students ({filteredStudents.length})
            </button>
            <button
              className={`py-3 px-4 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors ${
                activeTab === "class"
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : ""
              }`}
              onClick={() => setActiveTab("class")}
            >
              Classes ({filteredClasses.length})
            </button>
          </div>
        </div>
        {/* Tab Content */}
        <div>
        {activeTab === "students" && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Students</h2>
              <span className="ml-auto text-sm text-gray-500">{filteredStudents.length} students</span>
            </div>
            {/* Search and Filter Section */}
            <div className="space-y-4 mb-6">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search students by name, email, or phone..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => setShowStudentFilters(!showStudentFilters)}
                  variant="secondary"
                  className="flex items-center gap-2 text-primary-500"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {showStudentFilters ? 'Hide Filters' : 'Show Filters'}
                    {(studentSearch || studentStatusFilter || studentLevelFilter || studentDateFilter || studentClassFilter) && (
                      <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {[studentSearch, studentStatusFilter, studentLevelFilter, studentDateFilter, studentClassFilter].filter(f => f !== "").length}
                      </span>
                    )}
                  </span>
                </Button>
                <Button
                  onClick={clearStudentFilters}
                  variant="secondary"
                  className="whitespace-nowrap text-red-500"
                >
                  <span className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Clear Filters
                  </span>
                </Button>
              </div>

              {/* Filter Options */}
              {showStudentFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                  <Select
                    label="Status"
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    options={[
                      { label: "All Status", value: "" },
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                      { label: "Graduated", value: "graduated" }
                    ]}
                  />
                  <Select
                    label="Level"
                    value={studentLevelFilter}
                    onChange={(e) => setStudentLevelFilter(e.target.value)}
                    options={[
                      { label: "All Levels", value: "" },
                      { label: "Beginner", value: "Beginner" },
                      { label: "A1", value: "A1" },
                      { label: "A2", value: "A2" },
                      { label: "B1", value: "B1" },
                      { label: "B2", value: "B2" },
                      { label: "C1", value: "C1" },
                      { label: "C2", value: "C2" }
                    ]}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Join Date
                    </label>
                    <Input
                      type="date"
                      value={studentDateFilter}
                      onChange={(e) => setStudentDateFilter(e.target.value)}
                    />
                  </div>
                  <Select
                    label="Class"
                    value={studentClassFilter}
                    onChange={(e) => setStudentClassFilter(e.target.value)}
                    options={[
                      { label: "All Classes", value: "" },
                      { label: "Basic English Class A", value: "Basic English Class A" },
                      { label: "Basic English Class B", value: "Basic English Class B" },
                      { label: "Not assigned", value: "Not assigned" }
                    ]}
                  />
                </div>
              )}
            </div>

            {/* Table */}
            <Table 
              columns={studentColumns} 
              data={paginatedStudents}
              emptyState={
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {(studentSearch || studentStatusFilter || studentLevelFilter || studentDateFilter || studentClassFilter) ? "No students match your filters" : "No students found"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {(studentSearch || studentStatusFilter || studentLevelFilter || studentDateFilter || studentClassFilter) 
                      ? "Try adjusting your search criteria or clear the filters."
                      : "No students are enrolled in this course yet."
                    }
                  </p>
                  {(studentSearch || studentStatusFilter || studentLevelFilter || studentDateFilter || studentClassFilter) && (
                    <Button onClick={clearStudentFilters} variant="secondary">
                      Clear Filters
                    </Button>
                  )}
                </div>
              }
            />
          </Card>
        )}

        {/* Pagination */}
        {activeTab === "students" && filteredStudents.length > studentsPerPage && (
          <div className="mt-6">
            <Pagination
              currentPage={currentStudentPage}
              totalPages={Math.ceil(filteredStudents.length / studentsPerPage)}
              onPageChange={setCurrentStudentPage}
              totalItems={filteredStudents.length}
              itemsPerPage={studentsPerPage}
            />
          </div>
        )}

        {activeTab === "class" && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Classes</h2>
              <span className="ml-auto text-sm text-gray-500">{filteredClasses.length} classes</span>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">View:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button 
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        subTab === "schedule" 
                          ? "bg-white text-blue-600 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      }`} 
                      onClick={() => setSubTab("schedule")}
                    >      
                      <CalendarCheck2 className="w-4 h-4" />
                      Schedule
                    </button>
                    <button 
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        subTab === "table" 
                          ? "bg-white text-blue-600 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      }`} 
                      onClick={() => setSubTab("table")}
                    >
                      <TableIcon className="w-4 h-4" />
                      Table
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleAddClass}
                  iconLeft={<Plus className="w-4 h-4" />}
                >
                  Add Class
                </Button>
              </div>
            </div>
            {subTab === "schedule" ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 500 }}
                  date={currentDate}
                  onNavigate={(newDate: Date) => setCurrentDate(newDate)}
                  views={["month", "week", "day"]}
                  defaultView="week"
                  className="rounded-lg"
                />
              </div>
            ) : (
              <div>
                {/* Search and Filter Section */}
                <div className="space-y-4 mb-6">
                  {/* Search Bar */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search classes by name, teacher, or room..."
                        value={classSearch}
                        onChange={(e) => setClassSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      onClick={() => setShowClassFilters(!showClassFilters)}
                      variant="secondary"
                      className="flex items-center gap-2 text-primary-500"
                    >
                      <span className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        {showClassFilters ? 'Hide Filters' : 'Show Filters'}
                        {(classSearch || classStatusFilter || classTeacherFilter) && (
                          <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {[classSearch, classStatusFilter, classTeacherFilter].filter(f => f !== "").length}
                          </span>
                        )}
                      </span>
                    </Button>
                    <Button
                      onClick={clearClassFilters}
                      variant="secondary"
                      className="whitespace-nowrap text-red-500"
                    >
                      <span className="flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Clear Filters
                      </span>
                    </Button>
                  </div>

                  {/* Filter Options */}
                  {showClassFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <Select
                        label="Status"
                        value={classStatusFilter}
                        onChange={(e) => setClassStatusFilter(e.target.value)}
                        options={[
                          { label: "All Status", value: "" },
                          { label: "Active", value: "active" },
                          { label: "Inactive", value: "inactive" },
                          { label: "Full", value: "full" }
                        ]}
                      />
                      <Select
                        label="Teacher"
                        value={classTeacherFilter}
                        onChange={(e) => setClassTeacherFilter(e.target.value)}
                        options={[
                          { label: "All Teachers", value: "" },
                          ...classes.map(classItem => ({
                            label: classItem.teacher,
                            value: classItem.teacher
                          })).filter((teacher, index, self) => 
                            index === self.findIndex(t => t.value === teacher.value)
                          )
                        ]}
                      />
                    </div>
                  )}
                </div>

                {/* Table */}
                <Table 
                  columns={classColumns} 
                  data={filteredClasses}
                  emptyState={
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {(classSearch || classStatusFilter || classTeacherFilter) ? "No classes match your filters" : "No classes found"}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {(classSearch || classStatusFilter || classTeacherFilter) 
                          ? "Try adjusting your search criteria or clear the filters."
                          : "No classes are created for this course yet."
                        }
                      </p>
                      {(classSearch || classStatusFilter || classTeacherFilter) && (
                        <Button onClick={clearClassFilters} variant="secondary">
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  }
                />
              </div>
            )}
          </Card>
        )}
        </div>

        {/* Dialogs */}
        

        <DeleteClassDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, classData: deleteDialog.classData })}
          onConfirm={handleConfirmDeleteClass}
          classData={deleteDialog.classData}
        />

        <DeleteConfirmDialog
          open={deleteCourseDialog}
          onOpenChange={setDeleteCourseDialog}
          onConfirm={handleConfirmDeleteCourse}
          title="Delete Course"
          message={`Are you sure you want to delete the course "${course.name}"? This action cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default CourseDetail;