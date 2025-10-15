
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import CoursesList from "./components/courses_list";
import Button from "@/components/ui/Button";
import { BookOpen, Users, Clock, Award, Download, BarChart3, AlertCircle, Loader2 } from "lucide-react";
import { getCoursesList } from "@/api/course.api";
import type { Course } from "@/types/course.types";

export default function StaffCoursesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    avgDuration: "0 slots",
    enrolledStudents: 0,
    monthlyGrowth: 0,
    weeklyGrowth: 0
  });


  const handleExportData = () => {
    console.log("Export course data");
  };

  const handleViewAnalytics = () => {
    navigate("/staff/analytics");
  };

  // Fetch real data from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch courses from API
        const response = await getCoursesList();
        const coursesData: Course[] = response.data.value || response.data || [];
        setCourses(coursesData);
        
        // Calculate statistics from real data
        const totalCourses = coursesData.length;
        const activeCourses = coursesData.filter((c: Course) => c.isActive).length;
        const enrolledStudents = coursesData.reduce((sum: number, c: Course) => sum + (c.studentsCount || 0), 0);
        
        // Calculate average duration (assuming duration is in "X slots" format)
        const totalSlots = coursesData.reduce((sum: number, c: Course) => {
          const match = c.duration?.match(/(\d+)/);
          return sum + (match ? parseInt(match[1]) : 0);
        }, 0);
        const avgSlots = totalCourses > 0 ? Math.round(totalSlots / totalCourses) : 0;
        
        setStats({
          totalCourses,
          activeCourses,
          avgDuration: `${avgSlots} slots`,
          enrolledStudents,
          monthlyGrowth: 0, // You can calculate this if you have date info
          weeklyGrowth: 0 // You can calculate this if you have date info
        });
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError(err.response?.data?.message || "Failed to load course statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-trigger fetch by changing a dependency
    window.location.reload();
  };

  const breadcrumbItems = [
    { label: "Courses" }
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title="Course Management"
        description="Manage and organize your educational courses with comprehensive tools"
        icon={<BookOpen className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'View Analytics',
            variant: 'secondary',
            icon: <BarChart3 className="w-4 h-4" />,
            onClick: handleViewAnalytics
          },
          {
            type: 'button',
            label: 'Export Data',
            variant: 'secondary',
            icon: <Download className="w-4 h-4" />,
            onClick: handleExportData
          }
        ]}
      />

      {/* Enhanced Stats Cards */}
      {error ? (
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900">Error Loading Statistics</h3>
              <p className="text-red-700">{error}</p>
            </div>
            <Button variant="secondary" onClick={handleRetry} className="text-red-600 border-red-300 hover:bg-red-100">
              Try Again
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <BookOpen className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Courses</p>
                <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                  {loading ? "..." : stats.totalCourses}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {loading ? "Loading..." : "All courses"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Users className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Active Courses</p>
                <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                  {loading ? "..." : stats.activeCourses}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {loading ? "Loading..." : `${Math.round((stats.activeCourses / stats.totalCourses) * 100)}% of total`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Clock className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700">Avg Duration</p>
                <p className="text-3xl font-bold text-amber-900 group-hover:text-amber-600 transition-colors">
                  {loading ? "..." : stats.avgDuration}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {loading ? "Loading..." : "Standard length"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Award className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Enrolled Students</p>
                <p className="text-3xl font-bold text-purple-900 group-hover:text-purple-600 transition-colors">
                  {loading ? "..." : stats.enrolledStudents}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {loading ? "Loading..." : "Total enrolled"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

     

      {/* Courses List Component */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <CoursesList />
      </div>
    </div>
  );
}
