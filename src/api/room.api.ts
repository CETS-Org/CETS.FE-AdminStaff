import { api, endpoint } from './api';
import type { Room, AddRoom, UpdateRoom, RoomStatistics, RoomType } from '@/types/room.type';

const ROOM_ENDPOINT = '/api/FAC_Room';

// Get all rooms
export const getRooms = async (): Promise<Room[]> => {
  try {
    const response = await api.get<Room[]>(ROOM_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

// Get room by ID
export const getRoomById = async (id: string): Promise<Room> => {
  try {
    const response = await api.get<Room>(`${ROOM_ENDPOINT}/${id}`);
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
    // Room types are stored in CORE_LookUp with type "RoomType"
    const response = await api.get(`/api/CORE_LookUp/type/code/RoomType`);
    return response.data;
  } catch (error) {
    console.error('Error fetching room types:', error);
    throw error;
  }
};

// Create new room
export const createRoom = async (roomData: AddRoom): Promise<Room> => {
  try {
    const response = await api.post<Room>(ROOM_ENDPOINT, roomData);
    return response.data;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// Update room
export const updateRoom = async (id: string, roomData: UpdateRoom): Promise<Room> => {
  try {
    const response = await api.put<Room>(`${ROOM_ENDPOINT}/${id}`, roomData);
    return response.data;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

// Delete room (soft delete)
export const deleteRoom = async (id: string): Promise<void> => {
  try {
    await api.delete(`${ROOM_ENDPOINT}/${id}`);
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

// Get room statistics
export const getRoomStatistics = async (): Promise<RoomStatistics> => {
  try {
    // This endpoint might not exist, you may need to implement it in the backend
    // For now, we'll calculate it from all rooms
    const rooms = await getRooms();
    return calculateRoomStatistics(rooms);
  } catch (error) {
    console.error('Error fetching room statistics:', error);
    throw error;
  }
};

// Helper function to calculate statistics
const calculateRoomStatistics = (rooms: Room[]): RoomStatistics => {
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


