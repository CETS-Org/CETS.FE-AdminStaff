import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from '@/components/ui/Button';
import type { Timeslot } from '@/types/timetable.type';

interface DeleteTimeslotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeslot: Timeslot | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeleteTimeslotDialog({
  open,
  onOpenChange,
  timeslot,
  onConfirm,
  isLoading = false,
}: DeleteTimeslotDialogProps) {
  if (!timeslot) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Timeslot</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-neutral-700">
            Are you sure you want to delete <strong>{timeslot.slotName}</strong> ({timeslot.startTime} - {timeslot.endTime})?
            <br />
            <br />
            This action cannot be undone. All timetable entries using this timeslot will be affected.
          </p>
        </DialogBody>
        <DialogFooter className="sticky bottom-0 bg-gray-50 z-10 border-t pt-6 shadow-sm">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleConfirm} 
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

