import type { AxiosRequestConfig } from 'axios';
import { api, endpoint } from './api';

// Endpoints
const scheduleEndpoint = '/api/ACAD_CourseSchedule';
const courseSkillEndpoint = '/api/ACAD_CourseSkill';
const courseBenefitEndpoint = '/api/ACAD_CourseBenefit';
const courseRequirementEndpoint = '/api/ACAD_CourseRequirement';

// ============================================
// Course Detail
// ============================================

export const getCourseDetailById = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.course}/detail/${courseId}`, config);

// ============================================
// Course Schedules
// ============================================

export const getCourseSchedules = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${scheduleEndpoint}/course/${courseId}`, config);

export const createCourseSchedule = (data: {
  courseID: string;
  timeSlotID: string;
  dayOfWeek: number;
}, config?: AxiosRequestConfig) =>
  api.post(scheduleEndpoint, data, config);

export const updateCourseSchedule = (id: string, data: {
  courseID: string;
  timeSlotID: string;
  dayOfWeek: number;
}, config?: AxiosRequestConfig) =>
  api.put(`${scheduleEndpoint}/${id}`, data, config);

export const deleteCourseSchedule = (id: string, config?: AxiosRequestConfig) =>
  api.delete(`${scheduleEndpoint}/${id}`, config);

// ============================================
// Course Skills
// ============================================

export const getCourseSkillsByCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${courseSkillEndpoint}/course/${courseId}`, config);

export const createCourseSkill = (data: {
  courseID: string;
  skillID: string;
}, config?: AxiosRequestConfig) =>
  api.post(courseSkillEndpoint, data, config);

export const deleteCourseSkill = (id: string, config?: AxiosRequestConfig) =>
  api.delete(`${courseSkillEndpoint}/${id}`, config);

// ============================================
// Course Benefits
// ============================================

export const getCourseBenefitsByCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${courseBenefitEndpoint}/course/${courseId}`, config);

export const createCourseBenefit = (data: {
  courseID: string;
  benefitID: string;
}, config?: AxiosRequestConfig) =>
  api.post(courseBenefitEndpoint, data, config);

export const deleteCourseBenefit = (id: string, config?: AxiosRequestConfig) =>
  api.delete(`${courseBenefitEndpoint}/${id}`, config);

// ============================================
// Course Requirements
// ============================================

export const getCourseRequirementsByCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${courseRequirementEndpoint}/course/${courseId}`, config);

export const createCourseRequirement = (data: {
  courseID: string;
  requirementID: string;
}, config?: AxiosRequestConfig) =>
  api.post(courseRequirementEndpoint, data, config);

export const deleteCourseRequirement = (id: string, config?: AxiosRequestConfig) =>
  api.delete(`${courseRequirementEndpoint}/${id}`, config);

// ============================================
// Course Syllabi
// ============================================

export const getCourseSyllabi = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`/api/ACAD_Syllabus/course/${courseId}`, config);

// ============================================
// Course Classes
// ============================================

export const getClassesByCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`/api/ACAD_Classes/course/${courseId}`, config);

// ============================================
// Course Teachers
// ============================================

export const getCourseTeachers = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.courseTeacherAssignment}/course/${courseId}`, config);

// ============================================
// Course Students
// ============================================

export const getStudentsByCourse = (courseId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.enrollment}/course/${courseId}/students`, config);

export const getStudentEnrollments = (studentId: string, config?: AxiosRequestConfig) =>
  api.get(`${endpoint.enrollment}/CoursesByStudent/${studentId}`, config);

