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
import Switch from '@/components/ui/Switch';
import type { Room, AddRoom, UpdateRoom, RoomType } from '@/types/room.type';
import { DoorOpen, Users, Tag, Link as LinkIcon, Loader2 } from 'lucide-react';

interface AddEditRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  roomTypes: RoomType[];
  onSave: (data: AddRoom | UpdateRoom) => void;
  isLoading?: boolean;
}

export default function AddEditRoomDialog({
  open,
  onOpenChange,
  room,
  roomTypes,
  onSave,
  isLoading = false,
}: AddEditRoomDialogProps) {
  const isEdit = !!room;

  const [formData, setFormData] = useState({
    roomCode: '',
    capacity: 30,
    roomTypeId: '',
    onlineMeetingUrl: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (room) {
      setFormData({
        roomCode: room.roomCode,
        capacity: room.capacity,
        roomTypeId: room.roomTypeId,
        onlineMeetingUrl: room.onlineMeetingUrl || '',
        isActive: room.isActive,
      });
    } else {
      setFormData({
        roomCode: '',
        capacity: 30,
        roomTypeId: roomTypes.length > 0 ? roomTypes[0].id : '',
        onlineMeetingUrl: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [room, open, roomTypes]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      if (isEdit) {
        const updateData: UpdateRoom = {
          roomCode: formData.roomCode,
          capacity: formData.capacity,
          roomTypeId: formData.roomTypeId,
          onlineMeetingUrl: formData.onlineMeetingUrl.trim() || null,
          isActive: formData.isActive,
        };
        onSave(updateData);
      } else {
        const addData: AddRoom = {
          roomCode: formData.roomCode,
          capacity: formData.capacity,
          roomTypeId: formData.roomTypeId,
          onlineMeetingUrl: formData.onlineMeetingUrl.trim() || null,
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

          {/* Online Meeting URL */}
          <div>
            <Label icon={<LinkIcon className="w-4 h-4" />}>
              Online Meeting URL
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

          {/* Status (only for edit mode) */}
          {isEdit && (
            <div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                label="Active"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.isActive ? 'Room is available for use' : 'Room is temporarily unavailable'}
              </p>
            </div>
          )}

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

