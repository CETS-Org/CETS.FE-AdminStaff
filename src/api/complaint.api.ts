import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

// Types for Complaint
export interface SystemComplaint {
  id: string;
  reportTypeID: string;
  reportTypeName?: string;
  submittedBy: string;
  submitterName?: string;
  submitterEmail?: string;
  title: string;
  description: string;
  attachmentUrl?: string;
  reportStatusID: string;
  statusName?: string;
  priority?: string;
  reportUrl?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  adminResponse?: string;
}

export interface CreateComplaintRequest {
  reportTypeID: string;
  submittedBy: string;
  title: string;
  description: string;
  attachmentUrl?: string;
  reportStatusID: string;
  reportUrl?: string;
}

export interface UpdateComplaintRequest {
  reportTypeID: string;
  submittedBy: string;
  title: string;
  description: string;
  attachmentUrl?: string;
  reportStatusID: string;
  priority?: string;
  reportUrl?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  adminResponse?: string;
}

// Get all system complaints
export const getAllComplaints = async (config?: AxiosRequestConfig): Promise<SystemComplaint[]> => {
  const response = await api.get('/api/RPT_Report/system-complaints', config);
  return response.data;
};

// Get complaint by ID (using standard report endpoint)
export const getComplaintById = async (id: string, config?: AxiosRequestConfig): Promise<SystemComplaint> => {
  const response = await api.get(`/api/RPT_Report/${id}`, config);
  return response.data;
};

// Get complaints by status
export const getComplaintsByStatus = async (statusId: string, config?: AxiosRequestConfig): Promise<SystemComplaint[]> => {
  const response = await api.get(`/api/RPT_Report/system-complaints/status/${statusId}`, config);
  return response.data;
};

// Create a new complaint (using standard report endpoint)
export const createComplaint = async (data: CreateComplaintRequest, config?: AxiosRequestConfig): Promise<SystemComplaint> => {
  const response = await api.post('/api/RPT_Report', data, config);
  return response.data;
};

// Update a complaint (using standard report endpoint)
export const updateComplaint = async (id: string, data: UpdateComplaintRequest, config?: AxiosRequestConfig): Promise<SystemComplaint> => {
  const response = await api.put(`/api/RPT_Report/${id}`, data, config);
  return response.data;
};

// Delete a complaint (using standard report endpoint)
export const deleteComplaint = async (id: string, config?: AxiosRequestConfig): Promise<void> => {
  await api.delete(`/api/RPT_Report/${id}`, config);
};

// Get download URL for complaint attachment (using standard report endpoint)
export const getComplaintDownloadUrl = async (id: string, config?: AxiosRequestConfig): Promise<{ downloadUrl: string; complaintInfo: any }> => {
  const response = await api.get(`/api/RPT_Report/download/${id}`, config);
  return response.data;
};

// Get all report types for selection
export const getReportTypes = async (config?: AxiosRequestConfig): Promise<Array<{ id: string; code: string; name: string; isActive: boolean }>> => {
  const response = await api.get('/api/RPT_Report/report-types', config);
  return response.data;
};

// Get all report statuses for selection
export const getReportStatuses = async (config?: AxiosRequestConfig): Promise<Array<{ id: string; code: string; name: string; isActive: boolean }>> => {
  const response = await api.get('/api/RPT_Report/report-statuses', config);
  return response.data;
};

