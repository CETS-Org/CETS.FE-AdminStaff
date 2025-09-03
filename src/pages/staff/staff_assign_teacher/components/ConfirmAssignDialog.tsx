import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { UserPlus, Calendar, Users } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization: string;
  status: "active" | "inactive";
  currentWorkload: number;
  maxWorkload: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  department: string;
  semester: string;
  year: string;
}

interface ConfirmAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCourse: Course | null;
  selectedTeachers: Teacher[];
  onConfirm: (additionalInfo: any) => void;
}

export default function ConfirmAssignDialog({
  open,
  onOpenChange,
  selectedCourse,
  selectedTeachers,
  onConfirm
}: ConfirmAssignDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!startDate) {
      newErrors.startDate = "Please select a start date";
    }

    if (!endDate) {
      newErrors.endDate = "Please select an end date";
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm({
        startDate,
        endDate,
        notes
      });
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setStartDate("");
    setEndDate("");
    setNotes("");
    setErrors({});
    onOpenChange(false);
  };

  if (!selectedCourse) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Confirm Teacher Assignment
          </DialogTitle>
        </DialogHeader>
        
        <DialogBody className="space-y-6">
          {/* Course Information */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Course Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Course Name:</span>
                <p className="text-blue-800">{selectedCourse.name}</p>
              </div>
              <div>
                <span className="font-medium">Course Code:</span>
                <p className="text-blue-800">{selectedCourse.code}</p>
              </div>
              <div>
                <span className="font-medium">Department:</span>
                <p className="text-blue-800">{selectedCourse.department}</p>
              </div>
              <div>
                <span className="font-medium">Credits:</span>
                <p className="text-blue-800">{selectedCourse.credits}</p>
              </div>
              <div>
                <span className="font-medium">Semester:</span>
                <p className="text-blue-800">{selectedCourse.semester} {selectedCourse.year}</p>
              </div>
            </div>
          </div>

          {/* Selected Teachers */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Selected Teachers ({selectedTeachers.length})
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {selectedTeachers.map((teacher) => (
                <div key={teacher.id} className="p-3 border border-neutral-200 rounded-md bg-neutral-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{teacher.name}</div>
                      <div className="text-xs text-neutral-600">{teacher.email}</div>
                      <div className="text-xs text-neutral-600">
                        {teacher.specialization} • {teacher.currentWorkload}/{teacher.maxWorkload} credits
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500">
                      +{selectedCourse.credits} credits
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Period */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={errors.startDate}
            />
            <Input
              label="End Date *"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={errors.endDate}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Any additional notes about this assignment..."
            />
          </div>

          {/* Workload Warning */}
          {selectedTeachers.some(t => t.currentWorkload + selectedCourse.credits > t.maxWorkload) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Some teachers will exceed their maximum workload after this assignment.
              </p>
            </div>
          )}
        </DialogBody>
        
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!startDate || !endDate}
          >
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
