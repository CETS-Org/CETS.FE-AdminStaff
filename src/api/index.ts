import { api as axiosInstance } from './api';
import { loginAcademicStaff, loginAccountantStaff, loginAdmin } from './account.api';
import { getCourses, getCoursesList, getCourseDetail, searchCourses, createCourse, updateCourse, deleteCourse, activateCourse, deactivateCourse, getCourseCategories, getCourseSkills, getCourseBenefits, getCourseRequirements } from './course.api';
import { getCourseDetailById, getStudentsByCourse, getStudentEnrollments, getCourseTeachers, createCourseTeacherAssignment, deleteCourseTeacherAssignment, getCourseSyllabi, getCourseSkillsByCourse, getCourseBenefitsByCourse, getCourseRequirementsByCourse, getClassesByCourse, getCourseSchedules, createCourseSchedule, updateCourseSchedule, deleteCourseSchedule, createCourseSkill, deleteCourseSkill, createCourseBenefit, deleteCourseBenefit, createCourseRequirement, deleteCourseRequirement } from './course-relations.api';
import { getClassDetail } from './class.api';
import { getLookupsByTypeCode } from './core.api';
import { createSyllabus, createSyllabusItem, getSyllabiByCourse, getSyllabusItems, updateSyllabus, updateSyllabusItem, deleteSyllabus, deleteSyllabusItem } from './syllabus.api';
import { createLearningMaterial } from './learning-material.api';
import { getPlanTypes, getTimeSlots } from './lookup.api';
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
import { 
  getPackagesList, 
  getPackageById, 
  getPackageDetailById, 
  createPackage, 
  updatePackage, 
  deletePackage,
  getPackageCourses,
  addCourseToPackage,
  removeCourseFromPackage,
  updatePackageCourseOrder,
  getPackageImageUploadUrl
} from './package.api';
import {
  getRevenueAnalytics,
  getTopEnrolledCourses,
  getStudentDropoutAnalytics,
  getAIRecommendations,
  getDashboardData
} from './admin-dashboard.api';

export const apiClient = axiosInstance;
export { endpoint } from './api';

export const api = {
  // Courses
  getCourses,
  getCoursesList,
  getCourseDetail,
  searchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  activateCourse,
  deactivateCourse,

  // Course Detail
  getCourseDetailById,
  getStudentsByCourse,
  getStudentEnrollments,
  getCourseSchedules,
  createCourseSchedule,
  updateCourseSchedule,
  deleteCourseSchedule,
  getCourseTeachers,
  createCourseTeacherAssignment,
  deleteCourseTeacherAssignment,
  getCourseSyllabi,
  getCourseSkillsByCourse,
  createCourseSkill,
  deleteCourseSkill,
  getCourseBenefitsByCourse,
  createCourseBenefit,
  deleteCourseBenefit,
  getCourseRequirementsByCourse,
  createCourseRequirement,
  deleteCourseRequirement,
  getClassesByCourse,

  // Classes
  getClassDetail,

  // Core
  getLookupsByTypeCode,
  getCourseCategories,

  // Syllabus
  createSyllabus,
  createSyllabusItem,
  getSyllabiByCourse,
  getSyllabusItems,
  updateSyllabus,
  updateSyllabusItem,
  deleteSyllabus,
  deleteSyllabusItem,
  createLearningMaterial,

  // Course Data
  getCourseSkills,
  getCourseBenefits,
  getCourseRequirements,

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
  // Lookup
  getPlanTypes,
  getTimeSlots,

  // Packages
  getPackagesList,
  getPackageById,
  getPackageDetailById,
  createPackage,
  updatePackage,
  deletePackage,
  getPackageCourses,
  addCourseToPackage,
  removeCourseFromPackage,
  updatePackageCourseOrder,
  getPackageImageUploadUrl,

  // Dashboard Analytics
  getRevenueAnalytics,
  getTopEnrolledCourses,
  getStudentDropoutAnalytics,
  getAIRecommendations,
  getDashboardData,
};

export {
  getCourses,
  getCoursesList,
  getCourseDetail,
  searchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  activateCourse,
  deactivateCourse,
  getCourseDetailById,
  getStudentsByCourse,
  getStudentEnrollments,
  getCourseSchedules,
  createCourseSchedule,
  updateCourseSchedule,
  deleteCourseSchedule,
  createCourseSkill,
  deleteCourseSkill,
  createCourseBenefit,
  deleteCourseBenefit,
  createCourseRequirement,
  deleteCourseRequirement,
  getCourseTeachers,
  createCourseTeacherAssignment,
  deleteCourseTeacherAssignment,
  getCourseSyllabi,
  getCourseSkillsByCourse,
  getCourseBenefitsByCourse,
  getCourseRequirementsByCourse,
  getClassesByCourse,
  getClassDetail,
  getLookupsByTypeCode,
  getCourseCategories,
  createSyllabus,
  createSyllabusItem,
  getSyllabiByCourse,
  getSyllabusItems,
  updateSyllabus,
  updateSyllabusItem,
  deleteSyllabus,
  deleteSyllabusItem,
  createLearningMaterial,
  getCourseSkills,
  getCourseBenefits,
  getCourseRequirements,
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
  getPlanTypes,
  getTimeSlots,
  getPackagesList,
  getPackageById,
  getPackageDetailById,
  createPackage,
  updatePackage,
  deletePackage,
  getPackageCourses,
  addCourseToPackage,
  removeCourseFromPackage,
  updatePackageCourseOrder,
  getPackageImageUploadUrl,
  getRevenueAnalytics,
  getTopEnrolledCourses,
  getStudentDropoutAnalytics,
  getAIRecommendations,
  getDashboardData,
};


