import axios from "axios";

// Create axios instance with base configuration
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://localhost:8000',
    timeout: 10000, // Increased timeout to 10 seconds
    headers: {
      'Content-Type': 'application/json',
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
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  