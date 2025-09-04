import React, { useState, useMemo, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft,  CalendarCheck2,  Pencil, TableIcon, Trash2, Plus, Eye, Search, Filter, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageHeader from "@/components/ui/PageHeader";
import type { TableColumn } from "@/components/ui/Table";
import Table from "@/components/ui/Table";
import type { Student } from "../staff_students/components/students_list";
import { Calendar,dateFnsLocalizer } from "react-big-calendar";
import AddEditClassDialog from "./components/AddEditClassDialog";
import ClassDetailDialog from "./components/ClassDetailDialog";
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
    { id: 1, name: "Nguyen Van A", email: "nguyenvana@email.com", phone: "0123456789", age: 18, level: "B1", enrolledCourses: ["IELTS Foundation"], status: "active", joinDate: "2024-09-01" },
    { id: 2, name: "Tran Thi B", email: "tranthib@email.com", phone: "0987654321", age: 22, level: "C1", enrolledCourses: ["TOEIC Advanced", "Business English"], status: "active", joinDate: "2024-08-15" },
    { id: 3, name: "Le Van C", email: "levanc@email.com", phone: "0555666777", age: 16, level: "Beginner", enrolledCourses: ["Kids English"], status: "active", joinDate: "2024-10-01" },
    { id: 4, name: "Pham Thi D", email: "phamthid@email.com", phone: "0111222333", age: 25, level: "B2", enrolledCourses: ["IELTS Foundation"], status: "graduated", joinDate: "2024-06-01" },
    { id: 5, name: "Hoang Van E", email: "hoangvane@email.com", phone: "0444555666", age: 20, level: "A2", enrolledCourses: ["Conversation Club"], status: "inactive", joinDate: "2024-07-01" },
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
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; classData: Class | null }>({ open: false, classData: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; classData: Class | null }>({ open: false, classData: null });
  const [deleteCourseDialog, setDeleteCourseDialog] = useState(false);

  const [subTab, setSubTab] = useState<"schedule" | "table">("schedule");
  const [activeTab, setActiveTab] = useState<"description" | "students" | "class">("description");
  
  // Student list filter states
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("");
  const [studentLevelFilter, setStudentLevelFilter] = useState("");
  const [studentDateFilter, setStudentDateFilter] = useState("");
  const [showStudentFilters, setShowStudentFilters] = useState(false);
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const studentsPerPage = 5;

  const handleEdit = () => {
    navigate(`/courses/edit/${id}`);
  };

  const handleDelete = () => {
    setDeleteCourseDialog(true);
  };

  const handleConfirmDeleteCourse = () => {
    navigate('/courses');
  };

  const handleEnroll = () => {
    // Logic đăng ký
    console.log("Enroll in course:", course.name);
  };

  // Class handlers
  const handleAddClass = () => {
    setAddEditDialog({ open: true, classData: null });
  };

  const handleEditClass = (classData: Class) => {
    setAddEditDialog({ open: true, classData });
   
  };

  const handleViewClass = (classData: Class) => {
    setDetailDialog({ open: true, classData });
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
      
      return matchesSearch && matchesStatus && matchesLevel && matchesDate;
    });
  }, [students, studentSearch, studentStatusFilter, studentLevelFilter, studentDateFilter]);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentStudentPage - 1) * studentsPerPage;
    return filteredStudents.slice(startIndex, startIndex + studentsPerPage);
  }, [filteredStudents, currentStudentPage]);

  const clearStudentFilters = () => {
    setStudentSearch("");
    setStudentStatusFilter("");
    setStudentLevelFilter("");
    setStudentDateFilter("");
    setCurrentStudentPage(1);
  };

  // Reset current page when filters change
  useEffect(() => {
    setCurrentStudentPage(1);
  }, [studentSearch, studentStatusFilter, studentLevelFilter, studentDateFilter]);

  const breadcrumbItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Courses', to: '/courses' },
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
    { 
      header: "Courses", 
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.enrolledCourses.map((course, idx) => (
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
    <div className=" mt-18 bg-gray-50 min-h-screen lg:pl-70 ">
      {/* Header */}
      <div className="mb-6 mt-4 ">
       
       <Breadcrumbs items={breadcrumbItems}/>

      <div className="flex justify-between items-center "> 
      <PageHeader
        title="Course Detail"
        subtitle={course.name}
      />

        <div className= "flex gap-1 h-10 pr-6">
        <button className="flex bg-gray-200 text-gray-700 items-center gap-2 px-2 rounded hover:bg-gray-300" onClick={()=>navigate('/courses')}><ArrowLeft className="w-3 h-3"/> Back to courses list </button>
        <button className="flex bg-accent-200 text-gray-700 items-center gap-2 px-2 rounded  hover:bg-accent-300"  onClick={()=>handleEdit()}><Pencil className="w-3 h-3"/> Edit course </button>
        <button className="flex bg-red-200 text-gray-700 items-center gap-2 px-2 rounded  hover:bg-red-300"  onClick={()=>handleDelete()}><Trash2 className="w-3 h-3"/> Delete course </button>
      </div>
      </div>
      
      </div>


      

      {/* Nội dung chi tiết */}
    
        {/* Hình ảnh và thông tin cơ bản */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            <img
              src={course.image}
              alt={course.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <div className="grid grid-cols-3 gap-4">
            <div  >
                <p className="text-gray-600 ">Course ID:</p>
                <p className="mt-2 bg-gray-100 rounded p-1 border ">{course.id}</p>
              </div>
              <div >
                <p className="text-gray-600 ">Course name:</p>
                <p className="mt-2 bg-gray-100 rounded p-1 border">{course.name}</p>
              </div>
              <div >
                <p className="text-gray-600 ">Level:</p>
                <p className="mt-2 bg-gray-100 rounded p-1 border">{course.level}</p>
              </div>
              <div>
                <p className="text-gray-600">Duration:</p>
                <p className="mt-2 bg-gray-100 rounded p-1 border">{course.duration}</p>
              </div>
              <div>
                <p className="text-gray-600">Teacher:</p>
                <p className="fmt-2 bg-gray-100 rounded p-1 border">{course.teacher}</p>
              </div>
              <div>
                <p className="text-gray-600">Status:</p>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-sm ${
                    course.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {course.status}
                </span>
              </div>
              {course.price && (
                <div>
                  <p className="text-gray-600">Price:</p>
                  <p className="mt-2 bg-gray-100 rounded p-1 border">
                    {course.price.toLocaleString()} VND
                  </p>
                </div>
              )}
              {course.maxStudents && course.currentStudents && (
                <div>
                  <p className="text-gray-600">Students:</p>
                  <p className="mt-2 bg-gray-100 rounded p-1 border">
                    {course.currentStudents}/{course.maxStudents}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Mô tả */}
        
        {/* Tab Headers */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            className={`py-2 px-4 text-gray-600 hover:text-gray-800 focus:outline-none ${
              activeTab === "description"
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : ""
            }`}
            onClick={() => setActiveTab("description")}
          >
            Course Description
          </button>
          <button
            className={`py-2 px-4 text-gray-600 hover:text-gray-800 focus:outline-none ${
              activeTab === "students"
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : ""
            }`}
            onClick={() => setActiveTab("students")}
          >
            List Students
          </button>
          <button
            className={`py-2 px-4 text-gray-600 hover:text-gray-800 focus:outline-none ${
              activeTab === "class"
                ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                : ""
            }`}
            onClick={() => setActiveTab("class")}
          >
            List Class
          </button>
        </div>
      </div>
        {/* Tab Content */}
      <div>
       
        {activeTab === "description" && (
          <div>
          <Card className="p-4 h-full" title="Description">
            <p className="text-gray-700">{course.description}</p>
          </Card>
        </div>
        )}

        {activeTab === "students" && (
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Student List</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage students enrolled in this course
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {filteredStudents.length} students
                </span>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search students by name, email, or phone..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setShowStudentFilters(!showStudentFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  {showStudentFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                {(studentSearch || studentStatusFilter || studentLevelFilter || studentDateFilter) && (
                  <Button
                    variant="secondary"
                    onClick={clearStudentFilters}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Filter Options */}
              {showStudentFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select
                      value={studentStatusFilter}
                      onChange={(e) => setStudentStatusFilter(e.target.value)}
                      options={[
                        { label: "All Status", value: "" },
                        { label: "Active", value: "active" },
                        { label: "Inactive", value: "inactive" },
                        { label: "Graduated", value: "graduated" }
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>
                    <Select
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
                  </div>
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
                </div>
              )}
            </div>

            {/* Table */}
            <Table columns={studentColumns} data={paginatedStudents} />

            {/* Pagination */}
            {filteredStudents.length > studentsPerPage && (
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
          </Card>
        )}

        {activeTab === "class" && (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="mr-2">View: </p>
                  <div className="flex bg-gray-200 rounded-md w-fit h-[30px] border">
                    <button className={`flex items-center gap-2 px-1 rounded-md ${subTab === "table" ? "" : "bg-primary-800 text-white"}`} onClick={() => setSubTab("schedule")}>      
                      <CalendarCheck2 className="w-3 h-3" />
                      Schedule
                    </button>
                    <button className={`flex items-center gap-2 px-1 rounded-md ${subTab === "table" ? "bg-primary-800 text-white" : ""}`} onClick={() => setSubTab("table")}>
                      <TableIcon className="w-3 h-3" />
                      Table
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleAddClass}

                >
                  <Plus className="w-4 h-4" />
                  Add Class
                </Button>
              </div>
            </div>
            {subTab === "schedule" ? (
              <Card className="p-6" title="Schedule">
                {/* <ul className="space-y-4">
                  {classSessions.map((session) => (
                    <li key={session.id} className="border-b pb-2">
                      <p className="font-semibold">{session.date}</p>
                      <p>{session.time} - {session.room}</p>
                    </li>
                  ))}
                </ul> */}
                 <Calendar
    localizer={localizer}
    events={events}
    startAccessor="start"
    endAccessor="end"
    style={{ height: 500 }}
    date={currentDate}             // truyền state ngày hiện tại
    onNavigate={(newDate) => setCurrentDate(newDate)} // cập nhật khi bấm nút
    views={["month", "week", "day"]}
    defaultView="week"
  />
              </Card>
            ) : (
              <Card className="p-6" title="List Class">
                <Table columns={classColumns} data={classes} />
              </Card>
            )}
          </div>
        )}
      </div>
      

      {/* Thanh điều khiển */}
      {/* <div className="mt-6">
        <Card className="p-4 flex justify-end gap-4">
          <Button variant="primary" onClick={handleEnroll}>
            Enroll Now
          </Button>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full border border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            onClick={handleEdit}
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full border border-red-300 text-red-600 hover:border-red-400 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
            onClick={handleDelete}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </Card>
      </div> */}

      {/* Dialogs */}
      <AddEditClassDialog
        open={addEditDialog.open}
        onOpenChange={(open) => setAddEditDialog({ open, classData: addEditDialog.classData })}
        onSave={handleSaveClass}
        classData={addEditDialog.classData}
        courseName={course.name}
      />

      <ClassDetailDialog
        open={detailDialog.open}
        onOpenChange={(open) => setDetailDialog({ open, classData: detailDialog.classData })}
        classData={detailDialog.classData}
        onEdit={handleEditClass}
      />

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
  );
};

export default CourseDetail;