import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Table, { type TableColumn } from "@/components/ui/Table";
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
  Plus
} from "lucide-react";

interface EnrolledCourse {
  id: string;
  courseName: string;
  teacher: string;
  schedule: string;
  status: "active" | "completed" | "dropped";
}

interface Note {
  id: string;
  teacherName: string;
  teacherAvatar: string;
  date: string;
  content: string;
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const [newNote, setNewNote] = useState("");

  // Mock data
  const student = {
    id: id || "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "March 15, 1995",
    enrollmentDate: "January 10, 2025",
    status: "active" as "active" | "inactive",
    avatar: "https://via.placeholder.com/100x100?text=SJ"
  };

  const enrolledCourses: EnrolledCourse[] = [
    {
      id: "1",
      courseName: "Advanced English Grammar",
      teacher: "Dr. Smith",
      schedule: "Mon, Wed 2:00 PM",
      status: "active"
    },
    {
      id: "2",
      courseName: "Business English",
      teacher: "Ms. Davis",
      schedule: "Tue, Thu 4:00 PM",
      status: "active"
    },
    {
      id: "3",
      courseName: "IELTS Preparation",
      teacher: "Prof. Wilson",
      schedule: "Fri 10:00 AM",
      status: "active"
    }
  ];

  const notes: Note[] = [
    {
      id: "1",
      teacherName: "Dr. Smith",
      teacherAvatar: "https://via.placeholder.com/40x40?text=DS",
      date: "January 15, 2025",
      content: "Sarah shows excellent progress in grammar exercises. Recommend focusing on advanced writing techniques for next semester."
    },
    {
      id: "2",
      teacherName: "Ms. Davis",
      teacherAvatar: "https://via.placeholder.com/40x40?text=MD",
      date: "January 10, 2025",
      content: "Great participation in business communication exercises. Shows strong potential for professional English."
    }
  ];

  const handleEdit = () => {
    // Navigate to edit page
    console.log("Edit student");
  };

  const handleDelete = () => {
    // Show delete confirmation
    console.log("Delete student");
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

  // Table columns for enrolled courses
  const courseColumns: TableColumn<EnrolledCourse>[] = [
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
      header: "Teacher",
      accessor: (course) => course.teacher
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
          'bg-red-100 text-red-800'
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

  return (
    <div className="p-6 mx-auto mt-16 lg:pl-70">
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/staff" className="hover:text-gray-900">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/staff/students" className="hover:text-gray-900">Students</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Student Detail</span>
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
        {/* Left Column - Student Information */}
        <div className="lg:col-span-1">
          <Card title="Student Information">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{student.name}</h2>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {student.status}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{student.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{student.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <p className="text-gray-900">{student.dateOfBirth}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
                <p className="text-gray-900">{student.enrollmentDate}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrolled Courses */}
          <Card title="Enrolled Courses">
            <Table
              columns={courseColumns}
              data={enrolledCourses}
              emptyState={
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No courses enrolled</p>
                </div>
              }
            />
          </Card>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance Overview */}
            <Card title="Attendance Overview">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">92%</h3>
                <p className="text-gray-600">Overall Attendance</p>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Attendance Chart Placeholder</p>
                </div>
              </div>
            </Card>

            {/* Performance Summary */}
            <Card title="Performance Summary">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Overall Grade:</span>
                  <span className="font-bold text-green-600">A-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Assignments Completed:</span>
                  <span className="font-bold text-blue-600">18/20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Quiz Average:</span>
                  <span className="font-bold text-purple-600">87%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Participation:</span>
                  <span className="font-bold text-green-600">Excellent</span>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">Outstanding performance in class discussions</span>
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
                        <span className="font-medium text-gray-900">{note.teacherName}</span>
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
