import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table, { type TableColumn } from "@/components/ui/Table";
import Loader from "@/components/ui/Loader";
import { 
  ChevronRight, 
  Edit, 
  Trash2, 
  User, 
  Eye, 
  Settings, 
  Calendar, 
  BookOpen, 
  Award,
  MessageSquare,
  Plus,
  GraduationCap,
  Users,
  Star,
  Clock
} from "lucide-react";
// import { getTeacherById, type Teacher } from "@/pages/api/teacher.api";
import { formatDate, getStatusColor, getStatusDisplay } from "@/helper/helper.service";
import { getTeacherById, type Teacher } from "@/api/teacher.api";



interface TeachingCourse {
  id: string;
  courseName: string;
  students: number;
  schedule: string;
  status: "active" | "completed" | "upcoming";
}


interface Note {
  id: string;
  adminName: string;
  adminAvatar: string;
  date: string;
  content: string;
}

export default function TeacherDetailPage() {
  const { id } = useParams();
  const [newNote, setNewNote] = useState("");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacher = async () => {
      if (!id) {
        setError("Teacher ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching teacher with ID:", id);
        const teacherData = await getTeacherById(id);
        console.log("Teacher data received:", teacherData);
        setTeacher(teacherData);
      } catch (err) {
        console.error("Error fetching teacher:", err);
        console.error("Error details:", {
          message: err instanceof Error ? err.message : 'Unknown error',
          status: err instanceof Error && 'response' in err ? (err as any).response?.status : 'No status',
          data: err instanceof Error && 'response' in err ? (err as any).response?.data : 'No data'
        });
        setError(`Failed to load teacher data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  const teachingCourses: TeachingCourse[] = [
    {
      id: "1",
      courseName: "Advanced English Grammar",
      students: 25,
      schedule: "Mon, Wed 2:00 PM",
      status: "active"
    },
    {
      id: "2",
      courseName: "Business English",
      students: 18,
      schedule: "Tue, Thu 4:00 PM",
      status: "active"
    },
    {
      id: "3",
      courseName: "IELTS Preparation",
      students: 30,
      schedule: "Fri 10:00 AM",
      status: "active"
    },
    {
      id: "4",
      courseName: "Creative Writing",
      students: 15,
      schedule: "Sat 9:00 AM",
      status: "upcoming"
    }
  ];



  const notes: Note[] = [
    {
      id: "1",
      adminName: "Admin Manager",
      adminAvatar: "https://via.placeholder.com/40x40?text=AM",
      date: "January 15, 2025",
      content: "Dr. Smith consistently receives excellent student feedback. His teaching methods are highly effective and students show significant improvement."
    },
    {
      id: "2",
      adminName: "Academic Director",
      adminAvatar: "https://via.placeholder.com/40x40?text=AD",
      date: "January 10, 2025",
      content: "Outstanding performance in curriculum development. Recommended for lead teacher position in advanced courses."
    }
  ];

  const handleEdit = () => {
    // Navigate to edit page
    console.log("Edit teacher");
  };

  const handleDelete = () => {
    // Show delete confirmation
    console.log("Delete teacher");
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // Add new note logic
      console.log("Adding note:", newNote);
      setNewNote("");
    }
  };

  const handleViewCourse = (courseId: string) => {
    console.log("View course:", courseId);
  };

  const handleManageCourse = (courseId: string) => {
    console.log("Manage course:", courseId);
  };

  // Table columns for teaching courses
  const courseColumns: TableColumn<TeachingCourse>[] = [
    {
      header: "Course Name",
      accessor: (course) => (
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{course.courseName}</span>
        </div>
      )
    },
    {
      header: "Students",
      accessor: (course) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span>{course.students}</span>
        </div>
      )
    },
    {
      header: "Schedule",
      accessor: (course) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{course.schedule}</span>
        </div>
      )
    },
    {
      header: "Status",
      accessor: (course) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
          course.status === 'active' ? 'bg-green-100 text-green-800' :
          course.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {course.status}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: (course) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewCourse(course.id)}
            className="p-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleManageCourse(course.id)}
            className="p-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <Settings className="w-4 h-4" />
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
  if (error || !teacher) {
    return (
      <div className="p-6 mx-auto mt-16 lg:pl-70">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Teacher</h3>
          <p className="text-gray-500 mb-4">{error || "Teacher not found"}</p>
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


  return (
    <div className="p-6 mx-auto mt-16 ">
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/teachers" className="hover:text-gray-900">Teachers</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Teacher Detail</span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleEdit}
              variant="secondary"
              size="sm"
              className="rounded-full border border-gray-300 bg-white hover:bg-gray-50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              variant="secondary"
              size="sm"
              className="rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Teacher Information */}
        <div className="lg:col-span-1">
          <Card title="Teacher Information">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {teacher.avatarUrl ? (
                  <img 
                    src={teacher.avatarUrl} 
                    alt={teacher.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{teacher.fullName}</h2>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(teacher.accountStatusID)}`}>
                  {getStatusDisplay(teacher.accountStatusID)}
                </span>
                {teacher.isVerified && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{teacher.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{teacher.phoneNumber || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <p className="text-gray-900">{formatDate(teacher.dateOfBirth)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                <p className="text-gray-900">{formatDate(teacher.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <p className="text-gray-900">{teacher.address || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CID</label>
                <p className="text-gray-900">{teacher.cid || "N/A"}</p>
              </div>
              {teacher.teacherInfo && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <p className="text-gray-900">{teacher.teacherInfo.yearsExperience} years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <p className="text-gray-900">{teacher.teacherInfo.bio || "No bio available"}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Qualifications */}
          <Card title="Qualifications" className="mt-6">
            <div className="space-y-4">
              {teacher.teacherInfo?.teacherCredentials && teacher.teacherInfo.teacherCredentials.length > 0 ? (
                teacher.teacherInfo.teacherCredentials.map((credential) => (
                  <div key={credential.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{credential.degree} - {credential.field}</p>
                      <p className="text-sm text-gray-600">{credential.institution}, {credential.year}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No qualifications available</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Teaching Courses */}
          <Card title="Teaching Courses">
            <Table
              columns={courseColumns}
              data={teachingCourses}
              emptyState={
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No courses assigned</p>
                </div>
              }
            />
          </Card>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teaching Performance */}
            <Card title="Teaching Performance">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">4.8/5.0</h3>
                <p className="text-gray-600">Student Rating</p>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Rating Chart Placeholder</p>
                </div>
              </div>
            </Card>

            {/* Teaching Summary */}
            <Card title="Teaching Summary">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Students:</span>
                  <span className="font-bold text-blue-600">88</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Active Courses:</span>
                  <span className="font-bold text-green-600">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Teaching Hours:</span>
                  <span className="font-bold text-purple-600">24/week</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Attendance Rate:</span>
                  <span className="font-bold text-green-600">95%</span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">Consistently punctual and well-prepared</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Notes & Comments */}
          <Card title="Notes & Comments">
            <div className="space-y-6">
              {/* Existing Notes */}
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">{note.adminName}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{note.date}</span>
                      </div>
                      <p className="text-gray-700">{note.content}</p>
                    </div>
                  </div>
                ))}
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
        </div>
      </div>
    </div>
  );
}
