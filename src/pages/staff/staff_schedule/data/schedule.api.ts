// src/pages/staff/schedule/data/schedule.api.ts
import type { AxiosRequestConfig } from 'axios';
import { api } from '@/api/api'; 
import { endpoint } from '@/api'; // Endpoint config chung của dự án
import type { 
  ClassMeetingResponseDTO, 
  UpdateClassMeetingRequestDTO,
  CourseOption,
  ClassStaffViewDTO,
  ClassFilterOption,
  CreateClassMeetingRequestDTO,
  RoomOptionDTO
} from './schedule.types';



// ================== OPTIONS APIs ==================

// Lấy danh sách Room (Dùng chung endpoint với ClassPlacement hoặc gọi trực tiếp)
export const getRoomOptions = (config?: AxiosRequestConfig) =>
  api.get<RoomOptionDTO[]>(`${endpoint.room}`, config);

export const getCourseOptions = (config?: AxiosRequestConfig) =>
  api.get<CourseOption[]>(`${endpoint.course}`, config);

export const getClassOptions = (courseId: string, config?: AxiosRequestConfig) =>
  api.get<ClassStaffViewDTO[]>(`${endpoint.classes}/staff-view-byCourse`, { 
    ...config, 
    params: { ...config?.params, courseId } // Truyền courseId bắt buộc
  });

// ================== MAIN SCHEDULE APIs ==================

// [HttpGet("{classId}")] GetAllClassMeetingByClassIdAs
export const getClassMeetingsByClassId = (classId: string, config?: AxiosRequestConfig) =>
  api.get<ClassMeetingResponseDTO[]>(`${endpoint.classMeetings}/${classId}`, config);

// [HttpPut("{id:guid}")] UpdateMeeting
export const updateClassMeeting = (payload: UpdateClassMeetingRequestDTO, config?: AxiosRequestConfig) =>
  api.put<void>(`${endpoint.classMeetings}/${payload.id}`, payload, config);

export const createClassMeeting = (
  payload: CreateClassMeetingRequestDTO, 
  config?: AxiosRequestConfig
) =>
  api.post<{ Id: string; Message: string }>(
    `${endpoint.classMeetings}`, 
    payload, 
    config
  );

// Helper: Soft Delete via Update
export const deleteClassMeeting = (data: ClassMeetingResponseDTO, slotId: string, config?: AxiosRequestConfig) => {
  const payload: UpdateClassMeetingRequestDTO = {
     id: data.id,
     slotID: slotId, // Bắt buộc phải có SlotID để Valid Model
     date: data.date,
     isStudy: data.isStudy,
     roomID: data.roomID,
     /*coveredTopicID: "00000000-0000-0000-0000-000000000000", */
     isActive: true,  
     isDeleted: true   
  };
  return api.put<void>(`${endpoint.classMeetings}/${data.id}`, payload, config);
}