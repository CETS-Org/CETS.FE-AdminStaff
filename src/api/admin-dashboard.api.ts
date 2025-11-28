import { api } from './api';

// Revenue Analytics Interfaces
export interface RevenueByPeriod {
  period: string; // "2024-01", "Q1-2024", "2024"
  revenue: number;
  growth: number;
  transactionCount: number;
}

export interface RevenueAnalytics {
  monthly: RevenueByPeriod[];
  quarterly: RevenueByPeriod[];
  yearly: RevenueByPeriod[];
  currentMonth: number;
  currentQuarter: number;
  currentYear: number;
  projectedNextMonth: number;
}

// Course Enrollment Interfaces
export interface TopCourse {
  courseId: string;
  courseName: string;
  courseCode: string;
  category: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number;
  averageRating: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
  growthRate: number;
}

export interface CourseEnrollmentStats {
  topCourses: TopCourse[];
  totalCourses: number;
  totalEnrollments: number;
  averageEnrollmentPerCourse: number;
}

// Student Dropout Analytics Interfaces
export interface DropoutPattern {
  period: string;
  totalStudents: number;
  droppedOut: number;
  dropoutRate: number;
  retentionRate: number;
}

export interface DropoutReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface DropoutDemographic {
  ageGroup: string;
  courseType: string;
  enrollmentDuration: string;
  dropoutCount: number;
  totalStudents: number;
  dropoutRate: number;
}

export interface DropoutByClass {
  classId: string;
  className: string;
  courseName: string;
  totalStudents: number;
  droppedOut: number;
  dropoutRate: number;
  startDate: string;
  status: string;
}

export interface StudentDropoutAnalytics {
  overallDropoutRate: number;
  dropoutTrend: DropoutPattern[];
  topReasons: DropoutReason[];
  demographicAnalysis: DropoutDemographic[];
  dropoutByClass: DropoutByClass[];
  highRiskStudents: number;
  averageTimeToDropout: number; // in days
  recommendations: string[];
}

// Enrollment Analytics Interfaces
export interface EnrollmentTrendPoint {
  period: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  growthRate: number;
}

