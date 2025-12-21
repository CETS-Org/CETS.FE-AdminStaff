import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  BookOpen, 
  RefreshCw,
  Calendar,
  BarChart3,
  Activity,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
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
    dropoutByCourse: [],
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
    enrollmentByCourse: [],
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

  const handleExportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = [
        { Metric: 'Monthly Revenue', Value: formatCurrency(revenueData.currentMonth) },
        { Metric: 'Quarterly Revenue', Value: formatCurrency(revenueData.currentQuarter) },
        { Metric: 'Yearly Revenue', Value: formatCurrency(revenueData.currentYear) },
        { Metric: 'Projected Next Month', Value: formatCurrency(revenueData.projectedNextMonth) },
        { Metric: 'Total Courses', Value: topCourses.totalCourses },
        { Metric: 'Total Enrollments', Value: topCourses.totalEnrollments },
        { Metric: 'Average Enrollment Per Course', Value: topCourses.averageEnrollmentPerCourse.toFixed(2) },
        { Metric: 'Overall Dropout Rate', Value: `${dropoutData.overallDropoutRate.toFixed(2)}%` },
        { Metric: 'High Risk Students', Value: dropoutData.highRiskStudents },
        { Metric: 'Average Time to Dropout (days)', Value: dropoutData.averageTimeToDropout.toFixed(1) },
        { Metric: 'Total Enrollments', Value: enrollmentData.totalEnrollments },
        { Metric: 'Active Enrollments', Value: enrollmentData.activeEnrollments },
        { Metric: 'Completed Enrollments', Value: enrollmentData.completedEnrollments },
        { Metric: 'Dropped Enrollments', Value: enrollmentData.droppedEnrollments },
        { Metric: 'Month Over Month Growth', Value: `${enrollmentData.monthOverMonthGrowth > 0 ? '+' : ''}${enrollmentData.monthOverMonthGrowth.toFixed(2)}%` },
        { Metric: 'Quarter Over Quarter Growth', Value: `${enrollmentData.quarterOverQuarterGrowth > 0 ? '+' : ''}${enrollmentData.quarterOverQuarterGrowth.toFixed(2)}%` },
        { Metric: 'Total Exit Surveys', Value: exitSurveyData.totalSurveys },
        { Metric: 'Surveys This Month', Value: exitSurveyData.surveysThisMonth },
        { Metric: 'Surveys This Year', Value: exitSurveyData.surveysThisYear },
        { Metric: 'Last Updated', Value: lastUpdated.toLocaleString('en-US') },
      ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Sheet 2: Revenue Analysis
      const revenueDataExport = getRevenueDataForPeriod().map(item => ({
        Period: item.period,
        Revenue: item.revenue,
        'Revenue (VND)': formatCurrency(item.revenue),
        Growth: `${item.growth > 0 ? '+' : ''}${item.growth.toFixed(2)}%`,
        'Transaction Count': item.transactionCount,
      }));
      const revenueSheet = XLSX.utils.json_to_sheet(revenueDataExport);
      XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue Analysis');

      // Sheet 3: Top Courses
      const topCoursesData = topCourses.topCourses.map(course => ({
        'Course Name': course.courseName,
        'Course Code': course.courseCode,
        Category: course.category,
        'Total Enrollments': course.totalEnrollments,
        'Active Enrollments': course.activeEnrollments,
        'Completion Rate': `${course.completionRate.toFixed(2)}%`,
        'Average Rating': course.averageRating.toFixed(2),
        Revenue: course.revenue,
        'Revenue (VND)': formatCurrency(course.revenue),
        Trend: course.trend,
        'Growth Rate': `${course.growthRate > 0 ? '+' : ''}${course.growthRate.toFixed(2)}%`,
      }));
      const topCoursesSheet = XLSX.utils.json_to_sheet(topCoursesData);
      XLSX.utils.book_append_sheet(workbook, topCoursesSheet, 'Top Courses');

      // Sheet 4: Dropout Analysis
      const dropoutTrendData = dropoutData.dropoutTrend.map(item => ({
        Period: item.period,
        'Total Students': item.totalStudents,
        'Dropped Out': item.droppedOut,
        'Dropout Rate': `${item.dropoutRate.toFixed(2)}%`,
        'Retention Rate': `${item.retentionRate.toFixed(2)}%`,
      }));
      const dropoutTrendSheet = XLSX.utils.json_to_sheet(dropoutTrendData);
      XLSX.utils.book_append_sheet(workbook, dropoutTrendSheet, 'Dropout Trend');

      // Dropout Reasons
      const dropoutReasonsData = dropoutData.topReasons.map(reason => ({
        Reason: reason.reason,
        Count: reason.count,
        Percentage: `${reason.percentage.toFixed(2)}%`,
      }));
      const dropoutReasonsSheet = XLSX.utils.json_to_sheet(dropoutReasonsData);
      XLSX.utils.book_append_sheet(workbook, dropoutReasonsSheet, 'Dropout Reasons');

      // Dropout by Course (from API)
      const dropoutByCourseData = (dropoutData.dropoutByCourse || []).map(course => ({
        'Course Name': course.courseName,
        'Course Code': course.courseCode || 'N/A',
        'Total Students': course.totalStudents,
        'Dropped Out': course.droppedOut,
        'Dropout Rate': `${course.dropoutRate.toFixed(2)}%`,
        'Number of Classes': course.numberOfClasses,
      }));

      const dropoutByCourseSheet = XLSX.utils.json_to_sheet(dropoutByCourseData);
      XLSX.utils.book_append_sheet(workbook, dropoutByCourseSheet, 'Dropout by Course');

      // Dropout Recommendations
      const dropoutRecommendationsData = dropoutData.recommendations.map((rec, index) => ({
        '#': index + 1,
        Recommendation: rec,
      }));
      const dropoutRecommendationsSheet = XLSX.utils.json_to_sheet(dropoutRecommendationsData);
      XLSX.utils.book_append_sheet(workbook, dropoutRecommendationsSheet, 'Dropout Recommendations');

      // Sheet 5: Enrollment Analysis
      const enrollmentTrendData = enrollmentData.monthlyTrend.map(item => ({
        Period: item.period,
        'Total Enrollments': item.totalEnrollments,
        'Active Enrollments': item.activeEnrollments,
        'Completed Enrollments': item.completedEnrollments,
        'Dropped Enrollments': item.droppedEnrollments,
        'Growth Rate': `${item.growthRate > 0 ? '+' : ''}${item.growthRate.toFixed(2)}%`,
      }));
      const enrollmentTrendSheet = XLSX.utils.json_to_sheet(enrollmentTrendData);
      XLSX.utils.book_append_sheet(workbook, enrollmentTrendSheet, 'Enrollment Trend');

      // Top Growing Courses
      const topGrowingCoursesData = enrollmentData.topGrowingCourses.map(course => ({
        'Course Name': course.courseName,
        'Course Code': course.courseCode,
        Category: course.category,
        'Total Enrollments': course.totalEnrollments,
        'Active Enrollments': course.activeEnrollments,
        'Growth Rate': `${course.growthRate > 0 ? '+' : ''}${course.growthRate.toFixed(2)}%`,
        Trend: course.trend,
      }));
      const topGrowingCoursesSheet = XLSX.utils.json_to_sheet(topGrowingCoursesData);
      XLSX.utils.book_append_sheet(workbook, topGrowingCoursesSheet, 'Top Growing Courses');

      // Enrollment by Course (from API)
      const enrollmentByCourseData = (enrollmentData.enrollmentByCourse || []).map(course => ({
        'Course Name': course.courseName,
        'Course Code': course.courseCode || 'N/A',
        'Total Enrollments': course.totalEnrollments,
        'Active Enrollments': course.activeEnrollments,
        'Completed Enrollments': course.completedEnrollments,
        'Dropped Enrollments': course.droppedEnrollments,
        'Number of Classes': course.numberOfClasses,
      }));

      const enrollmentByCourseSheet = XLSX.utils.json_to_sheet(enrollmentByCourseData);
      XLSX.utils.book_append_sheet(workbook, enrollmentByCourseSheet, 'Enrollment by Course');

      // Enrollment Insights
      const enrollmentInsightsData = enrollmentData.insights.map((insight, index) => ({
        '#': index + 1,
        Insight: insight,
      }));
      const enrollmentInsightsSheet = XLSX.utils.json_to_sheet(enrollmentInsightsData);
      XLSX.utils.book_append_sheet(workbook, enrollmentInsightsSheet, 'Enrollment Insights');

      // Sheet 6: Exit Survey Analysis
      const exitSurveySummaryData = [
        { Metric: 'Total Surveys', Value: exitSurveyData.totalSurveys },
        { Metric: 'Surveys This Month', Value: exitSurveyData.surveysThisMonth },
        { Metric: 'Surveys This Year', Value: exitSurveyData.surveysThisYear },
      ];
      const exitSurveySummarySheet = XLSX.utils.json_to_sheet(exitSurveySummaryData);
      XLSX.utils.book_append_sheet(workbook, exitSurveySummarySheet, 'Exit Survey Summary');

      // Reason Category Statistics
      const reasonCategoryData = Object.entries(exitSurveyData.reasonCategoryStatistics).map(([category, count]) => ({
        'Reason Category': category,
        Count: count,
        Percentage: exitSurveyData.totalSurveys > 0 
          ? `${((count / exitSurveyData.totalSurveys) * 100).toFixed(2)}%`
          : '0%',
      }));
      const reasonCategorySheet = XLSX.utils.json_to_sheet(reasonCategoryData);
      XLSX.utils.book_append_sheet(workbook, reasonCategorySheet, 'Reason Categories');

      // Average Feedback Ratings
      const feedbackRatingsData = Object.entries(exitSurveyData.averageFeedbackRatings).map(([category, rating]) => ({
        Category: category,
        'Average Rating': rating.toFixed(2),
      }));
      const feedbackRatingsSheet = XLSX.utils.json_to_sheet(feedbackRatingsData);
      XLSX.utils.book_append_sheet(workbook, feedbackRatingsSheet, 'Feedback Ratings');

      // Sheet 7: AI Recommendations
      const aiRecommendationsData = aiRecommendations.recommendations.map(rec => ({
        Category: rec.category,
        Priority: rec.priority,
        Title: rec.title,
        Description: rec.description,
        Impact: rec.impact,
        'Action Items': rec.actionItems.join('; '),
        'Estimated Revenue Impact': rec.estimatedImpact.revenue ? formatCurrency(rec.estimatedImpact.revenue) : 'N/A',
        'Estimated Enrollment Impact': rec.estimatedImpact.enrollments || 'N/A',
        'Estimated Retention Impact': rec.estimatedImpact.retention ? `${rec.estimatedImpact.retention}%` : 'N/A',
        Confidence: `${rec.confidence}%`,
        'Generated At': new Date(rec.generatedAt).toLocaleString('en-US'),
      }));
      const aiRecommendationsSheet = XLSX.utils.json_to_sheet(aiRecommendationsData);
      XLSX.utils.book_append_sheet(workbook, aiRecommendationsSheet, 'AI Recommendations');

      // AI Key Insights
      const aiKeyInsightsData = aiRecommendations.keyInsights.map((insight, index) => ({
        '#': index + 1,
        'Key Insight': insight,
      }));
      const aiKeyInsightsSheet = XLSX.utils.json_to_sheet(aiKeyInsightsData);
      XLSX.utils.book_append_sheet(workbook, aiKeyInsightsSheet, 'AI Key Insights');

      // AI Risk Factors
      const aiRiskFactorsData = aiRecommendations.riskFactors.map((risk, index) => ({
        '#': index + 1,
        'Risk Factor': risk,
      }));
      const aiRiskFactorsSheet = XLSX.utils.json_to_sheet(aiRiskFactorsData);
      XLSX.utils.book_append_sheet(workbook, aiRiskFactorsSheet, 'AI Risk Factors');

      // AI Opportunities
      const aiOpportunitiesData = aiRecommendations.opportunities.map((opportunity, index) => ({
        '#': index + 1,
        Opportunity: opportunity,
      }));
      const aiOpportunitiesSheet = XLSX.utils.json_to_sheet(aiOpportunitiesData);
      XLSX.utils.book_append_sheet(workbook, aiOpportunitiesSheet, 'AI Opportunities');

      // AI Summary
      const aiSummaryData = [
        { Field: 'Summary', Value: aiRecommendations.summary },
        { Field: 'Generated At', Value: new Date(aiRecommendations.generatedAt).toLocaleString('en-US') },
      ];
      const aiSummarySheet = XLSX.utils.json_to_sheet(aiSummaryData);
      XLSX.utils.book_append_sheet(workbook, aiSummarySheet, 'AI Summary');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Analytics_Report_${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export analytics data. Please try again.');
    }
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
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportToExcel}
              disabled={loading}
              iconLeft={<Download className="w-4 h-4 mr-2" />}
            >
              Export Excel
            </Button>
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
              dropoutByCourse={dropoutData.dropoutByCourse}
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
              enrollmentByCourse={enrollmentData.enrollmentByCourse}
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
