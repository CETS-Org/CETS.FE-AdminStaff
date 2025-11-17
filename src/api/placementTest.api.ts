import type { AxiosRequestConfig } from 'axios';
import { api } from './api';

// Types
export interface PlacementQuestion {
  id: string;
  skillType: string;
  skillTypeID: string;
  questionType: string;
  questionTypeID: string;
  title: string;
  questionUrl?: string | null;
  difficulty: number; // 1: đơn, 2: ngắn, 3: dài
  createdAt: string;
  updatedAt?: string | null;
}

export interface QuestionType {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface PlacementTest {
  id: string;
  title: string;
  durationMinutes: number;
  storeUrl?: string | null;
  questions: PlacementQuestion[];
  createdAt: string;
  updatedAt?: string | null;
  isDeleted: boolean;
}

export interface CreatePlacementQuestionRequest {
  title: string;
  questionUrl?: string | null;
  skillTypeID: string;
  questionTypeID: string;
  difficulty: number;
  questionJson?: string; // JSON content để upload
}

export interface UpdatePlacementQuestionRequest {
  id: string;
  title?: string;
  questionUrl?: string | null;
  skillTypeID?: string;
  questionTypeID?: string;
  difficulty?: number;
  questionJson?: string;
}

export interface CreatePlacementTestWithQuestionsRequest {
  title: string;
  durationMinutes: number;
  questionIds: string[];
}

export interface UpdatePlacementTestRequest {
  title?: string;
  durationMinutes?: number;
  questionIds?: string[];
}

export interface RandomPlacementTestCriteria {
  shortPassages?: number; // 2 đoạn văn ngắn
  longPassages?: number; // 1 bài văn dài
  shortAudios?: number; // 2 audio ngắn
  longAudios?: number; // 1 audio dài
  multipleChoice?: number; // 5 câu hỏi multiple choice
}

// API Functions

// Placement Question APIs
export const createPlacementQuestion = (
  data: CreatePlacementQuestionRequest,
  config?: AxiosRequestConfig
) => api.post<PlacementQuestion>('/api/ACAD_PlacementTest/question/create', data, config);

export const updatePlacementQuestion = (
  data: UpdatePlacementQuestionRequest,
  config?: AxiosRequestConfig
) => api.put<PlacementQuestion>('/api/ACAD_PlacementTest/question/update', data, config);

export const deletePlacementQuestion = (
  id: string,
  config?: AxiosRequestConfig
) => api.delete(`/api/ACAD_PlacementTest/question/${id}`, config);

export const getPlacementQuestionById = (
  id: string,
  config?: AxiosRequestConfig
) => api.get<PlacementQuestion>(`/api/ACAD_PlacementTest/question/${id}`, config);

export const getAllPlacementQuestions = (
  config?: AxiosRequestConfig
) => api.get<PlacementQuestion[]>('/api/ACAD_PlacementTest/question/all', config);

export const getPlacementQuestionsByCriteria = (
  questionTypeId: string,
  difficulty: number,
  skillTypeId?: string,
  config?: AxiosRequestConfig
) => {
  const params = new URLSearchParams({
    questionTypeId,
    difficulty: difficulty.toString(),
  });
  if (skillTypeId) {
    params.append('skillTypeId', skillTypeId);
  }
  return api.get<PlacementQuestion[]>(`/api/ACAD_PlacementTest/question/filter?${params.toString()}`, config);
};

// Placement Test APIs
export const randomPlacementTest = (
  config?: AxiosRequestConfig
) => api.post<PlacementTest>('/api/ACAD_PlacementTest/random', {}, config);

export const createPlacementTestWithQuestions = (
  data: CreatePlacementTestWithQuestionsRequest,
  config?: AxiosRequestConfig
) => api.post<PlacementTest>('/api/ACAD_PlacementTest/create-with-questions', data, config);

export const updatePlacementTest = (
  id: string,
  data: UpdatePlacementTestRequest,
  config?: AxiosRequestConfig
) => api.put<PlacementTest>(`/api/ACAD_PlacementTest/update/${id}`, data, config);

export const getPlacementTestById = (
  id: string,
  config?: AxiosRequestConfig
) => api.get<PlacementTest>(`/api/ACAD_PlacementTest/${id}`, config);

export const getAllPlacementTests = (
  config?: AxiosRequestConfig
) => api.get<PlacementTest[]>('/api/ACAD_PlacementTest/all', config);

export const deletePlacementTest = (
  id: string,
  config?: AxiosRequestConfig
) => api.delete(`/api/ACAD_PlacementTest/${id}`, config);

// Student APIs
export const getRandomPlacementTestForStudent = (
  config?: AxiosRequestConfig
) => api.post<PlacementTest>('/api/ACAD_PlacementTest/student/random-test', {}, config);

export const submitPlacementTest = (
  data: {
    studentId: string;
    placementTestId: string;
    score: number;
    answers?: any;
  },
  config?: AxiosRequestConfig
) => api.post('/api/ACAD_PlacementTest/submit', data, config);

// Helper APIs
export const getQuestionTypes = (
  config?: AxiosRequestConfig
) => api.get<QuestionType[]>('/api/ACAD_PlacementTest/question-types', config);

export const getQuestionDataUrl = (
  id: string,
  config?: AxiosRequestConfig
) => api.get<{ questionDataUrl: string }>(`/api/ACAD_PlacementTest/${id}/question-data-url`, config);

export const getQuestionJsonUploadUrl = (
  fileName?: string,
  config?: AxiosRequestConfig
) => {
  const url = fileName 
    ? `/api/ACAD_PlacementTest/question-json-upload-url?fileName=${encodeURIComponent(fileName)}`
    : '/api/ACAD_PlacementTest/question-json-upload-url';
  return api.get<{ uploadUrl: string; filePath: string }>(url, config);
};

