import type { AxiosRequestConfig } from 'axios';
import { api } from './api';

// Endpoints inferred from backend controllers naming conventions
const syllabusEndpoint = '/api/ACAD_Syllabus';
const syllabusItemEndpoint = '/api/ACAD_SyllabusItem';

export type CreateSyllabusPayload = {
  courseID: string; // Guid
  title: string;
  description?: string | null;
  createdBy: string; // Guid
};

export type CreateSyllabusItemPayload = {
  syllabusID: string; // Guid
  sessionNumber: number;
  topicTitle: string;
  totalSlots?: number | null;
  required: boolean;
  objectives?: string | null;
  contentSummary?: string | null;
  preReadingUrl?: string | null;
  createdBy: string; // Guid
};


export const createSyllabus = (data: CreateSyllabusPayload, config?: AxiosRequestConfig) =>
  api.post(`${syllabusEndpoint}`, data, config);

export const createSyllabusItem = (data: CreateSyllabusItemPayload, config?: AxiosRequestConfig) =>
  api.post(`${syllabusItemEndpoint}`, data, config);

// Additional API functions for future use
export const getSyllabiByCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${syllabusEndpoint}/course/${courseId}`, config);

export const getSyllabusItems = (syllabusId: string, config?: AxiosRequestConfig) =>
  api.get(`${syllabusItemEndpoint}/syllabus/${syllabusId}`, config);

export const updateSyllabus = (id: string, data: any, config?: AxiosRequestConfig) =>
  api.put(`${syllabusEndpoint}/${id}`, data, config);

export const updateSyllabusItem = (id: string, data: any, config?: AxiosRequestConfig) =>
  api.put(`${syllabusItemEndpoint}/${id}`, data, config);

export const deleteSyllabus = (id: string, config?: AxiosRequestConfig) =>
  api.delete(`${syllabusEndpoint}/${id}`, config);
