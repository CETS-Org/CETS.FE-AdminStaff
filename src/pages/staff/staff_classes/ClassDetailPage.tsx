// src/pages/staff/staff_courses/ClassDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Users, Clock, Calendar, MapPin, User, BookOpen, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DeleteClassDialog from '../staff_classes/components/DeleteClassDialog';
import { api } from '@/api';
import type { ClassDetailResponse, StudentInClass } from '@/api/class.api';

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
  studentCode: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  attendance: number;
  progress: number;
}

export default function ClassDetailPage() {
  const params = useParams<{ courseId?: string; classId?: string; id?: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Handle both route patterns: /staff/classes/:id and /staff/courses/:courseId/classes/:classId
  const classId = params.id || params.classId;
  const courseId = params.courseId;
  const isStandaloneRoute = !courseId; // True if accessed from /staff/classes

  useEffect(() => {
    const fetchClassDetail = async () => {
      if (!classId) {
        setError('Class ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.getClassDetail(classId);
        
        // Map API response to component state
        const mappedClass: Class = {
          id: response.id,
          name: response.className,
          courseId: response.courseId,
          courseName: response.courseName,
          teacher: response.teacherName,
          teacherId: response.teacherId || '',
          schedule: response.schedule,
          room: response.room,
          currentStudents: response.enrolledCount,
          maxStudents: response.capacity,
          status: response.status,
          startDate: response.startDate,
          endDate: response.endDate,
          description: response.description,
          sessions: response.totalSessions,
          completedSessions: response.completedSessions,
        };

        const mappedStudents: Student[] = response.students.map((student: StudentInClass) => ({
          id: student.id,
          studentCode: student.studentCode,
          name: student.name,
          email: student.email,
          phone: student.phone,
          joinDate: student.joinDate,
          attendance: student.attendanceRate,
          progress: student.progressPercentage,
        }));

        setClassData(mappedClass);
        setStudents(mappedStudents);
      } catch (err) {
        console.error('Error fetching class detail:', err);
        setError('Failed to load class details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetail();
  }, [classId]);

  const handleEdit = () => {
    if (isStandaloneRoute) {
      navigate(`/staff/classes/${classId}/edit`);
    } else {
      navigate(`/staff/courses/${courseId}/classes/${classId}/edit`);
    }
  };

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    console.log("Delete class:", classId);
    if (isStandaloneRoute) {
      navigate(`/staff/classes`);
    } else {
      navigate(`/staff/courses/${courseId}`);
    }
    setDeleteDialog(false);
  };

  const handleBackToCourse = () => {
    if (isStandaloneRoute) {
      navigate(`/staff/classes`);
    } else {
      navigate(`/staff/courses`);
    }
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

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <p className="text-xl font-semibold">Error Loading Class</p>
              <p className="mt-2">{error || 'Class not found'}</p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate(isStandaloneRoute ? '/staff/classes' : '/staff/courses')}
              className="!bg-blue-500 hover:!bg-blue-600"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-16">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={handleBackToCourse}
              iconLeft={<ArrowLeft className="w-4 h-4" />}
              className="!bg-blue-500 hover:!bg-blue-600"
            >
              {isStandaloneRoute ? "Back to Classes" : "Back to Course"}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <p className="text-gray-600">Course: {classData.courseName}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/staff/courses/${classData.courseId}`)}
                  className="!text-blue-600 hover:!text-blue-700 !p-1 !h-auto underline"
                >
                  View Course
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              onClick={handleEdit}
              iconLeft={<Edit className="w-4 h-4" />}
              className="!bg-blue-500 hover:!bg-blue-600"
            >
              Edit Class
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              iconLeft={<Trash2 className="w-4 h-4" />}
              className="!bg-red-500 hover:!bg-red-600 !text-white"
            >
              Delete Class
            </Button>
          </div>
        </div>

        {/* Class Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold">Class Information</h2>
                </div>
                <span className={`px-3 py-1 rounded-md text-sm font-medium ${getStatusColor(classData.status)}`}>
                  {classData.status.charAt(0).toUpperCase() + classData.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Teacher</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">{classData.teacher}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Schedule</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">{classData.schedule}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Room</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">{classData.room}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Students</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">{classData.currentStudents}/{classData.maxStudents}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Duration</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">{classData.startDate} - {classData.endDate}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-500">Progress</p>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">{classData.completedSessions}/{classData.sessions} sessions</p>
                  </div>
                </div>
              </div>

              {classData.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold mb-3 text-gray-900">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{classData.description}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Course & Statistics */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{classData.currentStudents}</div>
                <div className="text-sm text-gray-600 font-medium">Enrolled Students</div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Math.round((classData.completedSessions / classData.sessions) * 100)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Course Progress</div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / students.length)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Average Attendance</div>
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
                        <p className="text-sm text-gray-500">{student.studentCode}</p>
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
