import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

// Course Detail APIs
export const getCourseDetailById = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/detail/${courseId}`, config);

// Student APIs
export const getStudentsByCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.enrollment}/course/${courseId}/students`, config);

export const getStudentEnrollments = (studentId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.enrollment}/CoursesByStudent/${studentId}`, config);

// Course Schedule APIs
export const getCourseSchedules = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`/api/ACAD_CourseSchedule/course/${courseId}`, config);

// Course Teacher Assignment APIs
export const getCourseTeachers = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.courseTeacherAssignment}/course/${courseId}`, config);

// Course Syllabus APIs
export const getCourseSyllabi = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`/api/ACAD_Syllabus/course/${courseId}`, config);

// Course Skills, Benefits, Requirements APIs
export const getCourseSkillsByCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`/api/ACAD_CourseSkill/course/${courseId}`, config);

export const getCourseBenefitsByCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`/api/ACAD_CourseBenefit/course/${courseId}`, config);

export const getCourseRequirementsByCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`/api/ACAD_CourseRequirement/course/${courseId}`, config);

// Course Classes APIs
export const getClassesByCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`/api/ACAD_Classes/course/${courseId}`, config);