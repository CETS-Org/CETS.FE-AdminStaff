import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TeacherList from "./components/teacher_list";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Button from "@/components/ui/Button";
import { Users, GraduationCap, Clock, Award, Download, BarChart3, AlertCircle, Loader2 } from "lucide-react";
import { getTeachers } from "@/api/teacher.api";
import type { Teacher } from "@/types/teacher.type";

export default function TeacherManagement() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalTeachers: 0,
        activeTeachers: 0,
        avgExperience: 0,
        certifiedTeachers: 0,
        monthlyGrowth: 0,
        weeklyGrowth: 0
    });

    const handleExportData = () => {
        console.log("Export teacher data");
    };

    const handleViewAnalytics = () => {
        navigate("/staff/analytics");
    };

    // Calculate stats from teacher data
    const calculateStats = (teachers: Teacher[]) => {
        const totalTeachers = teachers.length;
        const activeTeachers = teachers.filter(t => t.statusName?.toLowerCase() === 'active').length;
        const teachersWithExperience = teachers.filter(t => t.teacherInfo?.yearsExperience);
        const avgExperience = teachersWithExperience.length > 0 
            ? teachersWithExperience.reduce((sum, t) => sum + (t.teacherInfo?.yearsExperience || 0), 0) / teachersWithExperience.length
            : 0;
        const certifiedTeachers = teachers.filter(t => t.teacherInfo?.teacherCredentials && t.teacherInfo.teacherCredentials.length > 0).length;

        return {
            totalTeachers,
            activeTeachers,
            avgExperience: Math.round(avgExperience * 10) / 10,
            certifiedTeachers,
            monthlyGrowth: Math.floor(Math.random() * 10) + 1, // Simulated for now
            weeklyGrowth: Math.floor(Math.random() * 5) + 1 // Simulated for now
        };
    };

    // Fetch teacher data and calculate stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const teachers = await getTeachers();
                const calculatedStats = calculateStats(teachers);
                setStats(calculatedStats);
            } catch (err) {
                setError("Failed to load teacher statistics. Please try again.");
                console.error('Error fetching teacher stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleRetry = () => {
        setError(null);
        // Re-trigger the useEffect
        const fetchStats = async () => {
            try {
                setLoading(true);
                const teachers = await getTeachers();
                const calculatedStats = calculateStats(teachers);
                setStats(calculatedStats);
            } catch (err) {
                setError("Failed to load teacher statistics. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    };

    const breadcrumbItems = [
        { label: "Teachers" }
    ];

    return (
        <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
            {/* Breadcrumbs */}
            <Breadcrumbs items={breadcrumbItems} />
            
            {/* Page Header */}
            <PageHeader
                title="Teacher Management"
                description="Manage and organize your teaching staff with comprehensive tools"
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
                                <p className="text-sm font-medium text-blue-700">Total Teachers</p>
                                <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                                    {loading ? "..." : stats.totalTeachers}
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
                                <p className="text-sm font-medium text-green-700">Active Teachers</p>
                                <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                                    {loading ? "..." : stats.activeTeachers}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    {loading ? "Loading..." : stats.totalTeachers > 0 ? `${Math.round((stats.activeTeachers / stats.totalTeachers) * 100)}% of total` : "0% of total"}
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
                                <p className="text-sm font-medium text-amber-700">Avg Experience</p>
                                <p className="text-3xl font-bold text-amber-900 group-hover:text-amber-600 transition-colors">
                                    {loading ? "..." : `${stats.avgExperience} yrs`}
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
                                <p className="text-sm font-medium text-purple-700">Certified</p>
                                <p className="text-3xl font-bold text-purple-900 group-hover:text-purple-600 transition-colors">
                                    {loading ? "..." : stats.certifiedTeachers}
                                </p>
                                <p className="text-xs text-purple-600 mt-1">
                                    {loading ? "Loading..." : "With credentials"}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Teacher List Component */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <TeacherList />
            </div>
        </div>
    );
}