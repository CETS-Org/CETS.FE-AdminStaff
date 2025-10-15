import { api as axiosInstance } from './api';
import { loginAcademicStaff, loginAccountantStaff, loginAdmin } from './account.api';
import { getCourses, getCoursesList, getCourseDetail, searchCourses, createCourse, updateCourse, deleteCourse, activateCourse, deactivateCourse, getCourseCategories, getCourseSkills, getCourseBenefits, getCourseRequirements } from './course.api';
import { getLookupsByTypeCode } from './core.api';
import { createSyllabus, createSyllabusItem, getSyllabiByCourse, getSyllabusItems, updateSyllabus, updateSyllabusItem, deleteSyllabus } from './syllabus.api';
import { createLearningMaterial } from './learning-material.api';
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
  getLookupsByTypeCode,
  getCourseCategories,
  createSyllabus,
  createSyllabusItem,
  getSyllabiByCourse,
  getSyllabusItems,
  updateSyllabus,
  updateSyllabusItem,
  deleteSyllabus,
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
};


