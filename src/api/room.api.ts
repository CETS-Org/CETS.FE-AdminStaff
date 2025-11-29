import { api, endpoint } from './api';
import type { Room, AddRoom, UpdateRoom, RoomStatistics, RoomType, RoomStatus } from '@/types/room.type';

const ROOM_ENDPOINT = '/api/FAC_Room';

// Get all rooms
export const getRooms = async (): Promise<Room[]> => {
  try {
    const response = await api.get<Room[]>(endpoint.room);
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

// Get room statuses for filters
export const getRoomStatuses = async (): Promise<RoomStatus[]> => {
  try {
    const response = await api.get<RoomStatus[]>(`${endpoint.room}/statuses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room statuses:', error);
    throw error;
  }
};

export const createRoom = async (roomData: {
  roomCode: string;
  capacity: number;
  roomTypeId: string;
  roomStatusId: string;
  onlineMeetingUrl?: string;
  isActive?: boolean;
}): Promise<Room> => {
  try {
    const response = await api.post<Room>(`${endpoint.room}`, {
      ...roomData,
      onlineMeetingUrl: roomData.onlineMeetingUrl || null,
      isActive: roomData.isActive ?? true
    });
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// Get room by ID
export const getRoomById = async (id: string): Promise<Room> => {
  try {
    const response = await api.get<Room>(`${endpoint.room}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room:', error);
    throw error;
  }
};

// Get rooms by type
export const getRoomsByType = async (roomTypeId: string): Promise<Room[]> => {
  try {
    const response = await api.get<Room[]>(`${ROOM_ENDPOINT}/type/${roomTypeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms by type:', error);
    throw error;
  }
};

// Get all room types (from CORE_LookUp)
export const getRoomTypes = async (): Promise<RoomType[]> => {
  try {
    const response = await api.get<RoomType[]>(`${endpoint.room}/types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room types:', error);
    throw error;
  }
};


// Update room
export const updateRoom = async (id: string, roomData: UpdateRoom): Promise<Room> => {
  try {
    // Prepare the update payload with all required fields
    const updatePayload = {
      roomCode: roomData.roomCode,
      capacity: Number(roomData.capacity), // Ensure capacity is a number
      roomTypeId: roomData.roomTypeId,
      roomStatusId: roomData.roomStatusId, // Now properly typed in UpdateRoom interface
      onlineMeetingUrl: roomData.onlineMeetingUrl || null,
      isActive: roomData.isActive ?? true
    };

    console.log('Sending PATCH request to:', `${endpoint.room}/${id}`);
    console.log('Request payload:', JSON.stringify(updatePayload, null, 2));

    const response = await api.patch<Room>(`${endpoint.room}/${id}`, updatePayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Update room response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating room:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Delete room (soft delete)
export const deleteRoom = async (id: string): Promise<void> => {
  try {
    await api.delete(`${endpoint.room}/${id}`);
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

// Get room statistics
export const getRoomStatistics = async (): Promise<RoomStatistics> => {
  try {
    const response = await api.get<RoomStatistics>(`${endpoint.room}/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room statistics:', error);
    throw error;
  }
};

// Mock data for development
const getMockRoomTypes = (): RoomType[] => {
  return [
    { id: '1', name: 'Classroom', description: 'Standard classroom' },
    { id: '2', name: 'Lab', description: 'Computer or science lab' },
    { id: '3', name: 'Auditorium', description: 'Large lecture hall' },
    { id: '4', name: 'Meeting Room', description: 'Conference room' },
    { id: '5', name: 'Study Room', description: 'Small study space' },
  ];
};

const getMockRooms = (): Room[] => {
  return [
    {
      id: '1',
      roomCode: 'P101',
      capacity: 30,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 0, 15).toISOString(),
      updatedAt: new Date(2024, 9, 1).toISOString(),
      updatedBy: null
    },
    {
      id: '2',
      roomCode: 'P102',
      capacity: 25,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 0, 20).toISOString(),
      updatedAt: new Date(2024, 9, 5).toISOString(),
      updatedBy: null
    },
    {
      id: '3',
      roomCode: 'P201',
      capacity: 40,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: 'https://meet.google.com/abc-defg-hij',
      isActive: true,
      createdAt: new Date(2024, 1, 10).toISOString(),
      updatedAt: new Date(2024, 9, 3).toISOString(),
      updatedBy: null
    },
    {
      id: '4',
      roomCode: 'P202',
      capacity: 35,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 2, 5).toISOString(),
      updatedAt: new Date(2024, 9, 7).toISOString(),
      updatedBy: null
    },
    {
      id: '5',
      roomCode: 'P103',
      capacity: 20,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 0, 25).toISOString(),
      updatedAt: new Date(2024, 9, 2).toISOString(),
      updatedBy: null
    },
    {
      id: '6',
      roomCode: 'P203',
      capacity: 45,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 1, 15).toISOString(),
      updatedAt: new Date(2024, 9, 4).toISOString(),
      updatedBy: null
    },
    {
      id: '7',
      roomCode: 'P301',
      capacity: 50,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: 'https://meet.google.com/xyz-abc-123',
      isActive: true,
      createdAt: new Date(2024, 2, 1).toISOString(),
      updatedAt: new Date(2024, 9, 6).toISOString(),
      updatedBy: null
    },
    {
      id: '8',
      roomCode: 'P302',
      capacity: 28,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 2, 10).toISOString(),
      updatedAt: new Date(2024, 9, 8).toISOString(),
      updatedBy: null
    },
    {
      id: '9',
      roomCode: 'LAB101',
      capacity: 30,
      roomTypeId: '2', // Lab
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 0, 30).toISOString(),
      updatedAt: new Date(2024, 9, 9).toISOString(),
      updatedBy: null
    },
    {
      id: '10',
      roomCode: 'LAB102',
      capacity: 25,
      roomTypeId: '2', // Lab
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 1, 5).toISOString(),
      updatedAt: new Date(2024, 9, 10).toISOString(),
      updatedBy: null
    },
    {
      id: '11',
      roomCode: 'AUD101',
      capacity: 100,
      roomTypeId: '3', // Auditorium
      onlineMeetingUrl: 'https://meet.google.com/aud-101-room',
      isActive: true,
      createdAt: new Date(2024, 1, 20).toISOString(),
      updatedAt: new Date(2024, 9, 11).toISOString(),
      updatedBy: null
    },
    {
      id: '12',
      roomCode: 'AUD102',
      capacity: 80,
      roomTypeId: '3', // Auditorium
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 2, 15).toISOString(),
      updatedAt: new Date(2024, 9, 12).toISOString(),
      updatedBy: null
    },
    {
      id: '13',
      roomCode: 'MR101',
      capacity: 15,
      roomTypeId: '4', // Meeting Room
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 0, 10).toISOString(),
      updatedAt: new Date(2024, 9, 13).toISOString(),
      updatedBy: null
    },
    {
      id: '14',
      roomCode: 'MR102',
      capacity: 12,
      roomTypeId: '4', // Meeting Room
      onlineMeetingUrl: 'https://meet.google.com/mr-102',
      isActive: true,
      createdAt: new Date(2024, 0, 12).toISOString(),
      updatedAt: new Date(2024, 9, 14).toISOString(),
      updatedBy: null
    },
    {
      id: '15',
      roomCode: 'SR101',
      capacity: 8,
      roomTypeId: '5', // Study Room
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 1, 1).toISOString(),
      updatedAt: new Date(2024, 9, 15).toISOString(),
      updatedBy: null
    },
    {
      id: '16',
      roomCode: 'SR102',
      capacity: 6,
      roomTypeId: '5', // Study Room
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 1, 3).toISOString(),
      updatedAt: new Date(2024, 9, 16).toISOString(),
      updatedBy: null
    },
    {
      id: '17',
      roomCode: 'P104',
      capacity: 32,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: null,
      isActive: false,
      createdAt: new Date(2024, 0, 18).toISOString(),
      updatedAt: new Date(2024, 9, 17).toISOString(),
      updatedBy: null
    },
    {
      id: '18',
      roomCode: 'P204',
      capacity: 38,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 1, 8).toISOString(),
      updatedAt: new Date(2024, 9, 18).toISOString(),
      updatedBy: null
    },
    {
      id: '19',
      roomCode: 'P303',
      capacity: 42,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 2, 12).toISOString(),
      updatedAt: new Date(2024, 9, 19).toISOString(),
      updatedBy: null
    },
    {
      id: '20',
      roomCode: 'LAB201',
      capacity: 35,
      roomTypeId: '2', // Lab
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 1, 25).toISOString(),
      updatedAt: new Date(2024, 9, 20).toISOString(),
      updatedBy: null
    },
  ];
};

const calculateMockStatistics = (rooms: Room[]): RoomStatistics => {
  return rooms.reduce((stats, room) => {
    stats.totalRooms++;
    if (room.isActive) {
      stats.activeRooms++;
    }
    // For mock purposes, we'll assume some rooms are in maintenance or unavailable
    if (room.roomStatus === 'MAINTENANCE') {
      stats.maintenanceRooms++;
    } else if (room.roomStatus === 'UNAVAILABLE') {
      stats.unavailableRooms++;
    }
    
    return stats;
  }, {
    totalRooms: 0,
    activeRooms: 0,
    maintenanceRooms: 0,
    unavailableRooms: 0
  });
};

// Map backend room schedule to RoomClassInfo structure
interface BackendRoomScheduleSlot {
  slotNumber: number;
  isBooked: boolean;
  bookingId: string | null;
  className: string | null;
  courseName: string | null;
  teacherName: string | null;
}

interface BackendRoomScheduleItem {
  roomId: string;
  roomCode: string;
  roomStatus: string;
  roomTypeName: string;
  days: Record<string, BackendRoomScheduleSlot[]>;
}

// Slot info detail for a specific room/date/slot
export interface SlotInfoResponse {
  room: {
    roomId: string;
    roomCode: string;
    roomType: string;
    status: string;
    capacity: number;
  };
  slot: {
    slotNumber: number;
    start: string;
    end: string;
    date: string;
    dayOfWeek: string;
  };
  currentClass: {
    meetingId: string;
    className: string;
    courseName: string;
    teacherName: string;
  } | null;
  isBooked: boolean;
}

// Helper: map Vietnamese day names to English for existing grid logic
const mapDayNameToEnglish = (day: string): string => {
  switch (day.trim()) {
    case "Thứ Hai":
      return "Monday";
    case "Thứ Ba":
      return "Tuesday";
    case "Thứ Tư":
      return "Wednesday";
    case "Thứ Năm":
      return "Thursday";
    case "Thứ Sáu":
      return "Friday";
    case "Thứ Bảy":
      return "Saturday";
    default:
      return day;
  }
};

// Get weekly room schedule from backend and convert to RoomClassInfo map
export const getRoomSchedule = async (
  weekStart: string,
  weekEnd: string
): Promise<Record<string, RoomClassInfo[]>> => {
  try {
    const response = await api.get<BackendRoomScheduleItem[]>(
      `${endpoint.room}/schedule`,
      {
        params: { weekStart, weekEnd },
      }
    );

    const data = response.data || [];
    const result: Record<string, RoomClassInfo[]> = {};

    data.forEach((item) => {
      const classes: RoomClassInfo[] = [];

      Object.entries(item.days || {}).forEach(([dayName, slots]) => {
        const englishDay = mapDayNameToEnglish(dayName);

        slots.forEach((slot) => {
          if (!slot.isBooked) return;

          const id = slot.bookingId || `${item.roomId}-${englishDay}-${slot.slotNumber}`;

          classes.push({
            id,
            className: slot.className || "",
            courseName: slot.courseName || "",
            teacherName: slot.teacherName || "",
            startDate: weekStart,
            endDate: weekEnd,
            dayOfWeek: englishDay,
            // RoomScheduleGrid can match either by time string or by slot number
            timeSlot: slot.slotNumber.toString(),
            roomTypeName: item.roomTypeName,
          });
        });
      });

      result[item.roomId] = classes;
    });

    return result;
  } catch (error) {
    console.error("Error fetching room schedule:", error);
    // Fallback: return empty schedule so UI still works
    return {};
  }
};

// Get detailed info for a specific room/date/slot
export const getSlotInfo = async (
  roomId: string,
  date: string,
  slotNumber: number
): Promise<SlotInfoResponse> => {
  try {
    const response = await api.get<SlotInfoResponse>(
      `${endpoint.room}/${roomId}/slot-info`,
      {
        params: { date, slotNumber },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching slot info:", error);
    throw error;
  }
};

export interface BookSlotPayload {
  classId: string;
  courseId: string;
  teacherId: string;
  roomId: string;
  slotNumber: number;
  date: string; // yyyy-MM-dd
}

export const bookSlot = async (payload: BookSlotPayload): Promise<void> => {
  try {
    await api.post(`${endpoint.room}/book-slot`, payload);
  } catch (error) {
    console.error("Error booking slot:", error);
    throw error;
  }
};

// Cancel an existing booking by meetingId
export const cancelBooking = async (meetingId: string): Promise<void> => {
  if (!meetingId) return;
  try {
    await api.delete(`${endpoint.room}/bookings/${meetingId}`);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};

// --- Booking dropdown support: courses, classes, teachers ---

export interface BookingCourse {
  id: string;
  courseCode: string;
  courseName: string;
}

export interface BookingClass {
  id: string;
  classCode: string;
  className: string;
}

export interface BookingTeacher {
  accountId: string;
  fullName: string;
}

export const getBookingCourses = async (): Promise<BookingCourse[]> => {
  try {
    const res = await api.get<BookingCourse[]>(endpoint.course);
    return res.data || [];
  } catch (error) {
    console.error("Error fetching booking courses:", error);
    return [];
  }
};

export const getBookingClassesByCourse = async (
  courseId: string
): Promise<BookingClass[]> => {
  if (!courseId) return [];
  try {
    const res = await api.get<BookingClass[]>(
      `${endpoint.classes}/course/${courseId}`
    );
    return res.data || [];
  } catch (error) {
    console.error("Error fetching booking classes:", error);
    return [];
  }
};

export const getBookingTeachersByCourse = async (
  courseId: string
): Promise<BookingTeacher[]> => {
  if (!courseId) return [];
  try {
    const res = await api.get<BookingTeacher[]>(
      `${endpoint.courseTeacherAssignment}/teachers-by-course/${courseId}`
    );
    return res.data || [];
  } catch (error) {
    console.error("Error fetching booking teachers:", error);
    return [];
  }
};

// Get classes by room ID (mock data for now)
export interface RoomClassInfo {
  id: string;
  className: string;
  courseName: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  dayOfWeek: string;
  timeSlot: string;
  roomTypeName?: string;
}

export const getClassesByRoom = async (roomId: string): Promise<RoomClassInfo[]> => {
  try {
    // TODO: Replace with actual API call when backend is ready
    // const response = await api.get<RoomClassInfo[]>(`${endpoint.room}/${roomId}/classes`);
    // return response.data;
    
    // Mock data for development
    return getMockClassesByRoom(roomId);
  } catch (error) {
    console.error('Error fetching classes by room:', error);
    return getMockClassesByRoom(roomId);
  }
};

const getMockClassesByRoom = (roomId: string): RoomClassInfo[] => {
  // Mock classes data - using 5 time slots: Slot 1 (9:00), Slot 2 (13:30), Slot 3 (15:00), Slot 4 (16:30), Slot 5 (18:00)
  const mockClasses: Record<string, RoomClassInfo[]> = {
    '1': [ // P101
      {
        id: '1',
        className: 'A12',
        courseName: 'TOEIC 58h',
        teacherName: 'John Smith',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Monday',
        timeSlot: '9:00' // Slot 1
      },
      {
        id: '2',
        className: 'B15',
        courseName: 'IELTS Foundation',
        teacherName: 'Sarah Johnson',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Monday',
        timeSlot: '13:30' // Slot 2
      },
      {
        id: '3',
        className: 'C20',
        courseName: 'Business English',
        teacherName: 'Michael Brown',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Tuesday',
        timeSlot: '9:00' // Slot 1
      },
      {
        id: '4',
        className: 'D25',
        courseName: 'Conversation Practice',
        teacherName: 'Emily Davis',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Wednesday',
        timeSlot: '15:00' // Slot 3
      },
      {
        id: '5',
        className: 'E30',
        courseName: 'Grammar Advanced',
        teacherName: 'David Wilson',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Thursday',
        timeSlot: '16:30' // Slot 4
      },
      {
        id: '6',
        className: 'F35',
        courseName: 'Kids English',
        teacherName: 'Lisa Anderson',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Friday',
        timeSlot: '18:00' // Slot 5
      },
      {
        id: '7',
        className: 'G40',
        courseName: 'Speaking Master',
        teacherName: 'Robert Taylor',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Saturday',
        timeSlot: '9:00' // Slot 1
      },
    ],
    '2': [ // P102
      {
        id: '12',
        className: 'H45',
        courseName: 'Writing Skills',
        teacherName: 'Jennifer Martinez',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Monday',
        timeSlot: '15:00' // Slot 3
      },
      {
        id: '13',
        className: 'I50',
        courseName: 'TOEFL Prep',
        teacherName: 'James Lee',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Tuesday',
        timeSlot: '13:30' // Slot 2
      },
      {
        id: '14',
        className: 'J55',
        courseName: 'Academic English',
        teacherName: 'Maria Garcia',
        startDate: '2024-10-05',
        endDate: '2024-12-20',
        dayOfWeek: 'Wednesday',
        timeSlot: '16:30' // Slot 4
      },
      {
        id: '15',
        className: 'K60',
        courseName: 'Pronunciation',
        teacherName: 'Thomas White',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Thursday',
        timeSlot: '18:00' // Slot 5
      },
      {
        id: '16',
        className: 'L65',
        courseName: 'Reading Comprehension',
        teacherName: 'Patricia Harris',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Friday',
        timeSlot: '9:00' // Slot 1
      },
    ],
    '3': [ // P201
      {
        id: '17',
        className: 'M70',
        courseName: 'Listening Skills',
        teacherName: 'Christopher Clark',
        startDate: '2024-09-25',
        endDate: '2024-12-10',
        dayOfWeek: 'Monday',
        timeSlot: '9:00' // Slot 1
      },
      {
        id: '18',
        className: 'N75',
        courseName: 'Vocabulary Building',
        teacherName: 'Amanda Lewis',
        startDate: '2024-10-10',
        endDate: '2025-01-25',
        dayOfWeek: 'Tuesday',
        timeSlot: '15:00' // Slot 3
      },
      {
        id: '19',
        className: 'O80',
        courseName: 'Test Preparation',
        teacherName: 'Daniel Walker',
        startDate: '2024-09-15',
        endDate: '2024-12-05',
        dayOfWeek: 'Wednesday',
        timeSlot: '13:30' // Slot 2
      },
      {
        id: '20',
        className: 'P85',
        courseName: 'English for Work',
        teacherName: 'Michelle Hall',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Thursday',
        timeSlot: '18:00' // Slot 5
      },
      {
        id: '21',
        className: 'Q90',
        courseName: 'Creative Writing',
        teacherName: 'Kevin Young',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Friday',
        timeSlot: '16:30' // Slot 4
      },
    ],
    '4': [ // P202
      {
        id: '24',
        className: 'R95',
        courseName: 'Public Speaking',
        teacherName: 'Nancy King',
        startDate: '2024-10-08',
        endDate: '2025-01-18',
        dayOfWeek: 'Monday',
        timeSlot: '16:30' // Slot 4
      },
      {
        id: '25',
        className: 'S100',
        courseName: 'English Literature',
        teacherName: 'Steven Wright',
        startDate: '2024-09-20',
        endDate: '2024-12-15',
        dayOfWeek: 'Tuesday',
        timeSlot: '9:00' // Slot 1
      },
      {
        id: '26',
        className: 'T105',
        courseName: 'Media English',
        teacherName: 'Laura Scott',
        startDate: '2024-10-12',
        endDate: '2025-02-10',
        dayOfWeek: 'Wednesday',
        timeSlot: '18:00' // Slot 5
      },
      {
        id: '27',
        className: 'U110',
        courseName: 'Technical English',
        teacherName: 'Ryan Green',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Thursday',
        timeSlot: '13:30' // Slot 2
      },
      {
        id: '28',
        className: 'V115',
        courseName: 'English for Travel',
        teacherName: 'Stephanie Adams',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Friday',
        timeSlot: '15:00' // Slot 3
      },
      {
        id: '29',
        className: 'W120',
        courseName: 'Phonics for Kids',
        teacherName: 'Jason Baker',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Saturday',
        timeSlot: '13:30' // Slot 2
      },
    ],
    '5': [ // P103
      {
        id: '30',
        className: 'X125',
        courseName: 'TOEIC 58h',
        teacherName: 'John Smith',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Monday',
        timeSlot: '9:00'
      },
      {
        id: '31',
        className: 'Y130',
        courseName: 'IELTS Foundation',
        teacherName: 'Sarah Johnson',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Wednesday',
        timeSlot: '15:00'
      },
    ],
    '6': [ // P203
      {
        id: '32',
        className: 'Z135',
        courseName: 'Business English',
        teacherName: 'Michael Brown',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Tuesday',
        timeSlot: '13:30'
      },
      {
        id: '33',
        className: 'AA140',
        courseName: 'Conversation Practice',
        teacherName: 'Emily Davis',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Thursday',
        timeSlot: '18:00'
      },
    ],
    '7': [ // P301
      {
        id: '34',
        className: 'AB145',
        courseName: 'Grammar Advanced',
        teacherName: 'David Wilson',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Monday',
        timeSlot: '15:00'
      },
      {
        id: '35',
        className: 'AC150',
        courseName: 'Kids English',
        teacherName: 'Lisa Anderson',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Friday',
        timeSlot: '16:30'
      },
    ],
    '8': [ // P302
      {
        id: '36',
        className: 'AD155',
        courseName: 'Speaking Master',
        teacherName: 'Robert Taylor',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Tuesday',
        timeSlot: '9:00'
      },
    ],
    '9': [ // LAB101
      {
        id: '37',
        className: 'AE160',
        courseName: 'Writing Skills',
        teacherName: 'Jennifer Martinez',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Wednesday',
        timeSlot: '13:30'
      },
      {
        id: '38',
        className: 'AF165',
        courseName: 'TOEFL Prep',
        teacherName: 'James Lee',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Friday',
        timeSlot: '15:00'
      },
    ],
    '10': [ // LAB102
      {
        id: '39',
        className: 'AG170',
        courseName: 'Academic English',
        teacherName: 'Maria Garcia',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Monday',
        timeSlot: '18:00'
      },
    ],
    '11': [ // AUD101
      {
        id: '40',
        className: 'AH175',
        courseName: 'Pronunciation',
        teacherName: 'Thomas White',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Tuesday',
        timeSlot: '16:30'
      },
      {
        id: '41',
        className: 'AI180',
        courseName: 'Reading Comprehension',
        teacherName: 'Patricia Harris',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Thursday',
        timeSlot: '9:00'
      },
    ],
    '12': [ // AUD102
      {
        id: '42',
        className: 'AJ185',
        courseName: 'Listening Skills',
        teacherName: 'Christopher Clark',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Wednesday',
        timeSlot: '18:00'
      },
    ],
    '13': [ // MR101
      {
        id: '43',
        className: 'AK190',
        courseName: 'Vocabulary Building',
        teacherName: 'Amanda Lewis',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Monday',
        timeSlot: '13:30'
      },
    ],
    '14': [ // MR102
      {
        id: '44',
        className: 'AL195',
        courseName: 'Test Preparation',
        teacherName: 'Daniel Walker',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Thursday',
        timeSlot: '15:00'
      },
    ],
    '15': [ // SR101
      {
        id: '45',
        className: 'AM200',
        courseName: 'English for Work',
        teacherName: 'Michelle Hall',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Friday',
        timeSlot: '13:30'
      },
    ],
    '18': [ // P204
      {
        id: '46',
        className: 'AN205',
        courseName: 'Creative Writing',
        teacherName: 'Kevin Young',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Tuesday',
        timeSlot: '18:00'
      },
      {
        id: '47',
        className: 'AO210',
        courseName: 'Public Speaking',
        teacherName: 'Nancy King',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Thursday',
        timeSlot: '9:00'
      },
    ],
    '19': [ // P303
      {
        id: '48',
        className: 'AP215',
        courseName: 'English Literature',
        teacherName: 'Steven Wright',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Monday',
        timeSlot: '16:30'
      },
      {
        id: '49',
        className: 'AQ220',
        courseName: 'Media English',
        teacherName: 'Laura Scott',
        startDate: '2024-09-30',
        endDate: '2024-12-30',
        dayOfWeek: 'Wednesday',
        timeSlot: '9:00'
      },
    ],
    '20': [ // LAB201
      {
        id: '50',
        className: 'AR225',
        courseName: 'Technical English',
        teacherName: 'Ryan Green',
        startDate: '2024-10-01',
        endDate: '2025-01-15',
        dayOfWeek: 'Friday',
        timeSlot: '18:00'
      },
    ],
  };

  return mockClasses[roomId] || [];
};


