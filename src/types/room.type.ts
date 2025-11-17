export interface Room {
  id: string;
  roomCode: string;
  capacity: number;
  roomTypeId: string;
  onlineMeetingUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface AddRoom {
  roomCode: string;
  capacity: number;
  roomTypeId: string;
  onlineMeetingUrl?: string | null;
}

export interface UpdateRoom {
  roomCode: string;
  capacity: number;
  roomTypeId: string;
  onlineMeetingUrl?: string | null;
  isActive: boolean;
}

export interface RoomStatistics {
  totalRooms: number;
  activeRooms: number;
  inactiveRooms: number;
  totalCapacity: number;
}

// Room Type for selection/display
export interface RoomType {
  id: string;
  name: string;
  description?: string | null;
}

