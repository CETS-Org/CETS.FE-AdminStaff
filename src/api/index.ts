import { api as axiosInstance } from './api';
import { loginAcademicStaff, loginAccountantStaff, loginAdmin } from './account.api';
import { getCourses, getCourseDetail, searchCourses } from './course.api';
import { 
  getTimeslots, 
  getTimeslotById, 
  createTimeslot, 
  updateTimeslot, 
  deleteTimeslot,
  getTimetableEntries,
  getTimetableEntryById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry
} from './timetable.api';
import {
  getAdminAnalytics,
  exportAnalyticsReport,
  getUserAnalyticsByRole,
  getComplaintAnalytics,
  getSystemMetrics
} from './analytics.api';

export const apiClient = axiosInstance;
export { endpoint } from './api';

export const api = {
  // Courses
  getCourses,
  getCourseDetail,
  searchCourses,

  // Auth
  loginAcademicStaff,
  loginAccountantStaff,
  loginAdmin,

  // Timetable
  getTimeslots,
  getTimeslotById,
  createTimeslot,
  updateTimeslot,
  deleteTimeslot,
  getTimetableEntries,
  getTimetableEntryById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,

  // Analytics
  getAdminAnalytics,
  exportAnalyticsReport,
  getUserAnalyticsByRole,
  getComplaintAnalytics,
  getSystemMetrics,
};

export {
  getCourses,
  getCourseDetail,
  searchCourses,
  loginAcademicStaff,
  loginAccountantStaff,
  loginAdmin,
  getTimeslots,
  getTimeslotById,
  createTimeslot,
  updateTimeslot,
  deleteTimeslot,
  getTimetableEntries,
  getTimetableEntryById,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getAdminAnalytics,
  exportAnalyticsReport,
  getUserAnalyticsByRole,
  getComplaintAnalytics,
  getSystemMetrics,
};


