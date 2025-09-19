import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Table, { type TableColumn } from "@/components/ui/Table";
import Loader from "@/components/ui/Loader";
import { 
  ChevronRight, 
  Edit, 
  Trash2, 
  User, 
  Settings, 
  Calendar, 
  BookOpen, 
  Award,
  MessageSquare,
  Plus,
  GraduationCap,
  Users,
  Star,
  Clock,
  Mail,
  Phone,
  MapPin,
  IdCard
} from "lucide-react";
// import { getTeacherById, type Teacher } from "@/pages/api/teacher.api";
import { formatDate, getStatusColor, getStatusDisplay } from "@/helper/helper.service";
import { getListCourseTeaching, getTeacherById, getListCredentialType, getListCredentialByTeacherId} from "@/api/teacher.api";
import type { CourseTeaching, Teacher, TeacherCredentialResponse, CredentialTypeResponse } from "@/types/teacher.type";



// Remove TeachingCourse interface as we'll use CourseTeaching from types


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
  const [teachingCourses, setTeachingCourses] = useState<CourseTeaching[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [credentialTypes, setCredentialTypes] = useState<CredentialTypeResponse[]>([]);
  const [certificates, setCertificates] = useState<TeacherCredentialResponse[]>([]);
  const [qualifications, setQualifications] = useState<TeacherCredentialResponse[]>([]);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch credential types when component mounts
  useEffect(() => {
    const fetchCredentialTypes = async () => {
      try {
        const types = await getListCredentialType();
        setCredentialTypes(types);
      } catch (error) {
        console.error('Error fetching credential types:', error);
      }
    };

    fetchCredentialTypes();
  }, []);

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

  useEffect(() => {
    const fetchTeachingCourses = async () => {
      if (!id) return;

      try {
        setCoursesLoading(true);
        console.log("Fetching teaching courses for teacher:", id);
        const coursesData = await getListCourseTeaching(id);
        // Sort so that courses with more students are at the top, then by assignedAt descending
        coursesData.sort((a, b) => {
          // First, sort by student count (descending)
          const aStudents = a.studentCount || 0;
          const bStudents = b.studentCount || 0;
          if (aStudents !== bStudents) {
            return bStudents - aStudents;
          }
          // Then, sort by assignedAt descending
          const aDate = new Date(a.assignedAt || 0).getTime();
          const bDate = new Date(b.assignedAt || 0).getTime();
          return bDate - aDate;
        });
        console.log("Teaching courses data received:", coursesData);
        setTeachingCourses(coursesData);
      } catch (err) {
        console.error("Error fetching teaching courses:", err);
        // Don't set error state for courses, just log it
        setTeachingCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchTeachingCourses();
  }, [id]);

  // Fetch teacher credentials when teacher ID is available
  useEffect(() => {
    const fetchTeacherCredentials = async () => {
      if (!id || !credentialTypes.length) return;

      try {
        setCredentialsLoading(true);
        console.log("Fetching teacher credentials for teacher:", id);

        const credentialsData = await getListCredentialByTeacherId(id);
        console.log("Teacher credentials data received:", credentialsData);

        // Separate certificates and qualifications
        const certificateType = credentialTypes.find(type => type.name === "Certificate");
        const qualificationType = credentialTypes.find(type => type.name === "Qualification");
        
        const certificateList = credentialsData.filter(cred => 
          certificateType && cred.credentialTypeId === certificateType.id
        );
        const qualificationList = credentialsData.filter(cred => 
          qualificationType && cred.credentialTypeId === qualificationType.id
        );

        setCertificates(certificateList);
        setQualifications(qualificationList);
      } catch (err) {
        console.error("Error fetching teacher credentials:", err);
        setCertificates([]);
        setQualifications([]);
      } finally {
        setCredentialsLoading(false);
      }
    };

    fetchTeacherCredentials();
  }, [id, credentialTypes]);
   // Remove hardcoded teachingCourses data - now using API data



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

  const handleManageCourse = (courseId: string) => {
    navigate(`/staff/courses/${courseId}`);
  };

  // Function to categorize credentials by type
  // const categorizeCredentials = () => {
  //   if (!teacherCredentials.length || !credentialTypes.length) {
  //     return { certificates: [], qualifications: [] };
  //   }

  //   const certificates: TeacherCredential[] = [];
  //   const qualifications: TeacherCredential[] = [];

  //   teacherCredentials.forEach(credential => {
  //     // Find the credential type name by credentialTypeId
  //     const credentialType = credentialTypes.find(type => type.id === credential.credentialTypeId);
      
  //     if (credentialType?.name === 'Certificate') {
  //       certificates.push(credential);
  //     } else if (credentialType?.name === 'Qualification') {
  //       qualifications.push(credential);
  //     }
  //   });

  //   return { certificates, qualifications };
  // };

  // Table columns for teaching courses
  const courseColumns: TableColumn<CourseTeaching>[] = [
    {
      header: "Course Name",
      accessor: (course) => (
        <div className="flex items-center gap-3">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <div>
            <span className="font-medium">{course.courseName || "N/A"}</span>
            <div className="text-sm text-gray-500">{course.courseCode || "N/A"}</div>
          </div>
        </div>
      )
    },
    {
      header: "Category & Level",
      accessor: (course) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">{course.categoryName || "N/A"}</div>
          <div className="text-xs text-gray-500">{course.courseLevelName || "N/A"}</div>
        </div>
      )
    },
    {
      header: "Students",
      accessor: (course) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{course.studentCount || 0}</span>
        </div>
      )
    },
    {
      header: "Format",
      accessor: (course) => (
        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {course.courseFormatName || "N/A"}
        </span>
      )
    },
    {
      header: "Assigned Date",
      accessor: (course) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{formatDate(course.assignedAt)}</span>
        </div>
      )
    },
    {
      header: "Actions",
      accessor: (course) => (
        <div className="flex gap-2">
          {/* <button
            onClick={() => handleViewCourse(course.courseId)}
            className="p-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button> */}
          <button
            onClick={() => handleManageCourse(course.courseId)}
            className="p-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors relative group"
          >
            <Settings className="w-4 h-4" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Manage
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
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


  const breadcrumbItems = [
    { label: "Teachers", to: "/staff/teachers" },
    { label: teacherData?.fullName || "Teacher Detail" }
  ];

  return (
    <div className="p-6 mx-auto mt-16 ">
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-between mb-6 mt-4">
          <div></div>
          <div className="flex gap-3">
            <Button
              onClick={handleEdit}
              variant="secondary"
              size="sm"
              className="rounded-full border border-gray-300 bg-white hover:bg-gray-50"
            >
              <div className="flex items-center ">
              <Edit className="w-4 h-4 mr-2" />
              Edit
              </div>
            </Button>
            <Button
              onClick={handleDelete}
              variant="secondary"
              size="sm"
              className="rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-red-600 hover:text-red-700"
            >
              <div className="flex items-center ">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
              </div>
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
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(teacher.accountStatusID || "")}`}>
                  {getStatusDisplay(teacher.accountStatusID || "")}
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
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                  <p className="text-gray-600">{teacher.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Phone</label>
                  <p className="text-gray-600">{teacher.phoneNumber || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Date of Birth</label>
                  <p className="text-gray-600">{formatDate(teacher.dateOfBirth) || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Account Created</label>
                  <p className="text-gray-600">{formatDate(teacher.createdAt) || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Address</label>
                  <p className="text-gray-600">{teacher.address || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <IdCard className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">CID</label>
                  <p className="text-gray-600">{teacher.cid || "N/A"}</p>
                </div>
              </div>
              {teacher.teacherInfo && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Experience</label>
                    <p className="text-gray-600">{teacher.teacherInfo.yearsExperience || "N/A"} years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Bio</label>
                    <p className="text-gray-600">{teacher.teacherInfo.bio || "No bio available"}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Credentials */}
          <div className="mt-6 space-y-6">
            {/* Certificates */}
            <Card title="Certificates">
              {credentialsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader />
                </div>
              ) : (
                <div className="space-y-4">
                  {certificates.length > 0 ? (
                    certificates.map((credential: TeacherCredentialResponse) => (
                      <div key={credential.credentialId} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">
                                {credential.name || `Certificate - ${formatDate(credential.createdAt)}`}
                              </h4>
                              <div className="flex gap-2 mb-2">
                                {credential.level && (
                                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {credential.level}
                                  </span>
                                )}
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  Certificate
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                Created: {formatDate(credential.createdAt)}
                              </p>
                            </div>
                            {credential.pictureUrl && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-blue-200">
                                <img 
                                  src={credential.pictureUrl} 
                                  alt={credential.name || 'Certificate'} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No certificates available</p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Qualifications */}
            <Card title="Qualifications">
              {credentialsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader />
                </div>
              ) : (
                <div className="space-y-4">
                  {qualifications.length > 0 ? (
                    qualifications.map((credential: TeacherCredentialResponse) => (
                      <div key={credential.credentialId} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">
                                {credential.name || `Qualification - ${formatDate(credential.createdAt)}`}
                              </h4>
                              <div className="flex gap-2 mb-2">
                                {credential.level && (
                                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {credential.level}
                                  </span>
                                )}
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  Qualification
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                Created: {formatDate(credential.createdAt)}
                              </p>
                            </div>
                            {credential.pictureUrl && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-green-200">
                                <img 
                                  src={credential.pictureUrl} 
                                  alt={credential.name || 'Qualification'} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
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
              )}
            </Card>
          </div>
        </div>

        {/* Right Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Teaching Courses */}
          <Card title="Teaching Courses">
            {coursesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader />
              </div>
            ) : (
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
            )}
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
                  <span className="font-bold text-blue-600">
                    {teachingCourses.reduce((total, course) => total + (course.studentCount || 0), 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total Courses:</span>
                  <span className="font-bold text-purple-600">{teachingCourses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Active Courses:</span>
                  <span className="font-bold text-green-600">
                    {teachingCourses.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Average Students/Course:</span>
                  <span className="font-bold text-orange-600">
                    {teachingCourses.length > 0 
                      ? Math.round(teachingCourses.reduce((total, course) => total + (course.studentCount || 0), 0) / teachingCourses.length)
                      : 0
                    }
                  </span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      {teachingCourses.length > 0 
                        ? `Teaching ${teachingCourses.length} course${teachingCourses.length > 1 ? 's' : ''} with ${teachingCourses.reduce((total, course) => total + (course.studentCount || 0), 0)} total students`
                        : 'No courses assigned yet'
                      }
                    </span>
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
