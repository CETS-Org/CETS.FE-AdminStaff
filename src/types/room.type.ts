export interface Room {
  id: string;
  roomCode: string;
  capacity: number;
  roomTypeId: string;
  roomTypeName?: string;
  roomStatusId?: string; // ID of the room status
  roomStatus?: string; // status code from backend if available (deprecated, use roomStatusId)
  roomStatusName?: string; // human-readable name from backend, e.g. "Available Room", "In Use Room"
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
  roomStatusId: string;
  onlineMeetingUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateRoom {
  roomCode: string;
  capacity: number;
  roomTypeId: string;
  roomStatusId?: string; // Add roomStatusId to match API requirements
  onlineMeetingUrl?: string | null;
  isActive: boolean;
}

export interface RoomStatistics {
  totalRooms: number;
  activeRooms: number;
  maintenanceRooms: number;
  unavailableRooms: number;
}

// Room Type for selection/display
export interface RoomType {
  id: string;
  name: string;
  description?: string | null;
}

export interface RoomStatus {
  id: string;
  code: string; // e.g. Available, In Use, Reserved, Maintenance
  name: string;
}

