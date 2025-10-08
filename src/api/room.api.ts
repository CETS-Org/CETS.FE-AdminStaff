import { api, endpoint } from './api';
import type { Room, AddRoom, UpdateRoom, RoomStatistics, RoomType } from '@/types/room.type';

// Get all rooms
export const getRooms = async (): Promise<Room[]> => {
  try {
    const response = await api.get<Room[]>('/rooms');
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    // Return mock data for development
    return getMockRooms();
  }
};

// Get room by ID
export const getRoomById = async (id: string): Promise<Room> => {
  try {
    const response = await api.get<Room>(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room:', error);
    // Return mock data for development
    const rooms = getMockRooms();
    const room = rooms.find(r => r.id === id);
    if (!room) throw new Error('Room not found');
    return room;
  }
};

// Get all room types
export const getRoomTypes = async (): Promise<RoomType[]> => {
  try {
    const response = await api.get<RoomType[]>('/room-types');
    return response.data;
  } catch (error) {
    console.error('Error fetching room types:', error);
    // Return mock data for development
    return getMockRoomTypes();
  }
};

// Create new room
export const createRoom = async (roomData: AddRoom): Promise<Room> => {
  try {
    const response = await api.post<Room>('/rooms', roomData);
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// Update room
export const updateRoom = async (id: string, roomData: UpdateRoom): Promise<Room> => {
  try {
    const response = await api.put<Room>(`/rooms/${id}`, roomData);
    return response.data;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

// Delete room (soft delete)
export const deleteRoom = async (id: string): Promise<void> => {
  try {
    await api.delete(`/rooms/${id}`);
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

// Get room statistics
export const getRoomStatistics = async (): Promise<RoomStatistics> => {
  try {
    const response = await api.get<RoomStatistics>('/rooms/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching room statistics:', error);
    // Return mock statistics for development
    const rooms = getMockRooms();
    return calculateMockStatistics(rooms);
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
      roomCode: 'CL-101',
      capacity: 30,
      roomTypeId: '2', // Lab
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 0, 15).toISOString(),
      updatedAt: new Date(2024, 9, 1).toISOString(),
      updatedBy: null
    },
    {
      id: '2',
      roomCode: 'LH-201',
      capacity: 100,
      roomTypeId: '3', // Auditorium
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 0, 20).toISOString(),
      updatedAt: new Date(2024, 9, 5).toISOString(),
      updatedBy: null
    },
    {
      id: '3',
      roomCode: 'CR-301',
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
      roomCode: 'SL-102',
      capacity: 25,
      roomTypeId: '2', // Lab
      onlineMeetingUrl: null,
      isActive: false,
      createdAt: new Date(2024, 2, 5).toISOString(),
      updatedAt: new Date(2024, 9, 7).toISOString(),
      updatedBy: null
    },
    {
      id: '5',
      roomCode: 'MR-401',
      capacity: 15,
      roomTypeId: '4', // Meeting Room
      onlineMeetingUrl: 'https://zoom.us/j/123456789',
      isActive: true,
      createdAt: new Date(2024, 2, 15).toISOString(),
      updatedAt: new Date(2024, 9, 2).toISOString(),
      updatedBy: null
    },
    {
      id: '6',
      roomCode: 'CR-302',
      capacity: 35,
      roomTypeId: '1', // Classroom
      onlineMeetingUrl: null,
      isActive: true,
      createdAt: new Date(2024, 3, 1).toISOString(),
      updatedAt: new Date(2024, 9, 4).toISOString(),
      updatedBy: null
    },
  ];
};

const calculateMockStatistics = (rooms: Room[]): RoomStatistics => {
  const totalRooms = rooms.length;
  const activeRooms = rooms.filter(r => r.isActive).length;
  const inactiveRooms = rooms.filter(r => !r.isActive).length;
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);

  return {
    totalRooms,
    activeRooms,
    inactiveRooms,
    totalCapacity
  };
};