export interface EnrollmentByCourse {
  courseId: string;
  courseName: string;
  courseCode: string;
  category: string;
  totalEnrollments: number;
  activeEnrollments: number;
  growthRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface EnrollmentByClass {
  classId: string;
  className: string;
  courseName: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  startDate: string;
  status: string;
}

export interface StudentEnrollmentAnalytics {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  monthOverMonthGrowth: number;
  quarterOverQuarterGrowth: number;
  monthlyTrend: EnrollmentTrendPoint[];
  quarterlyTrend: EnrollmentTrendPoint[];
  topGrowingCourses: EnrollmentByCourse[];
  enrollmentByClass: EnrollmentByClass[];
  insights: string[];
}

// AI Recommendation Interfaces
export interface AIRecommendation {
  id: string;
  category: 'revenue' | 'enrollment' | 'retention' | 'operations' | 'marketing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  actionItems: string[];
  estimatedImpact: {
    revenue?: number;
    enrollments?: number;
    retention?: number;
  };
  confidence: number; // 0-100
  generatedAt: string;
}

export interface AIAnalysisRequest {
  dataContext: {
    revenue?: RevenueAnalytics;
    enrollments?: CourseEnrollmentStats;
    dropout?: StudentDropoutAnalytics;
    analytics?: any;
  };
  focusAreas?: string[];
  timeframe?: string;
}

export interface AIAnalysisResponse {
  recommendations: AIRecommendation[];
  summary: string;
  keyInsights: string[];
  riskFactors: string[];
  opportunities: string[];
  generatedAt: string;
}

// API Request Types
export interface TopCoursesRequest {
  topN?: number;
  categoryFilter?: string;
  sortBy?: string;
  fromDate?: string;
  toDate?: string;
}

export interface DropoutAnalysisRequest {
  fromDate?: string;
  toDate?: string;
  ageGroupFilter?: string;
  courseTypeFilter?: string;
  includeDemographics?: boolean;
  includeRecommendations?: boolean;
}

export interface AIRecommendationRequest {
  focusAreas: string[];
  timeframe: string;
  includeRiskAnalysis?: boolean;
  includeOpportunities?: boolean;
}

// API Functions

/**
 * Get revenue analytics by period
 */
export const getRevenueAnalytics = async (): Promise<RevenueAnalytics> => {
  try {
    const response = await api.get<RevenueAnalytics>('/api/AdminAnalystic/revenue');
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    throw error;
  }
};

/**
 * Get top enrolled courses
 */
export const getTopEnrolledCourses = async (
  request?: TopCoursesRequest
): Promise<CourseEnrollmentStats> => {
  try {
    const params = {
      topN: request?.topN || 10,
      categoryFilter: request?.categoryFilter,
      sortBy: request?.sortBy || 'enrollments',
      fromDate: request?.fromDate,
      toDate: request?.toDate
    };
    
    const response = await api.get<CourseEnrollmentStats>('/api/AdminAnalystic/top-courses', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top enrolled courses:', error);
    throw error;
  }
};

/**
 * Get student dropout analytics
 */
export const getStudentDropoutAnalytics = async (
  request?: DropoutAnalysisRequest
): Promise<StudentDropoutAnalytics> => {
  try {
    const params = {
      fromDate: request?.fromDate,
      toDate: request?.toDate,
      ageGroupFilter: request?.ageGroupFilter,
      courseTypeFilter: request?.courseTypeFilter,
      includeDemographics: request?.includeDemographics !== false,
      includeRecommendations: request?.includeRecommendations !== false
    };
    
    const response = await api.get<StudentDropoutAnalytics>('/api/AdminAnalystic/dropout-analysis', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dropout analytics:', error);
    throw error;
  }
};

/**
 * Get student enrollment analytics
 */
export const getEnrollmentAnalytics = async (): Promise<StudentEnrollmentAnalytics> => {
  try {
    const response = await api.get<StudentEnrollmentAnalytics>('/api/AdminAnalystic/enrollment-analysis');
    return response.data;
  } catch (error) {
    console.error('Error fetching enrollment analytics:', error);
    throw error;
  }
};

/**
 * Get AI-powered recommendations
 */
export const getAIRecommendations = async (
  request: AIRecommendationRequest
): Promise<AIAnalysisResponse> => {
  try {
    const response = await api.post<AIAnalysisResponse>('/api/AdminAnalystic/ai-recommendations', request);
    return response.data;
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    throw error;
  }
};

/**
 * Get complete dashboard data in one call
 */
export const getCompleteDashboardData = async (
  aiRequest?: AIRecommendationRequest
): Promise<{
  revenue: RevenueAnalytics;
  topCourses: CourseEnrollmentStats;
  dropout: StudentDropoutAnalytics;
  aiRecommendations?: AIAnalysisResponse;
}> => {
  try {
    const response = await api.post('/api/AdminAnalystic/complete', aiRequest);
    return response.data;
  } catch (error) {
    console.error('Error fetching complete dashboard data:', error);
    throw error;
  }
};

/**
 * Get dashboard summary
 */
export const getDashboardSummary = async (): Promise<{
  totalRevenue: number;
  revenueGrowth: number;
  totalStudents: number;
  activeEnrollments: number;
  dropoutRate: number;
  averageCourseRating: number;
  topPerformingCourse: string;
  totalCourses: number;
}> => {
  try {
    const response = await api.get('/api/AdminAnalystic/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

/**
 * Get comprehensive dashboard data (deprecated - use getCompleteDashboardData)
 */
export const getDashboardData = async () => {
  try {
    const [revenue, topCourses, dropout] = await Promise.all([
      getRevenueAnalytics(),
      getTopEnrolledCourses(),
      getStudentDropoutAnalytics()
    ]);

    return {
      revenue,
      topCourses,
      dropout
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

export default {
  getRevenueAnalytics,
  getTopEnrolledCourses,
  getStudentDropoutAnalytics,
  getEnrollmentAnalytics,
  getAIRecommendations,
  getDashboardData,
  getCompleteDashboardData,
  getDashboardSummary
};


