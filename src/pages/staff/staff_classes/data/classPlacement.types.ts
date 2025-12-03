// src/pages/staff/staff_classes/data/classPlacement.types.ts

// ======================================================
// 1. Common Definitions (Time & Date)
// ======================================================

export const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

// Helper: Map thứ sang số để tính toán ngày (0 = Sunday, 1 = Monday...)
export const DAY_MAP: Record<string, number> = {
  "Sunday": 0,
  "Monday": 1,
  "Tuesday": 2,
  "Wednesday": 3,
  "Thursday": 4,
  "Friday": 5,
  "Saturday": 6,
};

export interface TimeSlot {
  id: string;
  name: string;        
  startTime: string;   
  endTime: string;     
  displayTime: string; 
}

// ======================================================
// 2. DTOs Mapping (Khớp với C# Request Models)
// ======================================================

// Mapping: CreateClassRequest.cs
export interface CreateClassRequestDTO {
  classStatusID: string;       // Guid
  courseFormatID?: string;     // Guid?
  teacherAssignmentID?: string;// Guid?
  startDate: string;           // DateOnly string (yyyy-MM-dd)
  endDate: string;             // DateOnly string (yyyy-MM-dd)
  capacity: number;            // int
  createdBy: string;           // Guid (User ID)
}

// Mapping: CreateClassMeetingRequest.cs
export interface CreateClassMeetingRequestDTO {
  classID: string;             // Guid
  slotID: string;              // Guid
  date: string;                // DateOnly string (yyyy-MM-dd)
  roomID?: string;             // Guid?
  teacherAssignmentID?: string;// Guid?
  onlineMeetingUrl?: string;
  passcode?: string;
  progressNote?: string;
  syllabusID?: string;     // Guid
}

// Mapping: BulkAssignClassRequest.cs (API mới thêm bên Enrollment)
export interface BulkAssignClassRequestDTO {
  classID: string;
  courseID: string;
  studentIDs: string[];
  newStatusID: string;
}

export interface ClassMeetingScheduleDTO {
  slotID: string;
  date: string;      // "yyyy-MM-dd"
  roomID?: string;
  syllabusItemID: string;
  scheduleDescription?: string; // Chuỗi "Monday (08:00)..."
}

  export interface CreateClassCompositeRequestDTO {
    // --- Phần Class ---
    classStatusID: string;
    courseFormatID?: string;
    teacherAssignmentID?: string;
    startDate: string;
    endDate: string;
    capacity: number;
    createdBy: string;
    className?: string; // Backend có thể tự gen, nhưng cứ để đây nếu cần

    // --- Phần Meetings (Mới) ---
    schedules: ClassMeetingScheduleDTO[];
    
    // --- Phần Học sinh ( gộp việc add Class  luôn bước này) ---
    enrollments?: WaitingStudentItem[]; 
  }

// ======================================================
// 3. Shared Types for UI
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

export interface CourseDetail {
  id: string;
  courseName: string;
  description?: string;
  defaultMaxStudents?: number;
  totalSessions?: number;
  // ... các trường khác tuỳ API getDetail trả về
}

export interface CourseScheduleRow {
  id: string;
  courseID: string;
  timeSlotID: string;      
  dayOfWeek: DayOfWeek;       
  courseName?: string;     
  timeSlotName?: string;  
  createdAt?: string;
  updatedAt?: string | null;
}

export interface TeacherOption {
  id: string;              
  teacherId?: string; // Tuỳ backend trả về id hay teacherId
  fullName: string;
  displayName?: string; // Fallback nếu fullName null
  email?: string;
  phone?: string;
  rating?: number;
  yearsExperience?: number;
  canTeachOnline?: boolean;
  canTeachOffline?: boolean;
}

export interface WaitingStudentSearchResult {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  items: WaitingStudentItem[]; // Sử dụng WaitingStudentItem hoặc StudentInfo tuỳ code cũ
}

export interface WaitingStudentItem {
  studentId: string;
  studentCode: string;
  fullName: string;
  phone?: string;
  email?: string;
  enrollmentId?: string;
}

export interface ClassScheduleInput {
  dayOfWeek: number; 
  timeSlotID: string;  
}

export interface RoomOption {
  id: string;           // "019a4d8b..."
  roomCode: string;     // "A101" (Thay vì 'name')
  capacity: number;     // 30
  isActive: boolean;    // true
  // Các trường khác nếu cần dùng sau này
  onlineMeetingUrl?: string;
}

// [NEW] Payload cho gửi mail hoãn lớp
export interface PostponedStudentItem {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
}

export interface PostponedClassNotifyRequest {
  courseName: string;
  plannedStartDate: string; // DateTime string
  students: PostponedStudentItem[];
}

export interface ClassDetailResponseDTO {
  id: string;
  courseId: string;
  className: string;
  teacherAssignmentID?: string;
  TeacherName?: string;
  roomId?: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: "active" | "inactive" | "full";
  
  // Danh sách lịch học
  schedules: ClassMeetingScheduleDTO[]; 
  
  // Danh sách học viên đang học
  enrollments: WaitingStudentItem[]; 
}

export interface UpdateClassCompositeRequestDTO {
  className: string;
  teacherAssignmentID?: string;
  startDate: string;
  endDate: string;
  capacity: number;
  updatedBy: string;
  
  
  enrollmentIds: string[]; 
  

}