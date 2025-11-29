import { api } from "./api";

// API endpoint
const CLASSES_ENDPOINT = "/api/ACAD_Classes";

// Types based on API response
export interface ClassSchedule {
  date: string;
  slot: string;
}

export interface ClassData {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacher: string;
  room: string;
  currentStudents: number;
  maxStudents: number;
  status: "active" | "inactive" | "full";
  schedule: ClassSchedule[];
  startDate: string;
  endDate: string;
}

export interface ClassStatistics {
  totalClasses: number;
  activeClasses: number;
  fullClasses: number;
  totalStudents: number;
}

// Student in class detail
export interface StudentInClass {
  id: string;
  enrollmentId: string;
  studentCode: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  attendanceRate: number;
  progressPercentage: number;
  finalGrade?: number | null;
}

// Class detail response
export interface ClassDetailResponse {
  id: string;
  className: string;
  courseName: string;
  courseId: string;
  capacity: number;
  enrolledCount: number;
  teacherId?: string;
  teacherName: string;
  schedule: string;
  room: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive" | "full";
  statusCode: string;
  description?: string;
  totalSessions: number;
  completedSessions: number;
  students: StudentInClass[];
}

// Get all staff classes
export const getStaffClasses = async (): Promise<ClassData[]> => {
  try {
    const response = await api.get<ClassData[]>(`${CLASSES_ENDPOINT}/staff-classes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching staff classes:", error);
    throw error;
  }
};

// Get class by ID
export const getClassById = async (id: string): Promise<ClassData> => {
  try {
    const response = await api.get<ClassData>(`${CLASSES_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching class ${id}:`, error);
    throw error;
  }
};

// Create new class
export const createClass = async (classData: Omit<ClassData, "id">): Promise<ClassData> => {
  try {
    const response = await api.post<ClassData>(CLASSES_ENDPOINT, classData);
    return response.data;
  } catch (error) {
    console.error("Error creating class:", error);
    throw error;
  }
};

// Update class
export const updateClass = async (id: string, classData: Partial<ClassData>): Promise<ClassData> => {
  try {
    const response = await api.put<ClassData>(`${CLASSES_ENDPOINT}/${id}`, classData);
    return response.data;
  } catch (error) {
    console.error(`Error updating class ${id}:`, error);
    throw error;
  }
};

// Delete class
export const deleteClass = async (id: string): Promise<void> => {
  try {
    await api.delete(`${CLASSES_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Error deleting class ${id}:`, error);
    throw error;
  }
};

// Get class detail by ID
export const getClassDetail = async (id: string): Promise<ClassDetailResponse> => {
  try {
    const response = await api.get<ClassDetailResponse>(`${CLASSES_ENDPOINT}/${id}/detail`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching class detail ${id}:`, error);
    throw error;
  }
};

// Calculate statistics from class data
export const calculateClassStatistics = (classes: ClassData[]): ClassStatistics => {
  return {
    totalClasses: classes.length,
    activeClasses: classes.filter(c => c.status === "active").length,
    fullClasses: classes.filter(c => c.status === "full" || c.currentStudents >= c.maxStudents).length,
    totalStudents: classes.reduce((sum, c) => sum + c.currentStudents, 0),
  };
};

// ==================== Final Grade Management ====================

// Types for bulk final grade update
export interface FinalGradeUpdate {
  enrollmentId: string;
  finalGrade: number | null;
}

export interface BulkUpdateFinalGradesRequest {
  finalGrades: FinalGradeUpdate[];
}

export interface FinalGradeUpdateResult {
  enrollmentId: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface BulkUpdateFinalGradesData {
  updatedCount: number;
  failedCount: number;
  results: FinalGradeUpdateResult[];
}

export interface BulkUpdateFinalGradesResponse {
  success: boolean;
  message?: string;
  data: BulkUpdateFinalGradesData;
}

// Bulk update final grades
export const bulkUpdateFinalGrades = async (
  finalGrades: FinalGradeUpdate[]
): Promise<BulkUpdateFinalGradesResponse> => {
  try {
    const response = await api.put<BulkUpdateFinalGradesResponse>(
      '/api/ACAD_Enrollment/bulk-update-final-grades',
      { finalGrades } as BulkUpdateFinalGradesRequest
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk updating final grades:', error);
    throw error;
  }
};

