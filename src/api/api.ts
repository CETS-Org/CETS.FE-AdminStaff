import axios from "axios";

// Create axios instance with base configuration
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:8000',
    timeout: 10000, // Increased timeout to 10 seconds
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
    },
  });
  
export const endpoint ={
  account: '/api/IDN_Account',
  course: '/api/ACAD_Course',
  student: '/api/IDN_Student',
  teacher: '/api/IDN_Teacher',
  role: '/api/IDN_Role',
  enrollment: '/api/ACAD_Enrollment',
  attendance: '/api/ACAD_Attendance',
  courseTeacherAssignment: '/api/ACAD_CourseTeacherAssignment',
  teacherCredential: '/api/IDN_TeacherCredential',
  coreLookup: '/api/CORE_LookUp',
  classes: '/api/ACAD_Classes',
  promotion: '/api/FIN_Promotion',
  paymentWebhook: '/api/FIN_PaymentWebhook',
  notification: '/api/COM_Notification',
  academicRequest: '/api/ACAD_AcademicRequest',
  reservationItem: '/api/reservation-items',
  classReservation: '/api/class-reservations',
  classMeetings: '/api/ACAD_ClassMeetings',
  courseShedule: '/api/ACAD_CourseSchedule',
  room: '/api/FAC_Room',
  report: '/api/RPT_Report',
  email :'api/email'
}

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Safely read error response/config
      const status = error?.response?.status;
      const requestUrl: string | undefined = error?.config?.url;

      if (status === 401) {
        const hasToken = !!localStorage.getItem('authToken');
        const isLoginRequest =
          requestUrl?.includes('/login') ||
          requestUrl?.includes('/IDN_Account/login');

        // Only force logout + redirect when:
        // - there's an existing auth token (user is logged in), AND
        // - the 401 did NOT come from a login request (i.e., token expired / unauthorized API call)
        if (hasToken && !isLoginRequest) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    }
  );
  