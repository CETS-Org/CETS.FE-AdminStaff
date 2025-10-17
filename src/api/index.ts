import { api as axiosInstance } from './api';
import { loginAcademicStaff, loginAccountantStaff, loginAdmin } from './account.api';
import { getCourses, getCoursesList, getCourseDetail, searchCourses, createCourse, updateCourse, deleteCourse, activateCourse, deactivateCourse, getCourseCategories, getCourseSkills, getCourseBenefits, getCourseRequirements } from './course.api';
import { getCourseDetailById, getStudentsByCourse, getStudentEnrollments, getCourseSchedules, getCourseTeachers, getCourseSyllabi, getCourseSkillsByCourse, getCourseBenefitsByCourse, getCourseRequirementsByCourse, getClassesByCourse } from './course-detail.api';
import { getLookupsByTypeCode } from './core.api';
import { createSyllabus, createSyllabusItem, getSyllabiByCourse, getSyllabusItems, updateSyllabus, updateSyllabusItem, deleteSyllabus } from './syllabus.api';
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
  getCourseTeachers,
  getCourseSyllabi,
  getCourseSkillsByCourse,
  getCourseBenefitsByCourse,
  getCourseRequirementsByCourse,
  getClassesByCourse,

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

  // Lookup
  getPlanTypes,
  getTimeSlots,
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
  getCourseTeachers,
  getCourseSyllabi,
  getCourseSkillsByCourse,
  getCourseBenefitsByCourse,
  getCourseRequirementsByCourse,
  getClassesByCourse,
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
  getPlanTypes,
  getTimeSlots,
};


