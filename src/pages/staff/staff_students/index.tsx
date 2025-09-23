import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import StudentsList from "./components/students_list";
import Button from "@/components/ui/Button";
import ResetPasswordDialog from "@/components/ui/ResetPasswordDialog";
import { Users, GraduationCap, Clock, Award, Download, BarChart3, AlertCircle, Loader2 } from "lucide-react";

export default function StaffStudentsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedStudentForReset, setSelectedStudentForReset] = useState<any>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    newThisMonth: 0,
    graduated: 0,
    monthlyGrowth: 0,
    weeklyGrowth: 0
  });

  const handleExportData = () => {
    console.log("Export student data");
  };

  const handleViewAnalytics = () => {
    navigate("/staff/analytics");
  };

  const handleResetPassword = (student: any) => {
    setSelectedStudentForReset(student);
    setIsResetPasswordOpen(true);
  };

  const handleResetPasswordSubmit = async (email: string) => {
    // Simulate API call for password reset
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Here you would typically call an API endpoint
    console.log("Reset password for student:", selectedStudentForReset?.fullName, "with email:", email);
    
    // For demo purposes, we'll just simulate success
    // In real implementation, this would call something like:
    // await resetStudentPassword(selectedStudentForReset.accountId, email);
    
    setSelectedStudentForReset(null);
  };

  // Simulate data loading
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          totalStudents: 156,
          activeStudents: 142,
          newThisMonth: 23,
          graduated: 14,
          monthlyGrowth: 5,
          weeklyGrowth: 12
        });
      } catch (err) {
        setError("Failed to load student statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleRetry = () => {
    setError(null);
    // Re-trigger the useEffect
    setLoading(true);
    setTimeout(() => {
      setStats({
        totalStudents: 156,
        activeStudents: 142,
        newThisMonth: 23,
        graduated: 14,
        monthlyGrowth: 5,
        weeklyGrowth: 12
      });
      setLoading(false);
    }, 1000);
  };

  const breadcrumbItems = [
    { label: "Students" }
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title="Student Management"
        description="Manage and track your students' progress with comprehensive tools"
        icon={<Users className="w-5 h-5 text-white" />}
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
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Users className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Students</p>
                <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                  {loading ? "..." : stats.totalStudents}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {loading ? "Loading..." : `+${stats.monthlyGrowth} this month`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <GraduationCap className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Active Students</p>
                <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                  {loading ? "..." : stats.activeStudents}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {loading ? "Loading..." : `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% of total`}
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
                <p className="text-sm font-medium text-amber-700">New This Month</p>
                <p className="text-3xl font-bold text-amber-900 group-hover:text-amber-600 transition-colors">
                  {loading ? "..." : stats.newThisMonth}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {loading ? "Loading..." : `+${stats.weeklyGrowth} this week`}
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
                <p className="text-sm font-medium text-purple-700">Graduated</p>
                <p className="text-3xl font-bold text-purple-900 group-hover:text-purple-600 transition-colors">
                  {loading ? "..." : stats.graduated}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {loading ? "Loading..." : "Academic year"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Students List Component */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <StudentsList onResetPassword={handleResetPassword} />
      </div>

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={isResetPasswordOpen}
        onOpenChange={(open) => {
          setIsResetPasswordOpen(open);
          if (!open) setSelectedStudentForReset(null);
        }}
        onResetPassword={handleResetPasswordSubmit}
        title="Reset Student Password"
        description={`Send password reset instructions${selectedStudentForReset ? ` to ${selectedStudentForReset.fullName}` : ''}.`}
        defaultEmail={selectedStudentForReset?.email || ''}
      />
    </div>
  );
}
