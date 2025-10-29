import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PackagesList from "./components/PackagesList";
import Button from "@/components/ui/Button";
import { Package as PackageIcon, DollarSign, TrendingUp, Award, Download, BarChart3, AlertCircle, Loader2, ShoppingCart } from "lucide-react";
import { getPackagesList, getPackageStatistics } from "@/api/package.api";
import type { Package } from "@/types/package.types";

export default function StaffPackagesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    totalPackages: 0,
    activePackages: 0,
    totalRevenue: 0,
    packagesSold: 0,
    monthlyGrowth: 0,
    weeklyGrowth: 0
  });

  const handleExportData = () => {
    const dataToExport = packages.map(pkg => ({
      'Package Name': pkg.name || 'N/A',
      'Package Code': pkg.packageCode || 'N/A',
      'Description': pkg.description || 'N/A',
      'Total Price': pkg.totalPrice || 0,
      'Total Individual Price': pkg.totalIndividualPrice || 0,
      'Category': pkg.categoryName || 'Uncategorized',
      'Status': pkg.isActive ? 'Active' : 'Inactive',
      'Total Sessions': pkg.totalSessions || 0,
      'Validity Period': pkg.validityPeriod || 0,
      'Courses Count': pkg.courseNames?.length || pkg.coursesCount || pkg.courses?.length || 0,
      'Courses': pkg.courseNames?.join(', ') || 'N/A',
      'Created Date': pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString() : 'N/A'
    }));
    
    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map((row) => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'packages-list.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewAnalytics = () => {
    navigate("/staff/analytics");
  };

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch packages and statistics in parallel
        const [packagesResponse, statisticsResponse] = await Promise.all([
          getPackagesList(),
          getPackageStatistics()
        ]);
        
        const packagesData: Package[] = packagesResponse.data.value || packagesResponse.data || [];
        setPackages(packagesData);
        
        // Use statistics from backend
        const statsData = statisticsResponse.data;
        setStats({
          totalPackages: statsData.totalPackages,
          activePackages: statsData.activePackages,
          totalRevenue: statsData.totalRevenue,
          packagesSold: statsData.packagesSold,
          monthlyGrowth: 0, // TODO: Add to backend when available
          weeklyGrowth: 0 // TODO: Add to backend when available
        });
      } catch (err: any) {
        console.error("Error fetching packages:", err);
        setError(err.response?.data?.message || "Failed to load package statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-trigger fetch by changing a dependency
    window.location.reload();
  };

  const breadcrumbItems = [
    { label: "Packages" }
  ];

  // Format Vietnamese currency
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title="Package Management"
        description="Manage and organize your course packages with comprehensive tools"
        icon={<PackageIcon className="w-5 h-5 text-white" />}
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
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <PackageIcon className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Total Packages</p>
                <p className="text-3xl font-bold text-purple-900 group-hover:text-purple-600 transition-colors">
                  {loading ? "..." : stats.totalPackages}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {loading ? "Loading..." : "All packages"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <Award className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Active Packages</p>
                <p className="text-3xl font-bold text-green-900 group-hover:text-green-600 transition-colors">
                  {loading ? "..." : stats.activePackages}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {loading ? "Loading..." : `${Math.round((stats.activePackages / stats.totalPackages) * 100)}% of total`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <TrendingUp className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-amber-700">Total Revenue</p>
                <p className="text-3xl font-bold text-amber-900 group-hover:text-amber-600 transition-colors">
                  {loading ? "..." : formatVND(stats.totalRevenue)}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {loading ? "Loading..." : "From packages sold"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                {loading ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <ShoppingCart className="w-7 h-7 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Packages Sold</p>
                <p className="text-3xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                  {loading ? "..." : stats.packagesSold}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {loading ? "Loading..." : "Total enrollments"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Packages List Component */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <PackagesList 
          packages={packages}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}