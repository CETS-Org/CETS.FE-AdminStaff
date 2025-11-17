import { api } from './api';
import type { Package, CreatePackageRequest, UpdatePackageRequest } from '@/types/package.types';

const PACKAGE_BASE_URL = '/api/ACAD_CoursePackage';

// Get all packages
export const getPackagesList = async () => {
  return api.get<{ value: Package[] }>(`${PACKAGE_BASE_URL}`);
};

// Get package by ID
export const getPackageById = async (id: string) => {
  return api.get<Package>(`${PACKAGE_BASE_URL}/${id}`);
};

export const getPackageDetail = async (id: string) => {
  return api.get<Package>(`${PACKAGE_BASE_URL}/${id}/detail`);
};

// Get package details with courses
export const getPackageDetailById = async (id: string) => {
  return api.get<Package>(`${PACKAGE_BASE_URL}/${id}/detail`);
};

// Create new package
export const createPackage = async (data: CreatePackageRequest) => {
  return api.post<{ id: string; Id: string }>(`${PACKAGE_BASE_URL}`, data);
};

// Update package
export const updatePackage = async (id: string, data: UpdatePackageRequest) => {
  return api.put(`${PACKAGE_BASE_URL}/${id}`, data);
};

// Delete package
export const deletePackage = async (id: string) => {
  return api.delete(`${PACKAGE_BASE_URL}/${id}`);
};

// Get package courses
export const getPackageCourses = async (packageId: string) => {
  return api.get<{ value: any[] }>(`${PACKAGE_BASE_URL}/${packageId}/courses`);
};

// Add course to package
export const addCourseToPackage = async (packageId: string, courseId: string, sortOrder?: number) => {
  return api.post(`${PACKAGE_BASE_URL}/${packageId}/courses`, {
    packageID: packageId,
    courseID: courseId,
    sortOrder: sortOrder
  });
};

// Remove course from package
export const removeCourseFromPackage = async (packageId: string, courseId: string) => {
  return api.delete(`${PACKAGE_BASE_URL}/${packageId}/courses/${courseId}`);
};

// Update course order in package
export const updatePackageCourseOrder = async (packageId: string, courseId: string, sortOrder: number) => {
  return api.put(`${PACKAGE_BASE_URL}/${packageId}/courses/${courseId}/order`, {
    sortOrder
  });
};

// Get presigned URL for image upload
export const getPackageImageUploadUrl = async (fileName: string, contentType: string) => {
  return api.post<{ uploadUrl: string; filePath: string; publicUrl: string }>(`${PACKAGE_BASE_URL}/image-upload-url`, {
    fileName,
    contentType
  });
};

// Get package statistics
export const getPackageStatistics = async () => {
  return api.get<{
    totalPackages: number;
    activePackages: number;
    totalRevenue: number;
    packagesSold: number;
  }>(`${PACKAGE_BASE_URL}/statistics`);
};



