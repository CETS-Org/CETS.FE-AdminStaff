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
import type { Timeslot, CreateTimeslotDto } from '@/types/timetable.type';
import { Clock, Hash, AlignLeft } from 'lucide-react';

interface AddEditTimeslotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeslot: Timeslot | null;
  onSave: (data: CreateTimeslotDto) => void;
  isLoading?: boolean;
}

export default function AddEditTimeslotDialog({
  open,
  onOpenChange,
  timeslot,
  onSave,
  isLoading = false,
}: AddEditTimeslotDialogProps) {
  const isEdit = !!timeslot;

  const [formData, setFormData] = useState<CreateTimeslotDto>({
    slotNumber: 1,
    slotName: '',
    startTime: '09:00',
    endTime: '10:30',
    duration: 90,
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (timeslot) {
      setFormData({
        slotNumber: timeslot.slotNumber,
        slotName: timeslot.slotName,
        startTime: timeslot.startTime,
        endTime: timeslot.endTime,
        duration: timeslot.duration,
        description: timeslot.description || '',
        isActive: timeslot.isActive,
      });
    } else {
      setFormData({
        slotNumber: 1,
        slotName: '',
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        description: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [timeslot, open]);

  // Calculate duration when times change
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      
      const duration = endTotalMinutes - startTotalMinutes;
      if (duration > 0) {
        setFormData(prev => ({ ...prev, duration }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.slotName.trim()) {
      newErrors.slotName = 'Slot name is required';
    }

    if (formData.slotNumber < 1) {
      newErrors.slotNumber = 'Slot number must be at least 1';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      
      if (endTotalMinutes <= startTotalMinutes) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof CreateTimeslotDto, value: any) => {
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
          <DialogTitle>{isEdit ? 'Edit Timeslot' : 'Create New Timeslot'}</DialogTitle>
          <DialogDescription className='pb-2'>
            {isEdit ? 'Update the timeslot information below.' : 'Fill in the details to create a new timeslot.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Slot Number */}
          <div>
            <Label required icon={<Hash className="w-4 h-4" />}>
              Slot Number
            </Label>
            <Input
              type="number"
              min="1"
              value={formData.slotNumber}
              onChange={(e) => handleInputChange('slotNumber', parseInt(e.target.value))}
              placeholder="e.g., 1"
              className={errors.slotNumber ? 'border-red-500' : ''}
              required
            />
            {errors.slotNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.slotNumber}</p>
            )}
          </div>

          {/* Slot Name */}
          <div>
            <Label required icon={<AlignLeft className="w-4 h-4" />}>
              Slot Name
            </Label>
            <Input
              type="text"
              value={formData.slotName}
              onChange={(e) => handleInputChange('slotName', e.target.value)}
              placeholder="e.g., Slot 1, Morning Session"
              className={errors.slotName ? 'border-red-500' : ''}
              required
            />
            {errors.slotName && (
              <p className="text-red-500 text-sm mt-1">{errors.slotName}</p>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required icon={<Clock className="w-4 h-4" />}>
                Start Time
              </Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className={errors.startTime ? 'border-red-500' : ''}
                required
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
              )}
            </div>

            <div>
              <Label required icon={<Clock className="w-4 h-4" />}>
                End Time
              </Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className={errors.endTime ? 'border-red-500' : ''}
                required
              />
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Duration (auto-calculated) */}
          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={formData.duration || 0}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500 mt-1">
              Auto-calculated from start and end time
            </p>
          </div>

          {/* Status */}
          <div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              label="Active"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} variant="success">
              {isLoading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

