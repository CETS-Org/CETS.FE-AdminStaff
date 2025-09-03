import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft,  CalendarCheck2,  Pencil, TableIcon, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageHeader from "@/components/ui/PageHeader";
import type { TableColumn } from "@/components/ui/Table";
import Table from "@/components/ui/Table";
import type { Student } from "../staff_students/components/students_list";
import { Calendar,dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

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
  const [subTab, setSubTab] = useState<"schedule" | "table">("schedule");
  const [activeTab, setActiveTab] = useState<"description" | "students" | "class">("description");

  const handleEdit = () => {
    // Logic chỉnh sửa (mở dialog hoặc redirect)
    console.log("Edit course:", course.name);
  };

  const handleDelete = () => {
    // Logic xóa (mở confirm dialog)
    console.log("Delete course:", course.name);
  };

  const handleEnroll = () => {
    // Logic đăng ký
    console.log("Enroll in course:", course.name);
  };

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
  const classColumns: TableColumn<ClassSession>[] = [
    { header: "ID", accessor: (row) => row.id },
    { header: "Date", accessor: (row) => row.date },
    { header: "Time", accessor: (row) => row.time },
    { header: "Room", accessor: (row) => row.room },
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
        <button className="flex bg-gray-200 text-gray-700 items-center gap-2 px-2 rounded hover:bg-gray-300" onClick={()=>handleEdit()}><ArrowLeft className="w-3 h-3"/> Back to courses list </button>
        <button className="flex bg-accent-200 text-gray-700 items-center gap-2 px-2 rounded  hover:bg-accent-300"  onClick={()=>handleEdit()}><Pencil className="w-3 h-3"/> Edit course </button>
        <button className="flex bg-red-200 text-gray-700 items-center gap-2 px-2 rounded  hover:bg-red-300"  onClick={()=>handleEdit()}><Trash2 className="w-3 h-3"/> Delete course </button>
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
          <Card className="p-4 h-full">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700">{course.description}</p>
          </Card>
        </div>
        )}

        {activeTab === "students" && (
          <Card className="p-6">
            <Table columns={studentColumns} data={students} />
          </Card>
        )}

        {activeTab === "class" && (
          <div>
            <div className="mb-4">
            <div className="flex ">
        <p className="mr-2">View: </p>
        <div className="flex justify-end mb-4 bg-gray-200  rounded-md w-fit h-[30px] border ">
      
          <button className={`flex items-center gap-2 px-1 rounded-md  ${subTab ==="table" ? "" : "bg-primary-800 text-white" }`}   onClick={() => setSubTab("schedule")}>      
            <CalendarCheck2 className="w-3 h-3" />
            Schedule
          </button>
          <button className={`flex items-center gap-2 px-1 rounded-md  ${subTab ==="table" ? "bg-primary-800 text-white" : "" } `}   onClick={() => setSubTab("table")}>
            <TableIcon className="w-3 h-3" />
            Table
          </button>
        </div>
        </div>
              
            </div>
            {subTab === "schedule" ? (
              <Card className="p-6">
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
              <Card className="p-6">
                <Table columns={classColumns} data={classSessions} />
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
    </div>
  );
};

export default CourseDetail;