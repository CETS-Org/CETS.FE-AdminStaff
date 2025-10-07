// Timetable and Timeslot Type Definitions

export interface Timeslot {
  id: string;
  slotNumber: number;
  slotName: string;
  startTime: string; // Format: "HH:mm"
  endTime: string;   // Format: "HH:mm"
  duration: number;  // Duration in minutes
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimetableEntry {
  id: string;
  timeslotId: string;
  timeslot?: Timeslot;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  classId?: string;
  className?: string;
  teacherId?: string;
  teacherName?: string;
  roomId?: string;
  roomName?: string;
  courseId?: string;
  courseName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTimeslotDto {
  slotNumber: number;
  slotName: string;
  startTime: string;
  endTime: string;
  duration?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTimeslotDto extends Partial<CreateTimeslotDto> {
  id: string;
}

export interface TimeslotFilter {
  search?: string;
  isActive?: boolean;
  slotNumber?: number;
}

export interface TimetableFilter {
  dayOfWeek?: number;
  timeslotId?: string;
  classId?: string;
  teacherId?: string;
  roomId?: string;
}

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const DEFAULT_TIMESLOTS: Omit<Timeslot, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { slotNumber: 1, slotName: 'Slot 1', startTime: '07:00', endTime: '08:30', duration: 90, isActive: true },
  { slotNumber: 2, slotName: 'Slot 2', startTime: '08:45', endTime: '10:15', duration: 90, isActive: true },
  { slotNumber: 3, slotName: 'Slot 3', startTime: '10:30', endTime: '12:00', duration: 90, isActive: true },
  { slotNumber: 4, slotName: 'Slot 4', startTime: '13:00', endTime: '14:30', duration: 90, isActive: true },
  { slotNumber: 5, slotName: 'Slot 5', startTime: '14:45', endTime: '16:15', duration: 90, isActive: true },
  { slotNumber: 6, slotName: 'Slot 6', startTime: '16:30', endTime: '18:00', duration: 90, isActive: true },
  { slotNumber: 7, slotName: 'Slot 7', startTime: '18:15', endTime: '19:45', duration: 90, isActive: true },
  { slotNumber: 8, slotName: 'Slot 8', startTime: '20:00', endTime: '21:30', duration: 90, isActive: true },
];

