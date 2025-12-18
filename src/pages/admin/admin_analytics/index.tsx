import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  BookOpen, 
  RefreshCw,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import RevenueChart from '@/components/dashboard/RevenueChart';
import TopCoursesCard from '@/components/dashboard/TopCoursesCard';
import DropoutAnalysisCard from '@/components/dashboard/DropoutAnalysisCard';
import EnrollmentAnalysisCard from '@/components/dashboard/EnrollmentAnalysisCard';
import AIRecommendationsCard from '@/components/dashboard/AIRecommendationsCard';
import { ExitSurveyReasonCard } from '@/components/dashboard/ExitSurveyReasonCard';
import { 
  getRevenueAnalytics, 
  getTopEnrolledCourses, 
  getStudentDropoutAnalytics,
  getEnrollmentAnalytics,
  getAIRecommendations
} from '@/api/admin-dashboard.api';
import type { 
  RevenueAnalytics,
  CourseEnrollmentStats,
  StudentDropoutAnalytics,
  StudentEnrollmentAnalytics,
  AIAnalysisResponse
} from '@/api/admin-dashboard.api';
import { getExitSurveyAnalytics } from '@/api/exitSurvey.api';
import type { ExitSurveyAnalyticsResponse } from '@/api/exitSurvey.api';
import { getAdminAnalytics } from '@/api/analytics.api';
import type { AnalyticsResponse } from '@/api/analytics.api';

type PeriodView = 'monthly' | 'quarterly' | 'yearly';
type ChartType = 'bar' | 'line' | 'candlestick';
type AnalysisTab = 'dropout' | 'enrollment';

