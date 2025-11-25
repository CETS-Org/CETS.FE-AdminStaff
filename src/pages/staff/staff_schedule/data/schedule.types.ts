// src/pages/staff/schedule/data/schedule.types.ts

// ======================================================
// 1. Common / Shared Types
// ======================================================

export interface LookupOption {
  value: string; 
  label: string; 
}

// Model Room trả về từ API getRoomOptions
export interface RoomOptionDTO {
  id: string;
  roomCode: string;
  capacity: number;
  isActive: boolean;
  onlineMeetingUrl?: string;
}

// ======================================================
// 2. Response DTOs (READ)
// ======================================================

// Mapping: DTOs.ACAD.ACAD_ClassMeetings.Responses.ClassMeetingResponse
export interface ClassMeetingResponseDTO {
  id: string;              // Guid
  classID: string;         // Guid
  date: string;            // "yyyy-MM-dd"
  isStudy: boolean;

  // BE trả RoomID là string (RoomCode), không phải Guid
  roomID?: string;
  roomCode?: string;

  coveredTopic?: string;   // CoveredTopic
  courseName?: string;     // CourseName
  courseId?:string;
  teacherName?: string;    // TeacherName
 teacherAssignmentID?: string;
  onlineMeetingUrl?: string;
  passcode?: string;
  recordingUrl?: string;
  progressNote?: string;

  isActive: boolean;
  isDeleted: boolean;

  slot: string;            // Tên slot hiển thị (vd: "Slot 1")

  // BE DTO hiện không có SlotID nên bỏ, hoặc để lại nếu sau này bổ sung:
  slotID?: string;
}

// ======================================================
// 3. Request Payloads (WRITE)
// ======================================================

// Mapping: DTOs.ACAD.ACAD_ClassMeetings.Requests.UpdateClassMeetingRequest
export interface UpdateClassMeetingRequestDTO {
  id: string;                // Guid
  slotID: string;            // Guid (Bắt buộc)
  date: string;              // "yyyy-MM-dd"
  isStudy: boolean;
  
  roomID?: string;           // Guid?
  teacherAssignmentID?: string; // Guid?
  
  onlineMeetingUrl?: string;
  passcode?: string;
  recordingUrl?: string;
  
  /*coveredTopicID: string;*/    // Guid
  
  isActive: boolean;
  isDeleted: boolean;
}

// ======================================================
// 4. UI Filter Options
// ======================================================

export interface CourseOption {
  id: string;           
  courseCode: string;   
  courseName: string;   
  courseImageUrl?: string; 
  levelName?: string;   
  formatName?: string;  
  isActive?: boolean;
}

export interface ClassStaffViewDTO {
  id: string;               // Guid
  className: string;        // "IELTS A1"
  courseName: string;       // "IELTS Intensive"
  teacherName: string;      // "Mr. John"
  classStatus: string;      // "Active"
  classFormat: string;      // "Offline"
  startDate: string;        // DateOnly
  endDate: string;          // DateOnly
  capacity: number;         // 20
  enrolledCount: number;    // 15
  isActive: boolean;
}

// Helper type cho Dropdown (nếu cần map sang dạng chuẩn)
export interface ClassFilterOption {
  id: string;
  name: string; // Map từ className
  teacher?: string;
  students?: string; // "15/20"
}


export interface CreateClassMeetingRequestDTO {
  classID: string;           // Guid - Required
  slotID: string;            // Guid - Required
  date: string;              // DateOnly "yyyy-MM-dd" - Required
  
  roomID?: string;           // Guid? - Nullable
  teacherAssignmentID?: string; // Guid? - Nullable
  
  onlineMeetingUrl?: string; // string?
  passcode?: string;         // string?
  progressNote?: string;     // string?
  
  coveredTopicID: string;    // Guid - Required (Non-nullable in C# DTO)
}