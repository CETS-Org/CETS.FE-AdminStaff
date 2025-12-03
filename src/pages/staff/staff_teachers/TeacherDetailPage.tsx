import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Table, { type TableColumn } from "@/components/ui/Table";
import Loader from "@/components/ui/Loader";
import { UserX, User, Settings, Calendar, BookOpen, Award,MessageSquare,GraduationCap,Users,Clock,Mail,Phone,MapPin,IdCard,TrendingUp,Activity,Shield,CheckCircle,ExternalLink,Copy, X} from "lucide-react";
// import { getTeacherById, type Teacher } from "@/pages/api/teacher.api";
import { formatDate, getStatusColor, getStatusDisplay } from "@/helper/helper.service";
import { getListCourseTeaching, getTeacherById, getListCredentialType, getListCredentialByTeacherId} from "@/api/teacher.api";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
import { setIsDelete, setIsActive } from "@/api/account.api";
import type { CourseTeaching, Teacher, TeacherCredentialResponse, CredentialTypeResponse } from "@/types/teacher.type";



// Remove TeachingCourse interface as we'll use CourseTeaching from types


export default function TeacherDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [shouldRefetchCreds, setShouldRefetchCreds] = useState(false);
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
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<{ url: string; name: string } | null>(null);
  
  // Cloud storage base URL
  const CLOUD_STORAGE_BASE_URL = 'https://pub-59cfd11e5f0d4b00af54839edc83842d.r2.dev';
  
  // Helper function to get full image URL
  const getFullImageUrl = (url: string | null): string => {
    if (!url) return '';
    // If URL already starts with http/https, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If URL starts with /, remove it before prepending
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    // Prepend cloud storage base URL
    return `${CLOUD_STORAGE_BASE_URL}/${cleanPath}`;
  };

  // Helpers to load types and credentials together (prevents race)
  const loadCredentialTypesIfNeeded = async (): Promise<CredentialTypeResponse[]> => {
    if (credentialTypes.length > 0) return credentialTypes;
    try {
      const types = await getListCredentialType();
      setCredentialTypes(types);
      return types;
    } catch (error) {
      console.error('Error fetching credential types:', error);
      return [];
    }
  };

  const loadCredentials = async (accountId: string) => {
    const types = await loadCredentialTypesIfNeeded();
    if (!accountId || types.length === 0) return;
    try {
      setCredentialsLoading(true);
      const credentialsData = await getListCredentialByTeacherId(accountId);
      const certificateType = types.find(type => type.name === "Certificate");
      const qualificationType = types.find(type => type.name === "Qualification");
      const certificateList = credentialsData.filter(cred => certificateType && cred.credentialTypeId === certificateType.id);
      const qualificationList = credentialsData.filter(cred => qualificationType && cred.credentialTypeId === qualificationType.id);
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

  // On mount: load types; if coming from success, trigger toast and immediate credentials reload
  useEffect(() => {
    const fromSuccess = !!(location.state && (location.state as any).updateStatus === "success");
    if (fromSuccess) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      navigate(location.pathname, { replace: true, state: {} });
      // Load credentials immediately using the current id
      if (id) {
        void loadCredentials(id);
      }
      return () => clearTimeout(timer);
    } else {
      // Ensure types are available for first render path
      void loadCredentialTypesIfNeeded();
    }
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
        
        // Load credentials after teacher data is loaded
        void loadCredentials(id);
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

  // Watch flag to refetch credentials after other updates
  useEffect(() => {
    if (shouldRefetchCreds && id) {
      void loadCredentials(id);
      setShouldRefetchCreds(false);
    }
  }, [shouldRefetchCreds, id]);
   // Remove hardcoded teachingCourses data - now using API data

  const handleDelete = () => {
    setBanDialogOpen(true);
  };

  const confirmBanTeacher = async () => {
    if (!teacher?.accountId) return;
    try {
      const isBanned = (teacher as any)?.isDeleted || teacher.statusName === 'Blocked' || teacher.statusName === 'Locked';
      if (isBanned) {
        await setIsActive(teacher.accountId);
      } else {
        await setIsDelete(teacher.accountId);
      }
      const refreshed = await getTeacherById(teacher.accountId);
      setTeacher(refreshed);
    } catch (err) {
      console.error("Error updating teacher status:", err);
    } finally {
      setBanDialogOpen(false);
    }
  };

  const handleManageCourse = (courseId: string) => {
    navigate(`/admin/courses/${courseId}`);
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
      header: "Category & Level",
      className: "min-w-[140px]",
      accessor: (course) => (
        <div className="space-y-2 py-2">
          <div className="inline-flex px-2 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
            {course.categoryName || "N/A"}
          </div>
          <div className="text-xs text-gray-600 font-medium">{course.courseLevelName || "N/A"}</div>
        </div>
      )
    },
    {
      header: "Students",
      className: "text-center min-w-[100px]",
      accessor: (course) => (
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <span className="font-bold text-lg text-green-700">{course.studentCount || 0}</span>
        </div>
      )
    },
    {
      header: "Format",
      className: "min-w-[100px]",
      accessor: (course) => (
        <div className="py-2">
          <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 shadow-sm">
            {course.courseFormatName || "N/A"}
          </span>
        </div>
      )
    },
    {
      header: "Assigned Date",
      className: "min-w-[140px]",
      accessor: (course) => (
        <div className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">{formatDate(course.assignedAt)}</span>
        </div>
      )
    },
    {
      header: "Actions",
      className: "min-w-[120px]",
      accessor: (course) => (
        <div className="flex gap-2 py-2 justify-center">
          <button
            onClick={() => handleManageCourse(course.courseId)}
            className="p-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 relative group shadow-sm hover:shadow-md"
          >
            <Settings className="w-4 h-4" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg">
              Manage Course
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </button>
          <button
            onClick={() => window.open(`/admin/courses/${course.courseId}`, '_blank')}
            className="p-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 relative group shadow-sm hover:shadow-md"
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
    { label: "Teachers", to: "/admin/teachers" },
    { label: teacher?.fullName || "Teacher Detail" }
  ];

  return (
    <div className="p-6 mx-auto mt-16 ">
      {/* Success Toast after update */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-green-200 bg-green-50 text-green-800 shadow-lg min-w-[280px]">
            <div className="w-6 h-6 mt-0.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Update Successful</p>
              <p className="text-sm">Teacher profile updated successfully.</p>
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
          <div className="flex gap-3">
            {(() => {
              const isBanned = (teacher as any)?.isDeleted || teacher.statusName === 'Blocked' || teacher.statusName === 'Locked';
              return isBanned ? (
                <Button
                  onClick={handleDelete}
                  className="border-emerald-200 bg-emerald-500 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-700 hover:text-emerald-800 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center">
                    <UserX className="w-4 h-4 mr-2" />
                    Unban Teacher
                  </div>
                </Button>
              ) : (
                <Button
                  onClick={handleDelete}
                  className="border-red-200 bg-red-500 hover:bg-red-100 hover:border-red-300 text-red-600 hover:text-red-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center">
                    <UserX className="w-4 h-4 mr-2" />
                    Ban Teacher
                  </div>
                </Button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* First Row - Teacher Info and Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Teacher Information */}
        <div className="lg:col-span-2">
          <Card title="Teacher Information">
            <div className="text-center mb-6">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                  {teacher.avatarUrl ? (
                    <img 
                      src={teacher.avatarUrl} 
                      alt={teacher.fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <User className="w-12 h-12 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                  )}
                </div>
                {teacher.isVerified && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors duration-200">{teacher.fullName}</h2>
              <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md ${getStatusColor(teacher.accountStatusID || "")}`}>
                  <Activity className="w-3 h-3 mr-1" />
                  {getStatusDisplay(teacher.accountStatusID || "")}
                </span>
                {teacher.isVerified && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full border border-green-200">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Verified</span>
                  </div>
                )}
              </div>
              {teacher.teacherInfo?.teacherCode && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mx-auto max-w-fit hover:bg-gray-100 transition-colors cursor-pointer group" 
                     onClick={() => navigator.clipboard.writeText(teacher.teacherInfo?.teacherCode || '')}>
                  <IdCard className="w-4 h-4" />
                  <span className="font-mono">{teacher.teacherInfo.teacherCode}</span>
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
                     onClick={() => window.open(`mailto:${teacher.email}`)}>
                    {teacher.email}
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
                     onClick={() => teacher.phoneNumber && window.open(`tel:${teacher.phoneNumber}`)}>
                    {teacher.phoneNumber || "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Date of Birth</label>
                  <p className="text-gray-600 font-medium">{formatDate(teacher.dateOfBirth) || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Account Created</label>
                  <p className="text-gray-600 font-medium">{formatDate(teacher.createdAt) || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition-colors">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Address</label>
                  <p className="text-gray-600 font-medium">{teacher.address || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                  <IdCard className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">CID</label>
                  <p className="text-gray-600 font-medium font-mono">{teacher.cid || "N/A"}</p>
                </div>
              </div>
              
              {teacher.teacherInfo && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 mb-1">Experience</label>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-600 font-medium">{teacher.teacherInfo.yearsExperience || "N/A"} years</p>
                        {(teacher.teacherInfo.yearsExperience || 0) >= 5 && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                            Experienced
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      Bio
                    </label>
                    <p className="text-gray-700 leading-relaxed ">
                      "{teacher.teacherInfo.bio || "No bio available"}"
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Credentials */}
        <div className="lg:col-span-1 space-y-6">
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1 truncate">
                              {credential.name || `Certificate - ${formatDate(credential.createdAt)}`}
                            </h4>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {credential.level && (
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {credential.level}
                                </span>
                              )}
                              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Certificate
                              </span>
                            </div>
                          </div>
                          {credential.pictureUrl && (
                            <div 
                              className="w-12 h-12 rounded-lg overflow-hidden border border-blue-200 flex-shrink-0 ml-2 cursor-pointer hover:border-blue-400 transition-all"
                              onClick={() => setViewingImage({ 
                                url: getFullImageUrl(credential.pictureUrl), 
                                name: credential.name || 'Certificate' 
                              })}
                            >
                              <img 
                                src={getFullImageUrl(credential.pictureUrl)} 
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1 truncate">
                              {credential.name || `Qualification - ${formatDate(credential.createdAt)}`}
                            </h4>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {credential.level && (
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {credential.level}
                                </span>
                              )}
                              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Qualification
                              </span>
                            </div>
                          </div>
                          {credential.pictureUrl && (
                            <div 
                              className="w-12 h-12 rounded-lg overflow-hidden border border-green-200 flex-shrink-0 ml-2 cursor-pointer hover:border-green-400 transition-all"
                              onClick={() => setViewingImage({ 
                                url: getFullImageUrl(credential.pictureUrl), 
                                name: credential.name || 'Qualification' 
                              })}
                            >
                              <img 
                                src={getFullImageUrl(credential.pictureUrl)} 
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

      {/* Second Row - Teaching Courses (Full Width) */}
      <div className="mb-8">
        <Card title="Teaching Courses">
          {coursesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table
                columns={courseColumns}
                data={teachingCourses}
                emptyState={
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No courses assigned</p>
                  </div>
                }
              />
            </div>
          )}
        </Card>
      </div>

      {/* Third Row - Teaching Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Teaching Summary */}
        <Card title="Teaching Summary" className="h-fit">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium mb-1">Total Students</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {teachingCourses.reduce((total, course) => total + (course.studentCount || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium mb-1">Total Courses</p>
                    <p className="text-2xl font-bold text-purple-700">{teachingCourses.length}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium mb-1">Active Courses</p>
                    <p className="text-2xl font-bold text-green-700">{teachingCourses.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-medium mb-1">Avg Students</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {teachingCourses.length > 0 
                        ? Math.round(teachingCourses.reduce((total, course) => total + (course.studentCount || 0), 0) / teachingCourses.length)
                        : 0
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-indigo-900 mb-2">Teaching Overview</h4>
                  <p className="text-sm text-indigo-700 leading-relaxed">
                    {teachingCourses.length > 0 
                      ? `Currently teaching ${teachingCourses.length} course${teachingCourses.length > 1 ? 's' : ''} with a total of ${teachingCourses.reduce((total, course) => total + (course.studentCount || 0), 0)} students across different levels and categories.`
                      : 'No courses assigned yet. Ready to take on new teaching assignments.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <DeleteConfirmDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        onConfirm={confirmBanTeacher}
        title={((teacher as any)?.isDeleted || teacher.statusName === 'Blocked' || teacher.statusName === 'Locked') ? "Unban Teacher" : "Ban Teacher"}
        message={((teacher as any)?.isDeleted || teacher.statusName === 'Blocked' || teacher.statusName === 'Locked')
          ? `Are you sure you want to unban "${teacher.fullName}"? This will reactivate their account.`
          : `Are you sure you want to ban "${teacher.fullName}"? This will deactivate their account.`}
      />

      {/* Image View Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImage(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">{viewingImage.name}</h3>
              <button
                onClick={() => setViewingImage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 bg-gray-50">
              <img 
                src={viewingImage.url} 
                alt={viewingImage.name}
                className="w-full h-auto rounded-lg shadow-lg bg-white object-contain max-h-[70vh] mx-auto"
                onError={(e) => {
                  console.error('Modal image load error:', viewingImage.url);
                  e.currentTarget.src = '';
                  e.currentTarget.alt = 'Failed to load image';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