export default function AdminAnalytics() {
  const [periodView, setPeriodView] = useState<PeriodView>('monthly');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [analysisTab, setAnalysisTab] = useState<AnalysisTab>('dropout');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Handle tab switching (does NOT trigger API calls)
  const handleTabChange = (tab: AnalysisTab) => {
    console.log(`[Dashboard] Switching to ${tab} tab (no API call)`);
    setAnalysisTab(tab);
  };

  // Data states
  const [revenueData, setRevenueData] = useState<RevenueAnalytics>({
    monthly: [],
    quarterly: [],
    yearly: [],
    currentMonth: 0,
    currentQuarter: 0,
    currentYear: 0,
    projectedNextMonth: 0,
  });
  
  const [topCourses, setTopCourses] = useState<CourseEnrollmentStats>({
    topCourses: [],
    totalCourses: 0,
    totalEnrollments: 0,
    averageEnrollmentPerCourse: 0,
  });
  
  const [dropoutData, setDropoutData] = useState<StudentDropoutAnalytics>({
    overallDropoutRate: 0,
    dropoutTrend: [],
    topReasons: [],
    demographicAnalysis: [],
    dropoutByClass: [],
    highRiskStudents: 0,
    averageTimeToDropout: 0,
    recommendations: [],
  });
  
  const [enrollmentData, setEnrollmentData] = useState<StudentEnrollmentAnalytics>({
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    droppedEnrollments: 0,
    monthOverMonthGrowth: 0,
    quarterOverQuarterGrowth: 0,
    monthlyTrend: [],
    quarterlyTrend: [],
    topGrowingCourses: [],
    enrollmentByClass: [],
    insights: [],
  });
  
  const [exitSurveyData, setExitSurveyData] = useState<ExitSurveyAnalyticsResponse>({
    totalSurveys: 0,
    reasonCategoryStatistics: {},
    averageFeedbackRatings: {},
    surveysThisMonth: 0,
    surveysThisYear: 0,
  });
  
  const [aiRecommendations, setAiRecommendations] = useState<AIAnalysisResponse>({
    recommendations: [],
    summary: '',
    keyInsights: [],
    riskFactors: [],
    opportunities: [],
    generatedAt: new Date().toISOString(),
  });
  
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  // Load initial data only once when component mounts
  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array = only run once on mount

  // Main function to load all dashboard data
  // Only called: 1) On page load, 2) When user clicks Refresh button
  const loadDashboardData = async () => {
    console.log('[Dashboard] Loading data...');
    setLoading(true);
    try {
      // Fetch real data from backend (excluding AI recommendations)
      const [analyticsRes, revenueRes, coursesRes, dropoutRes, enrollmentRes, exitSurveyRes] = await Promise.allSettled([
        getAdminAnalytics(),
        getRevenueAnalytics(),
        getTopEnrolledCourses({ topN: 10 }),
        getStudentDropoutAnalytics({ 
          includeDemographics: true, 
          includeRecommendations: true 
        }),
        getEnrollmentAnalytics(),
        getExitSurveyAnalytics(),
      ]);

      // Update analytics if successful
      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value);
      }

      // Update revenue data
      if (revenueRes.status === 'fulfilled') {
        setRevenueData(revenueRes.value);
      } else {
        console.error('Failed to load revenue data:', revenueRes.reason);
      }

      // Update top courses
      if (coursesRes.status === 'fulfilled') {
        setTopCourses(coursesRes.value);
      } else {
        console.error('Failed to load courses data:', coursesRes.reason);
      }

      // Update dropout data
      if (dropoutRes.status === 'fulfilled') {
        setDropoutData(dropoutRes.value);
      } else {
        console.error('Failed to load dropout data:', dropoutRes.reason);
      }

      // Update enrollment data
      if (enrollmentRes.status === 'fulfilled') {
        setEnrollmentData(enrollmentRes.value);
      } else {
        console.error('Failed to load enrollment data:', enrollmentRes.reason);
      }

      // Update exit survey data
      if (exitSurveyRes.status === 'fulfilled') {
        setExitSurveyData(exitSurveyRes.value);
      } else {
        console.error('Failed to load exit survey data:', exitSurveyRes.reason);
      }

      setLastUpdated(new Date());
      console.log('[Dashboard] Data loaded successfully');
    } catch (error) {
      console.error('[Dashboard] Error loading data:', error);
    } finally {
      setLoading(false);
      // Load AI recommendations after dashboard is shown
      loadAIRecommendations();
    }
  };

  const loadAIRecommendations = async () => {
    setAiLoading(true);
    try {
      const aiResponse = await getAIRecommendations({
        focusAreas: ['revenue', 'retention', 'enrollment'],
        timeframe: 'last_6_months',
        includeRiskAnalysis: true,
        includeOpportunities: true,
      });
      
      setAiRecommendations(aiResponse);
      console.log('AI recommendations loaded successfully');
    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRefreshAI = async () => {
    setAiLoading(true);
    try {
      // Call backend API with proper request format
      const aiResponse = await getAIRecommendations({
        focusAreas: ['revenue', 'retention', 'enrollment'],
        timeframe: 'last_6_months',
        includeRiskAnalysis: true,
        includeOpportunities: true,
      });
      
      setAiRecommendations(aiResponse);
      setLastUpdated(new Date());
      console.log('AI recommendations refreshed successfully');
    } catch (error) {
      console.error('Error refreshing AI recommendations:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getRevenueDataForPeriod = () => {
    switch (periodView) {
      case 'monthly':
        return revenueData.monthly;
      case 'quarterly':
        return revenueData.quarterly;
      case 'yearly':
        return revenueData.yearly;
      default:
        return revenueData.monthly;
    }
  };

  const getChartTitle = () => {
    const periodName = periodView === 'monthly' ? 'Month' : periodView === 'quarterly' ? 'Quarter' : 'Year';
    return `Revenue by ${periodName}`;
  };

  const breadcrumbItems = [{ label: "Analytics Dashboard" }];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <PageHeader
            title="Analytics Dashboard"
            description="Comprehensive analytics with AI-powered insights"
            icon={<BarChart3 className="w-5 h-5 text-white" />}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadDashboardData()}
            disabled={loading}
            iconLeft={<RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Data
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(revenueData.currentMonth)}
                </p>
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +3.8% vs last month
                </p>
          </div>
              <div className="p-3 rounded-lg bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          </div>
        </Card>

          <Card className="p-6 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center justify-between">
                    <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{topCourses.totalCourses}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {topCourses.totalEnrollments} enrollments
                      </p>
                    </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
          </div>
              </Card>

          <Card className="p-6 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-gray-600">Dropout Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {dropoutData.overallDropoutRate.toFixed(1)}%
                </p>
                <p className="text-sm text-yellow-600 mt-2">
                  {dropoutData.highRiskStudents} high-risk students
                </p>
                  </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Activity className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </Card>

          <Card className="p-6 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center justify-between">
                  <div>
                <p className="text-sm font-medium text-gray-600">Total Enrollment</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {enrollmentData.totalEnrollments}
                </p>
                <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Growth: {enrollmentData.monthOverMonthGrowth > 0 ? '+' : ''}{enrollmentData.monthOverMonthGrowth.toFixed(1)}%
                </p>
                  </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>

        {/* Revenue Chart Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Revenue Analysis</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={periodView}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPeriodView(e.target.value as PeriodView)}
              options={[
                { value: 'monthly', label: 'Last 6 months' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
            />
          </div>
        </div>

        {/* Revenue Chart */}
        <RevenueChart
          data={getRevenueDataForPeriod()}
          chartType={chartType}
          title={getChartTitle()}
        />

        {/* Top Courses Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Most Popular Courses</h2>
          <TopCoursesCard courses={topCourses.topCourses} loading={loading} />
        </div>

        {/* Student Analysis Row: Dropout + Enrollment Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dropout Chart */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Student Dropout Analysis</h2>
            </div>
            <DropoutAnalysisCard
              overallDropoutRate={dropoutData.overallDropoutRate}
              dropoutTrend={dropoutData.dropoutTrend}
              dropoutByClass={dropoutData.dropoutByClass}
              averageTimeToDropout={dropoutData.averageTimeToDropout}
              recommendations={dropoutData.recommendations}
              loading={loading}
            />
          </div>

          {/* Enrollment Chart */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Student Enrollment</h2>
              
            </div>
            <EnrollmentAnalysisCard
              totalEnrollments={enrollmentData.totalEnrollments}
              activeEnrollments={enrollmentData.activeEnrollments}
              completedEnrollments={enrollmentData.completedEnrollments}
              monthOverMonthGrowth={enrollmentData.monthOverMonthGrowth}
              monthlyTrend={enrollmentData.monthlyTrend}
              topGrowingCourses={enrollmentData.topGrowingCourses}
              enrollmentByClass={enrollmentData.enrollmentByClass}
              insights={enrollmentData.insights}
              loading={loading}
            />
          </div>
        </div>
              
        {/* Exit Survey Analytics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Exit Survey Analysis</h2>
          <ExitSurveyReasonCard data={exitSurveyData} />
        </div>

        {/* AI Recommendations Section */}
        <div>
          <AIRecommendationsCard
            recommendations={aiRecommendations.recommendations}
            summary={aiRecommendations.summary}
            keyInsights={aiRecommendations.keyInsights}
            riskFactors={aiRecommendations.riskFactors}
            opportunities={aiRecommendations.opportunities}
            loading={aiLoading}
            onRefresh={handleRefreshAI}
                              />
                            </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2 pb-8">
          <Calendar className="w-4 h-4" />
          Last updated: {lastUpdated.toLocaleString('en-US')}
                          </div>
      </div>
    </div>
  );
}
