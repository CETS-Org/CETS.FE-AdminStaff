import { api as axiosInstance } from './api';
import { loginAcademicStaff, loginAccountantStaff, loginAdmin } from './account.api';
import { getCourses, getCourseDetail, searchCourses } from './course.api';

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
};

export {
  getCourses,
  getCourseDetail,
  searchCourses,
  loginAcademicStaff,
  loginAccountantStaff,
  loginAdmin,
};


