import { api } from "./api";

export interface ExitSurveyResponse {
  id: string;
  studentId: string;
  academicRequestId?: string;
  reasonCategory: string;
  reasonDetail: string;
  feedback: {
    teacherQuality: number;
    classPacing: number;
    materials: number;
    staffService: number;
    schedule: number;
    facilities: number;
  };
  futureIntentions: {
    wouldReturnInFuture: boolean;
    wouldRecommendToOthers: boolean;
  };
  comments: string;
  acknowledgesPermanent: boolean;
  completedAt: string;
  createdAt: string;
}

export interface ExitSurveyAnalyticsResponse {
  totalSurveys: number;
  reasonCategoryStatistics: Record<string, number>;
  averageFeedbackRatings: Record<string, number>;
  surveysThisMonth: number;
  surveysThisYear: number;
}

/**
 * Get exit survey by ID
 */
export const getExitSurveyById = async (
  id: string
): Promise<ExitSurveyResponse> => {
  const response = await api.get<ExitSurveyResponse>(`/api/ACAD_ExitSurvey/${id}`);
  return response.data;
};

/**
 * Get exit survey by academic request ID
 */
export const getExitSurveyByAcademicRequestId = async (
  academicRequestId: string
): Promise<ExitSurveyResponse> => {
  const response = await api.get<ExitSurveyResponse>(
    `/api/ACAD_ExitSurvey/academic-request/${academicRequestId}`
  );
  return response.data;
};

/**
 * Get all exit surveys (Admin/Staff only)
 */
export const getAllExitSurveys = async (): Promise<ExitSurveyResponse[]> => {
  const response = await api.get<ExitSurveyResponse[]>("/api/ACAD_ExitSurvey");
  return response.data;
};

/**
 * Get exit survey analytics (Admin/Staff only)
 */
export const getExitSurveyAnalytics = async (): Promise<ExitSurveyAnalyticsResponse> => {
  const response = await api.get<ExitSurveyAnalyticsResponse>(
    "/api/ACAD_ExitSurvey/analytics"
  );
  return response.data;
};

