import { useMemo } from "react";
import Card from "@/components/ui/Card";
import { TrendingUp, Calendar, Clock, AlertCircle } from "lucide-react";
import type { Room } from "@/types/room.type";
import type { RoomClassInfo } from "@/api/room.api";

interface ScheduleStatisticsProps {
  rooms: Room[];
  classesByRoom: Record<string, RoomClassInfo[]>;
  currentWeek: Date;
}

export default function ScheduleStatistics({
  rooms,
  classesByRoom,
  currentWeek,
}: ScheduleStatisticsProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    if (!rooms || rooms.length === 0) {
      return {
        utilizationRate: 0,
        totalBookings: 0,
        availableSlots: 0,
        mostUsedRoom: null,
        mostUsedRoomBookings: 0,
      };
    }

    const totalSlots = rooms.length * 6 * 5; // rooms * days (Mon-Sat) * slots
    const bookedSlots = Object.values(classesByRoom || {}).reduce((acc, classes) => {
      return acc + (classes?.length || 0);
    }, 0);
    const utilizationRate = totalSlots > 0 
      ? Math.round((bookedSlots / totalSlots) * 100) 
      : 0;
    
    // Find most used room
    const mostUsedRoom = rooms.length > 0
      ? rooms.reduce((max, room) => {
          const roomBookings = (classesByRoom[room.id] || []).length;
          const maxBookings = (classesByRoom[max.id] || []).length;
          return roomBookings > maxBookings ? room : max;
        }, rooms[0])
      : null;

    return {
      utilizationRate,
      totalBookings: bookedSlots,
      availableSlots: totalSlots - bookedSlots,
      mostUsedRoom,
      mostUsedRoomBookings: mostUsedRoom 
        ? (classesByRoom[mostUsedRoom.id] || []).length 
        : 0,
    };
  }, [rooms, classesByRoom]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Utilization Rate */}
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Utilization</p>
            <p className="text-2xl font-bold text-gray-900">{stats.utilizationRate}%</p>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Total Bookings */}
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </Card>

      {/* Most Used Room */}
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Most Used</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.mostUsedRoom?.roomCode || "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.mostUsedRoomBookings} bookings
            </p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </Card>

      {/* Available Slots */}
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Available</p>
            <p className="text-2xl font-bold text-gray-900">{stats.availableSlots}</p>
            <p className="text-xs text-gray-500 mt-1">Slots remaining</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}

