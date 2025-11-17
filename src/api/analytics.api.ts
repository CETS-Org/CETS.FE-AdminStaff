import { api } from './api';

// Real API Response Interfaces based on actual backend
export interface CenterPerformance {
  totalRooms: number;
  activeRooms: number;
  roomOccupancyRate: number;
  averageRoomUtilization: number;
  classesOpenedThisMonth: number;
  classesClosedThisMonth: number;
  activeClassesCount: number;
  overallUtilizationRate: number;
  averageClassFillRate: number;
  operationalEfficiencyScore: number;
  totalStudentCapacity: number;
  currentEnrollmentCount: number;
  availableCapacity: number;
  capacityUtilizationRate: number;
}

export interface GrowthRetention {
  totalActiveStudents: number;
  newStudentsThisMonth: number;
  newStudentsLastMonth: number;
  monthOverMonthGrowthRate: number;
  totalEnrollmentsThisMonth: number;
  enrollmentTrend: string;
  retentionRate: number;
  studentsRetained: number;
  studentsCompletedLast3Months: number;
  churnRate: number;
  studentsChurnedThisMonth: number;
  studentsChurnedLastMonth: number;
  churnTrend: string;
  reactivationRate: number;
  reactivatedStudentsThisMonth: number;
  potentialReactivationPool: number;
  averageCoursesPerStudent: number;
  averageStudentLifetimeMonths: number;
  averageStudentLifetimeValue: number;
}

export interface RevenueFinance {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueThisYear: number;
  monthOverMonthGrowth: number;
  revenueTrend: string;
  tuitionCollected: number;
  tuitionCollectedThisMonth: number;
  averageTuitionPerStudent: number;
  collectionEfficiencyRate: number;
  pendingPaymentAmount: number;
  pendingInvoicesCount: number;
  overduePaymentAmount: number;
  overdueInvoicesCount: number;
  overdueRate: number;
  totalRefundVolume: number;
  refundsThisMonth: number;
  refundTransactionsCount: number;
  refundRate: number;
  forecastedRevenueNextMonth: number;
  forecastedRevenueNextQuarter: number;
  pipelineRevenue: number;
  forecastConfidence: string;
  averageRevenuePerStudent: number;
  yearOverYearGrowthRate: number;
  paymentMethodDistribution: {
    [key: string]: number;
  };
}

export interface EngagementSatisfaction {
  overallFeedbackScore: number;
  averageRating: number;
  totalFeedbacksReceived: number;
  feedbackResponseRate: number;
  studentSatisfactionScore: number;
  courseSatisfactionRating: number;
  teacherSatisfactionRating: number;
  facilitySatisfactionRating: number;
  netPromoterScore: number;
  promotersCount: number;
  passivesCount: number;
  detractorsCount: number;
  npsCategory: string;
  fiveStarPercentage: number;
  fourStarPercentage: number;
  threeStarPercentage: number;
  twoStarPercentage: number;
  oneStarPercentage: number;
  averageAttendanceRate: number;
  assignmentSubmissionRate: number;
  studentParticipationScore: number;
  satisfactionTrend: string;
  satisfactionChangeRate: number;
  complaintsCount: number;
  complaintResolutionRate: number;
}

export interface SystemHealth {
  totalActiveCourses: number;
  coursesWithActiveEnrollments: number;
  courseUtilizationRate: number;
  averageEnrollmentsPerCourse: number;
  underutilizedCoursesCount: number;
  totalActiveTeachers: number;
  averageTeachingHoursPerTeacher: number;
  averageClassesPerTeacher: number;
  teacherUtilizationRate: number;
  overloadedTeachersCount: number;
  underutilizedTeachersCount: number;
  systemLoadScore: number;
  peakUsageHours: string;
  systemHealthStatus: string;
  activeClassSessions: number;
  scheduledSessionsToday: number;
  completedSessionsToday: number;
  cancelledSessionsToday: number;
  availableTeachingSlotsThisWeek: number;
  availableRoomSlotsThisWeek: number;
  resourceAvailabilityScore: number;
  dataCompletenessScore: number;
  recordsRequiringAttention: number;
  activeAlertsCount: number;
  criticalIssuesCount: number;
  systemAlerts: any[];
}

export interface AnalyticsData {
  centerPerformance: CenterPerformance;
  growthRetention: GrowthRetention;
  revenueFinance: RevenueFinance;
  engagementSatisfaction: EngagementSatisfaction;
  systemHealth: SystemHealth;
  generatedAt: string;
  legacy: any;
}

export interface AnalyticsResponse {
  centerPerformance: CenterPerformance;
  growthRetention: GrowthRetention;
  revenueFinance: RevenueFinance;
  engagementSatisfaction: EngagementSatisfaction;
  systemHealth: SystemHealth;
  generatedAt: string;
  legacy: any;
}

export interface AnalyticsParams {
  period?: 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch admin analytics data
 * @param params - Query parameters for filtering analytics data
 * @returns Promise with analytics data
 */
export const getAdminAnalytics = async (params?: AnalyticsParams): Promise<AnalyticsResponse> => {
  try {
    const response = await api.get<AnalyticsResponse>('/api/Analytics/overall-overview', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    throw error;
  }
};

/**
 * Export analytics report
 * @param params - Parameters for the report
 * @returns Promise with blob data for download
 */
export const exportAnalyticsReport = async (params?: AnalyticsParams): Promise<Blob> => {
  try {
    const response = await api.get('/admin/analytics/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting analytics report:', error);
    throw error;
  }
};

/**
 * Get user analytics by role
 * @param role - User role (staff, teacher, student)
 * @param params - Query parameters
 * @returns Promise with role-specific analytics
 */
export const getUserAnalyticsByRole = async (
  role: 'staff' | 'teacher' | 'student',
  params?: AnalyticsParams
) => {
  try {
    const response = await api.get(`/admin/analytics/users/${role}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${role} analytics:`, error);
    throw error;
  }
};

/**
 * Get complaint analytics
 * @param params - Query parameters
 * @returns Promise with complaint analytics data
 */
export const getComplaintAnalytics = async (params?: AnalyticsParams) => {
  try {
    const response = await api.get('/admin/analytics/complaints', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching complaint analytics:', error);
    throw error;
  }
};

/**
 * Get system performance metrics
 * @returns Promise with system metrics
 */
export const getSystemMetrics = async () => {
  try {
    const response = await api.get('/admin/analytics/system');
    return response.data;
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    throw error;
  }
};

export default {
  getAdminAnalytics,
  exportAnalyticsReport,
  getUserAnalyticsByRole,
  getComplaintAnalytics,
  getSystemMetrics,
};

