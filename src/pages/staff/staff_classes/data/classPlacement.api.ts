// src/pages/staff/staff_classes/data/classPlacement.api.ts
import type { AxiosRequestConfig } from "axios";
import { endpoint } from "@/api";
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
  WaitingStudentItem,
  UpdateClassCompositeRequestDTO,
  PostponedClassNotifyRequest,
  ClassDetailResponseDTO,
} from "@/pages/staff/staff_classes/data/classPlacement.types";

// ================== COURSE ==================

export const getCourseOptions = (config?: AxiosRequestConfig) =>
  api.get<CourseOption[]>(`${endpoint.course}`, config);

export const getCourseDetail = (courseId: string, config?: AxiosRequestConfig) =>
  api.get<CourseDetail>(`${endpoint.course}/${courseId}`, config);

export const getCourseSchedule = (courseId: string, config?: AxiosRequestConfig) =>
  api.get<CourseScheduleRow[]>(`${endpoint.courseShedule}/course/${courseId}/`, config);

// ================== ROOM (MỞ RỘNG) ==================

type GetAvailableRoomsArgs = {
  courseId: string;
  schedules: ClassScheduleInput[];
  startDate: string; // "yyyy-MM-dd"
  endDate: string;   // "yyyy-MM-dd"
};
export const getRoomOptions = (config?: AxiosRequestConfig) =>
  api.get<RoomOption[]>(`${endpoint.room}`, config);
/*
export const getRoomOptions = (
  args: {
    schedules: ClassScheduleInput[];
    startDate: string;
    endDate: string;
  },
  config?: AxiosRequestConfig
) =>
  api.post<RoomOption[]>(
    `${endpoint.room}/available-rooms`,
    {
      schedules: args.schedules,
      startDate: args.startDate,
      endDate: args.endDate
    },
    config
  );
*/
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
    {
      ...config,
      params: {
        ...(config?.params as any),
        courseId,
        q: query,
        page,
      },
    }
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
  api.post<{ Id: string; Message: string }>(
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
    `${endpoint.classMeetings}`,
    payload,
    config
  );

// 3. Composite: tạo Class + Meetings + Enrollments
export const createClassComposite = (
  payload: CreateClassCompositeRequestDTO,
  config?: AxiosRequestConfig
) =>
  api.post<{ Id: string; Message: string }>(
    `api/ACAD_Classes/composite`,
    payload,
    config
  );

// 4. Gán học sinh vào lớp
export const assignStudentsToClass = (
  payload: BulkAssignClassRequestDTO,
  config?: AxiosRequestConfig
) =>
  api.put<{ message: string }>(
    `${endpoint.enrollment}/placement/assign-class`,
    payload,
    config
  );

// 5. Gửi email hoãn / dời lớp
export const sendPostponedClassEmail = (
  payload: PostponedClassNotifyRequest,
  config?: AxiosRequestConfig
) =>
  api.post<{ message: string; details: any[] }>(
    `${endpoint.email}/notify`,
    payload,
    config
  );

// 6. Lấy chi tiết class để Edit
export const getClassDetailForEdit = (
  classId: string,
  config?: AxiosRequestConfig
) =>
  api.get<ClassDetailResponseDTO>(
    `${endpoint.classes}/${classId}/detail-for-edit`,
    config
  );

// 7. Composite Update: cập nhật class + enrollments
export const updateClassComposite = (
  classId: string,
  payload: UpdateClassCompositeRequestDTO,
  config?: AxiosRequestConfig
) =>
  api.put<{ message: string }>(
    `${endpoint.classes}/${classId}/composite`,
    payload,
    config
  );
