// src/pages/staff/staff_courses/ClassDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Users, Clock, Calendar, MapPin, User, BookOpen, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DeleteClassDialog from './components/DeleteClassDialog';

// Types
interface Class {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacher: string;
  teacherId: string;
  schedule: string;
  room: string;
  currentStudents: number;
  maxStudents: number;
  status: 'active' | 'inactive' | 'full';
  startDate: string;
  endDate: string;
  description?: string;
  sessions: number;
  completedSessions: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  attendance: number;
  progress: number;
}

// Mock data
const mockClass: Class = {
  id: "CL001",
  name: "English Advanced - Morning Class",
  courseId: "ENGO01",
  courseName: "English Conversation",
  teacher: "Dr. Sarah Johnson",
  teacherId: "T001",
  schedule: "Mon, Wed, Fri - 8:00 AM",
  room: "Room A101",
  currentStudents: 15,
  maxStudents: 20,
  status: "active",
  startDate: "2024-01-15",
  endDate: "2024-04-15",
  description: "Advanced English conversation class focusing on business communication and professional development.",
  sessions: 48,
  completedSessions: 12
};

const mockStudents: Student[] = [
  {
    id: "S001",
    name: "John Smith",
    email: "john.smith@email.com", 
    phone: "+1234567890",
    joinDate: "2024-01-15",
    attendance: 95,
    progress: 78
  },
  {
    id: "S002",
    name: "Emily Chen",
    email: "emily.chen@email.com",
    phone: "+1234567891", 
    joinDate: "2024-01-16",
    attendance: 88,
    progress: 82
  },
  {
    id: "S003",
    name: "Michael Brown",
    email: "michael.brown@email.com",
    phone: "+1234567892",
    joinDate: "2024-01-17", 
    attendance: 92,
    progress: 75
  }
];

export default function ClassDetailPage() {
  const { courseId, classId } = useParams<{ courseId: string; classId: string }>();
  const navigate = useNavigate();
  const [classData] = useState<Class>(mockClass);
  const [students] = useState<Student[]>(mockStudents);
  const [loading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    // Fetch class data here
    console.log("Fetching class data for:", { courseId, classId });
  }, [courseId, classId]);

  const handleEdit = () => {
    navigate(`/staff/courses/${courseId}/classes/${classId}/edit`);
  };

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    console.log("Delete class:", classId);
    navigate(`/staff/courses/${courseId}`);
    setDeleteDialog(false);
  };

  const handleBackToCourse = () => {
    navigate(`/staff/courses`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'full':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading class details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={handleBackToCourse}
              iconLeft={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Course
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
              <p className="text-gray-600">{classData.courseName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleEdit}
              iconLeft={<Edit className="w-4 h-4" />}
            >
              Edit Class
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              iconLeft={<Trash2 className="w-4 h-4" />}
            >
              Delete Class
            </Button>
          </div>
        </div>

        {/* Class Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Class Information</h2>
                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(classData.status)}`}>
                  {classData.status.charAt(0).toUpperCase() + classData.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Teacher</p>
                      <p className="font-medium">{classData.teacher}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Schedule</p>
                      <p className="font-medium">{classData.schedule}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Room</p>
                      <p className="font-medium">{classData.room}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Students</p>
                      <p className="font-medium">{classData.currentStudents}/{classData.maxStudents}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{classData.startDate} - {classData.endDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Progress</p>
                      <p className="font-medium">{classData.completedSessions}/{classData.sessions} sessions</p>
                    </div>
                  </div>
                </div>
              </div>

              {classData.description && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600">{classData.description}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Statistics */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{classData.currentStudents}</div>
                <div className="text-sm text-gray-500">Enrolled Students</div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round((classData.completedSessions / classData.sessions) * 100)}%
                </div>
                <div className="text-sm text-gray-500">Course Progress</div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length)}%
                </div>
                <div className="text-sm text-gray-500">Average Attendance</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Students List */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Students</h2>
            <span className="ml-auto text-sm text-gray-500">{students.length} students</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Join Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Attendance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Progress</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">ID: {student.id}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{student.email}</p>
                        <p className="text-sm text-gray-500">{student.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {student.joinDate}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getAttendanceColor(student.attendance)}`}>
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Delete Class Dialog */}
        <DeleteClassDialog
          open={deleteDialog}
          onOpenChange={setDeleteDialog}
          onConfirm={handleConfirmDelete}
          classData={classData}
        />
      </div>
    </div>
  );
}
