import type { FilterUserParam } from "@/types/filter.type";
import type { AddTeacherProfile, CourseTeaching, CredentialTypeResponse, Teacher, TeacherCredentialResponse, UpdateTeacherProfile } from "@/types/teacher.type";
import { api, endpoint } from "./api";

/**
 * Get all teachers
 */
export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const response = await api.get<Teacher[]>(`${endpoint.account}`, {
      params: {   
        RoleName: 'Teacher',     
      },
    });
    return response.data as Teacher[];
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

/**
 * Get a single teacher by ID
 */
export const getTeacherById = async (id: string): Promise<Teacher> => {
  try {
    const url = `${endpoint.account}/${id}`;
    const response = await api.get<Teacher>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching teacher ${id}:`, error);
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any;
      console.error("Response status:", axiosError.response?.status);
      console.error("Response data:", axiosError.response?.data);
      console.error("Response headers:", axiosError.response?.headers);
    }
    throw error;
  }
};

export const filterTeacher  = async (filterParam: FilterUserParam): Promise<Teacher[]> => {
  try {
    const response = await api.get<Teacher[]>(`${endpoint.account}`,{
      params: {
        RoleName: 'Teacher',
        Name: filterParam.name ?? "",
        Email: filterParam.email ?? "",
        PhoneNumber: filterParam.phoneNumber ?? "",
        StatusName: filterParam.statusName ?? "",
        SortOrder: filterParam.sortOrder ?? "",  
        SortBy: filterParam.sortBy ?? "",
        CurrentRole: filterParam.currentRole ?? "",
      },
    });
    return response.data as Teacher[];
  } catch (error) {
    console.error(`Error filter teacher with filterParam: ${filterParam}:`, error);
    throw error;
  }
}

export const getListCourseTeaching = async (teacherId: string): Promise<CourseTeaching[]> => {
  try {
    const response = await api.get<CourseTeaching[]>(`${endpoint.courseTeacherAssignment}/CoursesByTeacher/${teacherId}`);
    return response.data ;
  } catch (error) {
    console.error(`Error fetching list course teaching:`, error);
    throw error;
  }
}

export const getListCredentialType = async (): Promise<CredentialTypeResponse[]> => {
  try {
    const response = await api.get<CredentialTypeResponse[]>(`${endpoint.teacherCredential}/credential-types`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching list credential type:`, error);
    throw error;
  }
}

export const getListCredentialByTeacherId = async (teacherId: string): Promise<TeacherCredentialResponse[]> => {
  try {
    const response = await api.get<TeacherCredentialResponse[]>(`${endpoint.teacherCredential}/${teacherId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching list credential by teacher id:`, error);
    throw error;
  }
}
/**
 * Create a new teacher
 */
export const createTeacher = async (teacherData: AddTeacherProfile): Promise<Teacher> => {
  try {
    const response = await api.post<Teacher>(`${endpoint.teacher}`, teacherData);
    return response.data;
  } catch (error) {
    console.error('Error creating teacher:', error);
    throw error;
  }
};

/**
 * Update a teacher
 */
export const updateTeacher = async (id: string, teacherData: UpdateTeacherProfile): Promise<Teacher> => {
  try {
    const response = await api.patch<Teacher>(`${endpoint.teacher}/updateprofile/${id}`, teacherData);
    return response.data;
  } catch (error) {
    console.error(`Error updating teacher ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a teacher
 */
export const deleteTeacher = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/IDN_Account/${id}`);
  } catch (error) {
    console.error(`Error deleting teacher ${id}:`, error);
    throw error;
  }
};

/**
 * Update teacher status
 */
export const updateTeacherStatus = async (id: string, status: string): Promise<Teacher> => {
  try {
    const response = await api.patch<Teacher>(`/api/IDN_Account/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating teacher status ${id}:`, error);
    throw error;
  }
};

/**
 * Add teacher credential
 */
// export const addTeacherCredential = async (teacherId: string, credential: {
//   degree: string;
//   institution: string;
//   year: string;
//   field: string;
// }): Promise<TeacherCredential> => {
//   try {
//     const response = await api.post<TeacherCredential>(`/api/Teacher/${teacherId}/credentials`, credential);
//     return response.data;
//   } catch (error) {
//     console.error(`Error adding credential for teacher ${teacherId}:`, error);
//     throw error;
//   }
// };

/**
 * Update teacher credential
 */
// export const updateTeacherCredential = async (teacherId: string, credentialId: string, credential: {
//   degree: string;
//   institution: string;
//   year: string;
//   field: string;
// }): Promise<TeacherCredential> => {
//   try {
//     const response = await api.put<TeacherCredential>(`/api/Teacher/${teacherId}/credentials/${credentialId}`, credential);
//     return response.data;
//   } catch (error) {
//     console.error(`Error updating credential ${credentialId} for teacher ${teacherId}:`, error);
//     throw error;
//   }
// };

/**
 * Delete teacher credential
 */
export const deleteTeacherCredential = async (teacherId: string, credentialId: string): Promise<void> => {
  try {
    await api.delete(`/api/Teacher/${teacherId}/credentials/${credentialId}`);
  } catch (error) {
    console.error(`Error deleting credential ${credentialId} for teacher ${teacherId}:`, error);
    throw error;
  }
};

/**
 * Upload teacher avatar
 */
export const uploadTeacherAvatar = async (id: string, file: File): Promise<Teacher> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post<Teacher>(
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
    console.error(`Error uploading avatar for teacher ${id}:`, error);
    throw error;
  }
};

/**
 * Search teachers
 */
// export const searchTeachers = async (query: string): Promise<Teacher[]> => {
//   try {
//     const response = await api.get<Teacher[]>('/api/IDN_Account/search', {
//       params: {
//         q: query,
//         RoleName: 'Teacher'
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error(`Error searching teachers with query "${query}":`, error);
//     throw error;
//   }
// };