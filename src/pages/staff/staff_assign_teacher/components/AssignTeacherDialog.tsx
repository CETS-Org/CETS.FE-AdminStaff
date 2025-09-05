import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { UserPlus, User, BookOpen, Calendar } from "lucide-react";

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

interface AssignTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teachers: Teacher[];
  courses: Course[];
  onAssign: (teacherId: string, courseId: string, additionalInfo: any) => void;
}

export default function AssignTeacherDialog({
  open,
  onOpenChange,
  teachers,
  courses,
  onAssign
}: AssignTeacherDialogProps) {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedTeacherData = teachers.find(t => t.id === selectedTeacher);
  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  useEffect(() => {
    if (open) {
      setSelectedTeacher("");
      setSelectedCourse("");
      setStartDate("");
      setEndDate("");
      setNotes("");
      setErrors({});
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedTeacher) {
      newErrors.teacher = "Please select a teacher";
    }

    if (!selectedCourse) {
      newErrors.course = "Please select a course";
    }

    if (!startDate) {
      newErrors.startDate = "Please select a start date";
    }

    if (!endDate) {
      newErrors.endDate = "Please select an end date";
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    // Check teacher workload
    if (selectedTeacherData && selectedCourseData) {
      const newWorkload = selectedTeacherData.currentWorkload + selectedCourseData.credits;
      if (newWorkload > selectedTeacherData.maxWorkload) {
        newErrors.teacher = `Teacher workload would exceed maximum (${selectedTeacherData.maxWorkload} credits)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAssign = () => {
    if (validateForm()) {
      onAssign(selectedTeacher, selectedCourse, {
        startDate,
        endDate,
        notes
      });
      
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Teacher to Course
          </DialogTitle>
        </DialogHeader>
        
        <DialogBody className="space-y-6">
          {/* Teacher and Course Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Select Teacher *"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                options={teachers.filter(t => t.status === "active").map((teacher) => ({
                  label: `${teacher.name} - ${teacher.specialization}`,
                  value: teacher.id
                }))}
                error={errors.teacher}
              />
              
              {selectedTeacherData && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">{selectedTeacherData.name}</h4>
                  <p className="text-sm text-gray-600">{selectedTeacherData.email}</p>
                  <p className="text-sm text-gray-600">Specialization: {selectedTeacherData.specialization}</p>
                  <p className="text-sm text-gray-600">
                    Workload: {selectedTeacherData.currentWorkload}/{selectedTeacherData.maxWorkload} credits
                  </p>
                </div>
              )}
            </div>

            <div>
              <Select
                label="Select Course *"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                options={courses.map((course) => ({
                  label: `${course.name} (${course.code})`,
                  value: course.id
                }))}
                error={errors.course}
              />
              
              {selectedCourseData && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">{selectedCourseData.name}</h4>
                  <p className="text-sm text-gray-600">Code: {selectedCourseData.code}</p>
                  <p className="text-sm text-gray-600">Credits: {selectedCourseData.credits}</p>
                  <p className="text-sm text-gray-600">Department: {selectedCourseData.department}</p>
                  <p className="text-sm text-gray-600">
                    Semester: {selectedCourseData.semester} {selectedCourseData.year}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Date Range */}
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
          {selectedTeacherData && selectedCourseData && (
            <div className={`p-3 rounded-md border ${
              selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
            }`}>
              <p className="text-sm">
                <strong>Workload Check:</strong> This assignment will add {selectedCourseData.credits} credits 
                to {selectedTeacherData.name}'s current workload of {selectedTeacherData.currentWorkload} credits.
                {selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload && (
                  <span className="text-red-600 font-medium"> This will exceed the maximum workload!</span>
                )}
              </p>
            </div>
          )}
        </DialogBody>
        
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedTeacher || !selectedCourse}
          >
            Assign Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
