import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Table, { type TableColumn } from "@/components/ui/Table";
import { Edit, UserX, User, Eye, Settings, Calendar, BookOpen, Award,Mail,Phone,MapPin,IdCard,Clock,MessageSquare,Plus,GraduationCap,Activity,ExternalLink,Copy} from "lucide-react";
import { formatDate, getStatusColor, getStatusDisplay } from "@/helper/helper.service";
import Loader from "@/components/ui/Loader";
import { getStudentById, getListCourseEnrollment, getTotalAssignmentByStudentId, getTotalAttendceByStudentId } from "@/api/student.api";
import type { Student, CourseEnrollment, AssignmentSubmited, TotalStudentAttendanceByCourse } from "@/types/student.type";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";


export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseEnrollment | null>(null);
  const [assignmentData, setAssignmentData] = useState<AssignmentSubmited | null>(null);
  const [attendanceData, setAttendanceData] = useState<TotalStudentAttendanceByCourse | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  // const [openEditDialog, setOpenEditDialog] = useState(false); // Replaced with page navigation
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  // const [editingStudent, setEditingStudent] = useState<UpdateStudent | null>(null); // Replaced with page navigation
  const [newNote, setNewNote] = useState("");
  // Fetch student data
  useEffect(() => {
    // show success toast once after update
    if (location.state && (location.state as any).updateStatus === "success") {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      navigate(location.pathname, { replace: true, state: {} });
      return () => clearTimeout(timer);
    }

    const fetchStudent = async () => {
      if (!id) {
        setError("Student ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching student with accountId:", id);
        const studentData = await getStudentById(id);
        console.log("Student data received:", studentData);
        setStudent(studentData);
      } catch (err) {
        console.error("Error fetching student:", err);
        console.error("Error details:", {
          message: err instanceof Error ? err.message : 'Unknown error',
          status: err instanceof Error && 'response' in err ? (err as any).response?.status : 'No status',
          data: err instanceof Error && 'response' in err ? (err as any).response?.data : 'No data'
        });
        setError(`Failed to load student data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!id) return;

      try {
        setCoursesLoading(true);
        console.log("Fetching enrolled courses for student:", id);
        const coursesData = await getListCourseEnrollment(id);
        // Sort so that active courses are at the top, then by createdAt descending
        coursesData.sort((a, b) => {
          // First, sort by isActive (active first)
          if (a.isActive !== b.isActive) {
            return a.isActive ? -1 : 1;
          }
          // Then, sort by createdAt descending
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        console.log("Enrolled courses data received:", coursesData);
        setEnrolledCourses(coursesData);
      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
        // Don't set error state for courses, just log it
        setEnrolledCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [id]);



  const handleEdit = () => {
    if (!id) return;
    navigate(`/admin/students/edit/${id}`);
  };

  const handleDelete = () => {
    // Show delete confirmation
    setOpenDeleteDialog(true);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // Add new note logic
      console.log("Adding note:", newNote);
      setNewNote("");
    }
  };

 
  const handleViewCourse = async (course: CourseEnrollment) => {
    setSelectedCourse(course);
    setPerformanceLoading(true);
    
    try {
      // Fetch both assignment and attendance data in parallel
      const [assignmentData, attendanceData] = await Promise.all([
        getTotalAssignmentByStudentId(id || "", course.id),
        getTotalAttendceByStudentId(id || "", course.id)
      ]);
      
      setAssignmentData(assignmentData);
      setAttendanceData(attendanceData);
    } catch (err) {
      console.error("Error fetching performance data:", err);
      setAssignmentData(null);
      setAttendanceData(null);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const handleManageCourse = (courseId: string) => {
    navigate(`/staff/courses/${courseId}`);
  };

  // Table columns for enrolled courses
  const courseColumns: TableColumn<CourseEnrollment>[] = [
    {
      header: "Course Name",
      className: "min-w-[200px]",
      accessor: (course) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-900 truncate">{course.courseName || "N/A"}</div>
            <div className="text-sm text-gray-500 font-mono">{course.courseCode || "N/A"}</div>
          </div>
        </div>
      )
    },
    {
      header: "Teachers",
      className: "min-w-[140px]",
      accessor: (course) => (
        <div className="space-y-1 py-2">
          {course.teachers.map((teacher, index) => (
            <div key={index} className="text-sm text-gray-700 font-medium">{teacher}</div>
          ))}
        </div>
      )
    },
    {
      header: "Status",
      className: "text-center min-w-[100px]",
      accessor: (course) => (
        <div className="flex items-center justify-center py-2">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
            course.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {course.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
    {
      header: "Enrolled Date",
      className: "min-w-[140px]",
      accessor: (course) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">{formatDate(course.createdAt)}</span>
        </div>
      )
    },
    {
      header: "Actions",
      className: "min-w-[160px]",
      accessor: (course) => (
        <div className="flex gap-2 py-2 justify-center">
          <button
            onClick={() => handleViewCourse(course)}
            className="p-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 relative group shadow-sm hover:shadow-md"
          >
            <Eye className="w-4 h-4" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg">
              View Performance
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </button>
          <button
            onClick={() => handleManageCourse(course.id)}
            className="p-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 relative group shadow-sm hover:shadow-md"
          >
            <Settings className="w-4 h-4" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg">
              Manage Course
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </button>
          <button
            onClick={() => window.open(`/staff/courses/${course.id}`, '_blank')}
            className="p-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-600 transition-all duration-200 relative group shadow-sm hover:shadow-md"
          >
            <ExternalLink className="w-4 h-4" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg">
              View Details
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </button>
        </div>
      )
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="p-6 mx-auto mt-16 lg:pl-70">
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !student) {
    return (
      <div className="p-6 mx-auto mt-16 lg:pl-70">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Student</h3>
          <p className="text-gray-500 mb-4">{error || "Student not found"}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // const handleSave = (updatedStudentData: UpdateStudent) => {
  //   console.log("Save student:", updatedStudentData);
  //   
  //   setOpenEditDialog(false);
  //   setEditingStudent(null);
  // }; // Replaced with page navigation
  const breadcrumbItems = [
    { label: "Students", to: "/admin/students" },
    { label: student?.fullName || "Student Detail" }
  ];

  return (
    <div className="p-6 mx-auto mt-16 ">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-green-200 bg-green-50 text-green-800 shadow-lg min-w-[280px]">
            <div className="w-6 h-6 mt-0.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Update Successful</p>
              <p className="text-sm">Student profile updated successfully.</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-2 text-green-700 hover:text-green-900"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-between mb-6 mt-4">
          <div></div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleEdit}
              variant="secondary"
            >
              <div className="flex items-center">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </div>
            </Button>
            <Button
              onClick={handleDelete}
              className="border-red-200 bg-red-500 hover:bg-red-100 hover:border-red-300 text-red-600 hover:text-red-700 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center">
                <UserX className="w-4 h-4 mr-2" />
                Ban Student
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* First Row - Student Info and Academic Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Student Information */}
        <div className="lg:col-span-2">
          <Card title="Student Information">
            <div className="text-center mb-6">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                  {student.avatarUrl ? (
                    <img 
                      src={student.avatarUrl} 
                      alt={student.fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <User className="w-12 h-12 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                  )}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors duration-200">{student.fullName}</h2>
              <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md ${getStatusColor(student.accountStatusID ?? "")}`}>
                  <Activity className="w-3 h-3 mr-1" />
                  {getStatusDisplay(student.accountStatusID ?? "")}
                </span>
              </div>
              {student.studentInfo?.studentCode && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mx-auto max-w-fit hover:bg-gray-100 transition-colors cursor-pointer group" 
                     onClick={() => navigator.clipboard.writeText(student.studentInfo?.studentCode || '')}>
                  <IdCard className="w-4 h-4" />
                  <span className="font-mono">{student.studentInfo.studentCode}</span>
                  <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                  <p className="text-gray-600 font-medium hover:text-blue-600 transition-colors cursor-pointer" 
                     onClick={() => window.open(`mailto:${student.email}`)}>
                    {student.email || "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Phone</label>
                  <p className="text-gray-600 font-medium hover:text-green-600 transition-colors cursor-pointer" 
                     onClick={() => student.phoneNumber && window.open(`tel:${student.phoneNumber}`)}>
                    {student.phoneNumber || "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Date of Birth</label>
                  <p className="text-gray-600 font-medium">{formatDate(student.dateOfBirth) || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Account Created</label>
                  <p className="text-gray-600 font-medium">{formatDate(student.createdAt) || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition-colors">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Address</label>
                  <p className="text-gray-600 font-medium">{student.address || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                  <IdCard className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">CID</label>
                  <p className="text-gray-600 font-medium font-mono">{student.cid || "N/A"}</p>
                </div>
              </div>
              {student.studentInfo && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 mb-1">Guardian Name</label>
                      <p className="text-gray-600 font-medium">{student.studentInfo.guardianName || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-200 transition-colors">
                      <Phone className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 mb-1">Guardian Phone</label>
                      <p className="text-gray-600 font-medium hover:text-teal-600 transition-colors cursor-pointer" 
                         onClick={() => student.studentInfo?.guardianPhone && window.open(`tel:${student.studentInfo.guardianPhone}`)}>
                        {student.studentInfo.guardianPhone || "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-200 transition-colors">
                      <BookOpen className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 mb-1">School</label>
                      <p className="text-gray-600 font-medium">{student.studentInfo.school || "N/A"}</p>
                    </div>
                  </div>
                  
                  {student.studentInfo.academicNote && (
                    <div className="md:col-span-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Academic Note
                      </label>
                      <p className="text-gray-700 leading-relaxed">
                        "{student.studentInfo.academicNote}"
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Academic Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Academic Overview */}
          <Card title="Academic Overview">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium mb-1">Enrolled Courses</p>
                    <p className="text-2xl font-bold text-blue-700">{enrolledCourses.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium mb-1">Active Courses</p>
                    <p className="text-2xl font-bold text-green-700">
                      {enrolledCourses.filter(course => course.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-900 mb-2">Learning Progress</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed">
                      {enrolledCourses.length > 0 
                        ? `Currently enrolled in ${enrolledCourses.length} course${enrolledCourses.length > 1 ? 's' : ''} with ${enrolledCourses.filter(course => course.isActive).length} active enrollment${enrolledCourses.filter(course => course.isActive).length !== 1 ? 's' : ''}.`
                        : 'No course enrollments yet. Ready to start learning journey.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Second Row - Enrolled Courses (Full Width) */}
      <div className="mb-8">
        <Card title="Enrolled Courses">
          {coursesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table
                columns={courseColumns}
                data={enrolledCourses}
                emptyState={
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No courses enrolled</p>
                  </div>
                }
              />
            </div>
          )}
        </Card>
      </div>

      {/* Third Row - Performance Overview */}
      {selectedCourse && (
        <div className="mb-8">
          <div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-down"
            style={{
              animation: 'slideDown 0.5s ease-out'
            }}
          >
              {/* Attendance Overview */}
              <Card title={`Attendance Overview - ${selectedCourse.courseName}`} className=" from-emerald-50 to-teal-100 border-emerald-200">
                {performanceLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader />
                  </div>
                ) : attendanceData ? (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                      {attendanceData.totalMeetings > 0 
                        ? Math.round((attendanceData.totalPresent / attendanceData.totalMeetings) * 100)
                        : 0
                      }%
                    </h3>
                    <p className="text-emerald-700 font-medium">Overall Attendance</p>
                    
                    {/* Attendance Chart */}
                    <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-emerald-200">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-700 font-medium">Present</span>
                          <span className="font-bold text-emerald-800">{attendanceData.totalPresent}/{attendanceData.totalMeetings}</span>
                        </div>
                        <div className="w-full bg-emerald-100 rounded-full h-3 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-3 rounded-full transition-all duration-1000 shadow-sm" 
                            style={{ 
                              width: attendanceData.totalMeetings > 0 
                                ? `${(attendanceData.totalPresent / attendanceData.totalMeetings) * 100}%`
                                : '0%'
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>Absent</span>
                          <span>{attendanceData.totalAbsent} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No attendance data available</p>
                  </div>
                )}
              </Card>

              {/* Performance Summary */}
              <Card title={`Assignment Performance - ${selectedCourse.courseName}`}>
                {performanceLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader />
                  </div>
                ) : assignmentData ? (
                  <div className="space-y-4">
                    {/* Circular Progress */}
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-200"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - (assignmentData.submitted / assignmentData.total))}`}
                          className={`${
                            (assignmentData.submitted / assignmentData.total) >= 0.8 
                              ? 'text-green-500' 
                              : (assignmentData.submitted / assignmentData.total) >= 0.6 
                                ? 'text-yellow-500' 
                                : 'text-red-500'
                          } transition-all duration-1000 ease-out`}
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Center content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">
                          {assignmentData.submitted}
                        </span>
                        <span className="text-xs text-gray-500">
                          / {assignmentData.total}
                        </span>
                      </div>
                    </div>

                    {/* Assignment Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Assignments Completed:</span>
                        <span className="font-bold text-blue-600">{assignmentData.submitted}/{assignmentData.total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Completion Rate:</span>
                        <span className={`font-bold ${
                          (assignmentData.submitted / assignmentData.total) >= 0.8 
                            ? 'text-green-600' 
                            : (assignmentData.submitted / assignmentData.total) >= 0.6 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                        }`}>
                          {Math.round((assignmentData.submitted / assignmentData.total) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Summary Message */}
                    {assignmentData.summary && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        (assignmentData.submitted / assignmentData.total) >= 0.8 
                          ? 'bg-green-50 border border-green-200' 
                          : (assignmentData.submitted / assignmentData.total) >= 0.6 
                            ? 'bg-yellow-50 border border-yellow-200' 
                            : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Award className={`w-4 h-4 ${
                            (assignmentData.submitted / assignmentData.total) >= 0.8 
                              ? 'text-green-600' 
                              : (assignmentData.submitted / assignmentData.total) >= 0.6 
                                ? 'text-yellow-600' 
                                : 'text-red-600'
                          }`} />
                          <span className={`text-sm font-medium ${
                            (assignmentData.submitted / assignmentData.total) >= 0.8 
                              ? 'text-green-800' 
                              : (assignmentData.submitted / assignmentData.total) >= 0.6 
                                ? 'text-yellow-800' 
                                : 'text-red-800'
                          }`}>
                            Performance Summary
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${
                          (assignmentData.submitted / assignmentData.total) >= 0.8 
                            ? 'text-green-700' 
                            : (assignmentData.submitted / assignmentData.total) >= 0.6 
                              ? 'text-yellow-700' 
                              : 'text-red-700'
                        }`}>
                          {assignmentData.summary}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No assignment data available</p>
                  </div>
                )}
              </Card>
          </div>
        </div>
      )}

      {/* Default Performance Overview when no course selected */}
      {!selectedCourse && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Attendance Overview */}
              <Card title="Attendance Overview" className=" from-emerald-50 to-teal-100 border-emerald-200">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">--</h3>
                  <p className="text-emerald-700 font-medium">Overall Attendance</p>
                  <div className="mt-4 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-600">Select a course to view detailed attendance</p>
                  </div>
                </div>
              </Card>

              {/* Performance Summary */}
              <Card title="Performance Summary">
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Click "View" on any enrolled course to see detailed performance</p>
                </div>
              </Card>
        </div>
      )}

      {/* Fourth Row - Notes & Comments (Full Width) */}
      <Card title="Notes & Comments">
        <div className="space-y-6">
          {/* Existing Notes */}
          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">Academic Advisor</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{formatDate(new Date().toISOString())}</span>
                </div>
                <p className="text-gray-700">Student shows consistent progress in course assignments and maintains good attendance record. Recommended for advanced level courses.</p>
              </div>
            </div>
          </div>

          {/* Add New Note */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Add New Note
            </h4>
            <div className="flex gap-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a new note or comment..."
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="flex items-center gap-2 self-end"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* AddEditStudentDialog replaced with dedicated edit page */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleDelete}
        title="Ban Student"
        message={`Are you sure you want to ban this student? This action can be reversed later.`}
      />

    </div>
  );
}
