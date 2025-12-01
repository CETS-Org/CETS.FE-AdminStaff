import type { AxiosRequestConfig } from 'axios';
import { api } from './api';
import type { AcademicRequestResponse, ProcessAcademicRequest } from '@/types/academicRequest.type';

const ACADEMIC_REQUEST_ENDPOINT = '/api/ACAD_AcademicRequest';

/**
 * Get all academic requests (for staff)
 */
export const getAllAcademicRequests = (config?: AxiosRequestConfig) =>
  api.get<AcademicRequestResponse[]>(ACADEMIC_REQUEST_ENDPOINT, config);

/**
 * Get academic requests by status (for staff)
 */
export const getAcademicRequestsByStatus = (statusId: string, config?: AxiosRequestConfig) =>
  api.get<AcademicRequestResponse[]>(`${ACADEMIC_REQUEST_ENDPOINT}/status/${statusId}`, config);

/**
 * Get academic request details
 */
export const getAcademicRequestDetails = (requestId: string, config?: AxiosRequestConfig) =>
  api.get<AcademicRequestResponse>(`${ACADEMIC_REQUEST_ENDPOINT}/${requestId}`, config);

/**
 * Get academic request history (status change logs)
 */
export interface AcademicRequestHistoryItem {
  id: string;
  requestID: string;
  statusID: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
  attachmentUrl?: string | null;
}

export const getAcademicRequestHistory = (requestId: string, config?: AxiosRequestConfig) =>
  api.get<AcademicRequestHistoryItem[]>(`${ACADEMIC_REQUEST_ENDPOINT}/${requestId}/history`, config);

/**
 * Process (approve/reject) an academic request (for staff)
 */
export const processAcademicRequest = (data: ProcessAcademicRequest, config?: AxiosRequestConfig) =>
  api.put(`${ACADEMIC_REQUEST_ENDPOINT}/process`, data, config);

/**
 * Get presigned download URL for attachment
 */
export const getAttachmentDownloadUrl = (filePath: string, config?: AxiosRequestConfig) =>
  api.get<{ downloadUrl: string }>(`${ACADEMIC_REQUEST_ENDPOINT}/download-url`, {
    params: { filePath },
    ...config,
  });

