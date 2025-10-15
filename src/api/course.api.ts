import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

export const getCourses = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}`, config);

export const getCoursesList = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/list`, config);

export const getCourseDetail = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/${courseId}`, config);

export const searchCourses = (searchParams?: any, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/search-basic`, { ...config, params: searchParams });

export const createCourse = (courseData: any, config?: AxiosRequestConfig) =>
  api.post(`${endpoint.course}`, courseData, config);

export const updateCourse = (courseId: string, courseData: any, config?: AxiosRequestConfig) =>
  api.put(`${endpoint.course}/${courseId}`, courseData, config);

export const deleteCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.delete(`${endpoint.course}/${courseId}`, config);

export const activateCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.patch(`${endpoint.course}/${courseId}/activate`, {}, config);

export const deactivateCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.patch(`${endpoint.course}/${courseId}/deactivate`, {}, config);

// Course Categories
export const getCourseCategories = (config?: AxiosRequestConfig) =>
  api.get('/api/ACAD_CourseCategory', config);

// Skills (from lookup)
export const getCourseSkills = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coreLookup}/type/code/CourseSkill`, config);

// Benefits (from lookup)
export const getCourseBenefits = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coreLookup}/type/code/CourseBenefit`, config);

// Requirements (from lookup)
export const getCourseRequirements = (config?: AxiosRequestConfig) =>
  api.get(`${endpoint.coreLookup}/type/code/CourseRequirement`, config);


