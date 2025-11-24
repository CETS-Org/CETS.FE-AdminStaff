import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { Room, RoomType } from '@/types/room.type';
import { DoorOpen, Users, Tag, Link as LinkIcon, Calendar, Clock, Activity, Hash } from 'lucide-react';
import { formatDate } from "@/helper/helper.service";

interface RoomDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  roomTypes: RoomType[];
}

export default function RoomDetailDialog({
  open,
  onOpenChange,
  room,
  roomTypes,
}: RoomDetailDialogProps) {
  if (!room) return null;

  const getRoomTypeName = (roomTypeId: string): string => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    return roomType?.name || 'Unknown';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] mt-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-primary-600" />
            Room Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pb-4">
          {/* Room Header */}
          <div className="text-center pb-4 border-b">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <DoorOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{room.roomCode}</h3>
            <p className="text-sm text-gray-600">{getRoomTypeName(room.roomTypeId)}</p>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                room.isActive 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  room.isActive ? 'bg-green-500' : 'bg-amber-500'
                }`} />
                {room.isActive ? 'Active' : 'Maintenance'}
              </span>
            </div>
          </div>

          {/* Room Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Hash className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">Room Code</label>
                <p className="text-sm font-medium text-gray-900 font-mono truncate">{room.roomCode}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Tag className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">Room Type</label>
                <p className="text-sm font-medium text-gray-900 truncate">{getRoomTypeName(room.roomTypeId)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Capacity</label>
                <p className="text-sm font-medium text-gray-900">{room.capacity} people</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <p className="text-sm font-medium text-gray-900">{room.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">Created</label>
                <p className="text-sm font-medium text-gray-900 truncate">{formatDate(room.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Updated</label>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {room.updatedAt ? formatDate(room.updatedAt) : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Online Meeting URL */}
          {room.onlineMeetingUrl && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-600" />
                Online Meeting URL
              </label>
              <a 
                href={room.onlineMeetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
              >
                {room.onlineMeetingUrl}
              </a>
            </div>
          )}

          {!room.onlineMeetingUrl && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-gray-400" />
                No online meeting URL configured
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

