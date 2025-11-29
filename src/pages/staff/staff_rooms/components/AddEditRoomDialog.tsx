import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import type { Room, AddRoom, UpdateRoom, RoomType, RoomStatus } from '@/types/room.type';
import { getRoomStatuses, createRoom } from '@/api/room.api';
import { DoorOpen, Users, Tag, Link as LinkIcon, Loader2, Trash2, Activity } from 'lucide-react';

interface AddEditRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  roomTypes: RoomType[];
  onSave: (data: AddRoom | UpdateRoom) => void;
  onDelete?: (room: Room) => void;
  isLoading?: boolean;
}

export default function AddEditRoomDialog({
  open,
  onOpenChange,
  room,
  roomTypes,
  onSave,
  onDelete,
  isLoading = false,
}: AddEditRoomDialogProps) {
  const isEdit = !!room;

  const [formData, setFormData] = useState({
    roomCode: '',
    capacity: 30,
    roomTypeId: '',
    roomStatusId: '',
    onlineMeetingUrl: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<RoomStatus[]>([]);

  useEffect(() => {
    if (room) {
      // For existing room, use roomStatusId if available, otherwise fall back to roomStatus
      const statusId = room.roomStatusId || 
                      (room.roomStatus ? room.roomStatus.toLowerCase() : '');
      
      setFormData({
        roomCode: room.roomCode,
        capacity: room.capacity,
        roomTypeId: room.roomTypeId,
        onlineMeetingUrl: room.onlineMeetingUrl || '',
        isActive: room.isActive,
        roomStatusId: statusId
      });
    } else {
      // For new room, set default values
      setFormData({
        roomCode: '',
        capacity: 30,
        roomTypeId: roomTypes.length > 0 ? roomTypes[0].id : '',
        onlineMeetingUrl: '',
        isActive: true,
        roomStatusId: '' // This will be set when statuses are loaded
      });
    }
    setErrors({});
  }, [room, open, roomTypes]);

  // Load statuses for status dropdown
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const data = await getRoomStatuses();
        setStatuses(data || []);
        
        // Set default status if not in edit mode
        if (!isEdit && data && data.length > 0) {
          const availableStatus = data.find(s => s.code === 'Available') || data[0];
          setFormData(prev => ({
            ...prev,
            roomStatusId: availableStatus.id
          }));
        }
      } catch (error) {
        console.warn('Failed to load room statuses for dialog', error);
      }
    };

    if (open) {
      fetchStatuses();
    }
  }, [open, isEdit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomCode.trim()) {
      newErrors.roomCode = 'Room code is required';
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    if (!formData.roomTypeId) {
      newErrors.roomTypeId = 'Room type is required';
    }

    if (!formData.roomStatusId) {
      newErrors.roomStatusId = 'Room status is required';
    }

    // Validate online meeting URL format if provided
    if (formData.onlineMeetingUrl && formData.onlineMeetingUrl.trim()) {
      try {
        new URL(formData.onlineMeetingUrl);
      } catch {
        newErrors.onlineMeetingUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      if (isEdit) {
        // For edit, use the existing logic
        const activeStatuses = ['Available', 'InUse', 'In Use', 'Reserved'];
        const status = statuses.find(s => s.id === formData.roomStatusId);
        const statusCode = status?.code || '';
        const derivedIsActive = activeStatuses.includes(statusCode);

        const updateData: UpdateRoom = {
          roomCode: formData.roomCode,
          capacity: formData.capacity,
          roomTypeId: formData.roomTypeId,
          roomStatusId: formData.roomStatusId, // Include roomStatusId in update
          onlineMeetingUrl: formData.onlineMeetingUrl.trim() || null,
          isActive: derivedIsActive,
        };
        onSave(updateData);
      } else {
        // For new room, include roomStatusId
        const addData: AddRoom = {
          roomCode: formData.roomCode,
          capacity: formData.capacity,
          roomTypeId: formData.roomTypeId,
          roomStatusId: formData.roomStatusId,
          onlineMeetingUrl: formData.onlineMeetingUrl.trim() || null,
          isActive: true
        };
        onSave(addData);
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] mt-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Room' : 'Create New Room'}</DialogTitle>
          <DialogDescription className='pb-2'>
            {isEdit ? 'Update the room information below.' : 'Fill in the details to create a new room.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Code */}
          <div>
            <Label required icon={<DoorOpen className="w-4 h-4" />}>
              Room Code
            </Label>
            <Input
              type="text"
              value={formData.roomCode}
              onChange={(e) => handleInputChange('roomCode', e.target.value)}
              placeholder="e.g., CR-101, LAB-201"
              className={errors.roomCode ? 'border-red-500' : ''}
              required
            />
            {errors.roomCode && (
              <p className="text-red-500 text-sm mt-1">{errors.roomCode}</p>
            )}
          </div>

          {/* Room Type */}
          <div>
            <Label required icon={<Tag className="w-4 h-4" />}>
              Room Type
            </Label>
            <select
              value={formData.roomTypeId}
              onChange={(e) => handleInputChange('roomTypeId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.roomTypeId ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select room type</option>
              {roomTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                  {type.description && ` - ${type.description}`}
                </option>
              ))}
            </select>
            {errors.roomTypeId && (
              <p className="text-red-500 text-sm mt-1">{errors.roomTypeId}</p>
            )}
          </div>

          {/* Capacity */}
          <div>
            <Label required icon={<Users className="w-4 h-4" />}>
              Capacity
            </Label>
            <Input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
              placeholder="Number of people"
              className={errors.capacity ? 'border-red-500' : ''}
              required
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Maximum number of people the room can accommodate
            </p>
          </div>

          {/* Room Status */}
          <div>
            <Label required icon={<Activity className="w-4 h-4" />}>
              Status
            </Label>
            <select
              value={formData.roomStatusId}
              onChange={(e) => handleInputChange('roomStatusId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.roomStatusId ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select status</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
            {errors.roomStatusId && (
              <p className="text-red-500 text-sm mt-1">{errors.roomStatusId}</p>
            )}
          </div>

          {/* Online Meeting URL */}
          <div>
            <Label icon={<LinkIcon className="w-4 h-4" />}>
              Online Meeting URL (Optional)
            </Label>
            <Input
              type="url"
              value={formData.onlineMeetingUrl}
              onChange={(e) => handleInputChange('onlineMeetingUrl', e.target.value)}
              placeholder="e.g., https://meet.google.com/xxx-yyyy-zzz"
              className={errors.onlineMeetingUrl ? 'border-red-500' : ''}
            />
            {errors.onlineMeetingUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.onlineMeetingUrl}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Add a virtual meeting link for hybrid or online classes
            </p>
          </div>


          <DialogFooter className="flex items-center justify-between">
            <div>
              {isEdit && onDelete && room && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    onDelete(room);
                  }}
                  disabled={isLoading}
                  iconLeft={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                variant="success"
                iconLeft={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
              >
                {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

