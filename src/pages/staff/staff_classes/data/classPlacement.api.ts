// src/pages/staff/staff_classes/data/classPlacement.api.ts
import type { AxiosRequestConfig } from "axios";
import { endpoint } from "@/api"; // Đảm bảo file api config của bạn có các endpoint này
import { api } from "@/api/api";
import type {
  CourseOption,
  CourseDetail,
  CourseScheduleRow,
  TeacherOption,
  RoomOption,
  WaitingStudentSearchResult,
  CreateClassRequestDTO,
  CreateClassMeetingRequestDTO,
  BulkAssignClassRequestDTO,
  ClassScheduleInput,
  CreateClassCompositeRequestDTO,
  WaitingStudentItem
} from "@/pages/staff/staff_classes/data/classPlacement.types";

// ================== COURSE ==================

export const getCourseOptions = (config?: AxiosRequestConfig) =>
  api.get<CourseOption[]>(`${endpoint.course}`, config);

export const getCourseDetail = (courseId: string, config?: AxiosRequestConfig) =>
  api.get<CourseDetail>(`${endpoint.course}/${courseId}`, config);

export const getCourseSchedule = (courseId: string, config?: AxiosRequestConfig) =>
  api.get<CourseScheduleRow[]>(`${endpoint.courseShedule}/course/${courseId}/`, config);
export const getRoomOptions = (config?: AxiosRequestConfig) =>
  api.get<RoomOption[]>(`${endpoint.room}`, config);



// ================== TEACHER ==================

export const getAvailableTeachersForClass = (
  args: {
    courseId: string;
    schedules: ClassScheduleInput[]; 
    startDate: string;
    endDate: string;
  },
  config?: AxiosRequestConfig
) =>
  api.post<TeacherOption[]>(
    `${endpoint.courseTeacherAssignment}/available-teachers`,
    {
      courseId: args.courseId,
      schedules: args.schedules,
      startDate: args.startDate,
      endDate: args.endDate,
    },
    config
  );

// ================== STUDENTS ==================

export const searchWaitingStudents = (
  courseId: string,
  query: string,
  page: number,
  config?: AxiosRequestConfig
) =>
  api.get<WaitingStudentSearchResult>(
    `${endpoint.enrollment}/waiting-students`,
    { ...config, params: { ...(config?.params as any), courseId, q: query, page } }
  );

export const autoPickWaitingStudents = (
  courseId: string,
  maxCount: number,
  config?: AxiosRequestConfig
) =>
  api.post<WaitingStudentItem[]>(
    `${endpoint.classReservation}/auto-pick`,
    { courseId, maxCount },
    config
  );

// ================== ORCHESTRATION APIs (NEW) ==================

// 1. Tạo Class (ACAD_ClassesController)
export const createClass = (
  payload: CreateClassRequestDTO,
  config?: AxiosRequestConfig
) =>
  api.post<{ Id: string; Message: string }>( // Chú ý chữ hoa/thường tuỳ backend return
    `${endpoint.classes}`, 
    payload,
    config
  );

// 2. Tạo Meeting (ACAD_ClassMeetingsController)
export const createClassMeeting = (
  payload: CreateClassMeetingRequestDTO,
  config?: AxiosRequestConfig
) =>
  api.post<{ Id: string; Message: string }>(
    `${endpoint.classMeetings}`, // Cần cấu hình endpoint này trong file api constants
    payload,
    config
  );

export const createClassComposite = (
  payload: CreateClassCompositeRequestDTO,
  config?: AxiosRequestConfig
) =>
  api.post<{ Id: string; Message: string }>(
    `api/ACAD_Classes/composite`, // Endpoint backend chúng ta vừa tạo
    payload,
    config
  );
  

// 3. Gán học sinh (ACAD_EnrollmentController)
export const assignStudentsToClass = (
  payload: BulkAssignClassRequestDTO,
  config?: AxiosRequestConfig
) =>
  api.put<{ message: string }>(
    `${endpoint.enrollment}/placement/assign-class`,
    payload,
    config
  );