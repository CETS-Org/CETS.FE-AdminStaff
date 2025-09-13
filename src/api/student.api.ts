import type { FilterUserParam } from "@/types/filter.type";
import type { CourseEnrollment, Student } from "@/types/student.type";
import { api, endpoint } from "./api";


/**
 * Get all students
 */
export const getStudents = async (): Promise<Student[]> => {
  try {
    const url = `${endpoint.account}`;
    console.log("API URL:", url);
    console.log("Base URL:", api.defaults.baseURL);
    console.log("Full URL:", `${api.defaults.baseURL}${url}`);
    
    const response = await api.get<Student[]>(url, {
      params: {   
        RoleName: 'Student',     
      },
    });
    console.log("API Response:", response);
    console.log("Students data:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any;
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
      console.error("Response headers:", axiosError.response?.headers);
    }
    throw error;
  }
};

/**
 * Get a single student by ID
 */
export const getStudentById = async (id: string): Promise<Student> => {
  try {
    const url = `${endpoint.account}/${id}`;
    console.log("API URL:", url);
    console.log("Base URL:", api.defaults.baseURL);
    console.log("Full URL:", `${api.defaults.baseURL}${url}`);
    
    const response = await api.get<Student>(url);
    console.log("API Response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching student ${id}:`, error);
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any;
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
      console.error("Response headers:", axiosError.response?.headers);
    }
    throw error;
  }
};

export const filterStudent  = async (filterParam: FilterUserParam): Promise<Student[]> => {
  try {
    const response = await api.get<Student[]>(`${endpoint.account}`,{
      params: {
        RoleName: 'Student',
        Name: filterParam.name ?? "",
        Email: filterParam.email ?? "",
        PhoneNumber: filterParam.phoneNumber ?? "",
        StatusName: filterParam.statusName ?? "",
        SortOrder: filterParam.sortOrder ?? "",     
        SortBy: filterParam.sortBy ?? "",
        CurrentRole: filterParam.currentRole ?? "",
      },
    });
    return response.data ;
  } catch (error) {
    console.error(`Error filter student with filterParam: ${filterParam}:`, error);
    throw error;
  }
}

export const getListCourseEnrollment = async (studentId: string): Promise<CourseEnrollment[]> => {
  try {
    const response = await api.get<CourseEnrollment[]>(`${endpoint.enrollment}/CoursesByStudent/${studentId}`);
    return response.data as CourseEnrollment[];
  } catch (error) {
    console.error('Error fetching list course enrollment:', error);
    throw error;
  }
}

/**
 * Create a new student
 */
export const createStudent = async (studentData: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  cid?: string;
  address?: string;
  guardianName: string;
  guardianPhone?: string;
  school?: string;
  academicNote?: string;
}): Promise<Student> => {
  try {
    const response = await api.post<Student>('/api/IDN_Account', {
      ...studentData,
      roleNames: ['Student']
    });
    return response.data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

/**
 * Update a student
 */
export const updateStudent = async (id: string, studentData: {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  cid?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  school?: string;
  academicNote?: string;
}): Promise<Student> => {
  try {
    const response = await api.put<Student>(`/api/IDN_Account/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a student
 */
export const deleteStudent = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/IDN_Account/${id}`);
  } catch (error) {
    console.error(`Error deleting student ${id}:`, error);
    throw error;
  }
};

/**
 * Update student status
 */
export const updateStudentStatus = async (id: string, status: string): Promise<Student> => {
  try {
    const response = await api.patch<Student>(`/api/IDN_Account/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating student status ${id}:`, error);
    throw error;
  }
};

/**
 * Upload student avatar
 */
export const uploadStudentAvatar = async (id: string, file: File): Promise<Student> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post<Student>(
      `/api/IDN_Account/${id}/avatar`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error uploading avatar for student ${id}:`, error);
    throw error;
  }
};

/**
 * Search students
 */
export const searchStudents = async (query: string): Promise<Student[]> => {
  try {
    const response = await api.get<Student[]>('/api/IDN_Account/search', {
      params: {
        q: query,
        RoleName: 'Student'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching students with query "${query}":`, error);
    throw error;
  }
};
