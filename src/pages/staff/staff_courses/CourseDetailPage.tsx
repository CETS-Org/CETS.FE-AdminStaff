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
import DeleteClassDialog from "../staff_classes/components/DeleteClassDialog";
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
          
          <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-4">
              <Button
                variant="primary"
                onClick={() => navigate('/staff/courses')}
                iconLeft={<ArrowLeft className="w-4 h-4" />}
                className="!bg-blue-500 hover:!bg-blue-600"
              >
                Back to Courses
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                <p className="text-gray-600">Course ID: {course.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={handleEdit}
                iconLeft={<Pencil className="w-4 h-4" />}
                className="!bg-blue-500 hover:!bg-blue-600"
              >
                Edit Course
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                iconLeft={<Trash2 className="w-4 h-4" />}
                className="!bg-red-500 hover:!bg-red-600 !text-white"
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">Course Information</h2>
                </div>
                <span className={`px-3 py-1 rounded-md text-sm font-medium ${
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Course Name</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">{course.name}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Instructor</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">{course.teacher}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Duration</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">{course.duration}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Level</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">{course.level}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Students</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">
                      {course.currentStudents || 0}/{course.maxStudents || 0}
                    </p>
                  </div>

                  {course.price && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-500">Price</p>
                      </div>
                      <p className="font-semibold text-gray-900 ml-7">{course.price.toLocaleString()} VND</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-3 text-gray-900">Description</h3>
                <p className="text-gray-600 leading-relaxed">{course.description}</p>
              </div>
            </Card>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {course.currentStudents || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">Enrolled Students</div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {classes.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Active Classes</div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {course.price ? `${(course.price / 1000000).toFixed(1)}M` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600 font-medium">Price (VND)</div>
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
              Classes ({classes.length})
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

        {/* Classes Tab */}
        {activeTab === "class" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Classes</h2>
                <span className="text-sm text-gray-500">{classes.length} classes</span>
              </div>
              <Button
                variant="primary"
                onClick={handleAddClass}
                iconLeft={<Plus className="w-4 h-4" />}
              >
                Add Class
              </Button>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classItem) => (
                <Card key={classItem.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{classItem.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">ID: {classItem.id}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      classItem.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                      classItem.status === 'full' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {classItem.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{classItem.teacher}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{classItem.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{classItem.currentStudents}/{classItem.maxStudents} students</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Enrollment</span>
                      <span>{Math.round((classItem.currentStudents / classItem.maxStudents) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(classItem.currentStudents / classItem.maxStudents) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewClass(classItem)}
                      className="!flex-1 !bg-blue-50 !text-blue-600 !border !border-blue-200 hover:!bg-blue-100"
                      iconLeft={<Eye className="w-4 h-4 mr-1" />}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEditClass(classItem)}
                      className="!flex-1 !bg-green-50 !text-green-600 !border !border-green-200 hover:!bg-green-100"
                      iconLeft={<Pencil className="w-4 h-4 mr-1" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeleteClass(classItem)}
                      className="!p-2 !bg-red-50 !text-red-600 !border !border-red-200 hover:!bg-red-100"
                      iconLeft={<Trash2 className="w-4 h-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {classes.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first class for this course.</p>
                <Button
                  variant="primary"
                  onClick={handleAddClass}
                  iconLeft={<Plus className="w-4 h-4" />}
                >
                  Add First Class
                </Button>
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