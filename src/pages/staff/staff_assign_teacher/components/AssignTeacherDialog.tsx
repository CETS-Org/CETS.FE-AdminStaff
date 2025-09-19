import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { UserPlus, BookOpen, Calendar, AlertTriangle, CheckCircle2, Clock, Award, Users, GraduationCap } from "lucide-react";

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
      <DialogContent size="lg" className="max-w-4xl bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Assign Teacher to Course
              </h2>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Select a teacher and course to create a new assignment
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <DialogBody className="space-y-8 py-6">
          {/* Enhanced Teacher and Course Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teacher Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Select Teacher</h3>
                  <p className="text-sm text-gray-600">Choose from available active teachers</p>
                </div>
              </div>
              
              <Select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                options={[
                  { label: "Choose a teacher...", value: "" },
                  ...teachers.filter(t => t.status === "active").map((teacher) => ({
                    label: `${teacher.name} - ${teacher.specialization}`,
                    value: teacher.id
                  }))
                ]}
                error={errors.teacher}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              
              {selectedTeacherData && (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full transform translate-x-12 -translate-y-12"></div>
                  <div className="relative p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900">{selectedTeacherData.name}</h4>
                        <p className="text-sm text-blue-700">{selectedTeacherData.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                          {selectedTeacherData.specialization}
                        </span>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Current Workload</div>
                          <div className="font-bold text-blue-900">
                            {selectedTeacherData.currentWorkload}/{selectedTeacherData.maxWorkload} credits
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(selectedTeacherData.currentWorkload / selectedTeacherData.maxWorkload) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Select Course</h3>
                  <p className="text-sm text-gray-600">Choose the course to assign</p>
                </div>
              </div>
              
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                options={[
                  { label: "Choose a course...", value: "" },
                  ...courses.map((course) => ({
                    label: `${course.name} (${course.code})`,
                    value: course.id
                  }))
                ]}
                error={errors.course}
                className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              
              {selectedCourseData && (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-lg">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/20 rounded-full transform translate-x-12 -translate-y-12"></div>
                  <div className="relative p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900">{selectedCourseData.name}</h4>
                        <p className="text-sm text-emerald-700">{selectedCourseData.code}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Credits:</span>
                        <div className="font-bold text-emerald-900">{selectedCourseData.credits}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Department:</span>
                        <div className="font-bold text-emerald-900">{selectedCourseData.department}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Semester:</span>
                        <div className="font-bold text-emerald-900">
                          {selectedCourseData.semester} {selectedCourseData.year}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Date Range */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Assignment Period</h3>
                <p className="text-sm text-gray-600">Set the duration for this assignment</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Start Date *
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    error={errors.startDate}
                    className="pl-10 h-11 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  End Date *
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    error={errors.endDate}
                    className="pl-10 h-11 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Additional Notes</h3>
                <p className="text-sm text-gray-600">Optional notes or special instructions</p>
              </div>
            </div>
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 resize-none"
              rows={4}
              placeholder="Enter any additional notes, special requirements, or instructions for this assignment..."
            />
          </div>

          {/* Enhanced Workload Analysis */}
          {selectedTeacherData && selectedCourseData && (
            <div className={`relative overflow-hidden rounded-xl border-2 shadow-lg ${
              selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload
                ? "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                : selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload * 0.8
                ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
                : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
            }`}>
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full transform translate-x-12 -translate-y-12 ${
                selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload
                  ? "bg-red-400/20"
                  : selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload * 0.8
                  ? "bg-yellow-400/20"
                  : "bg-green-400/20"
              }`}></div>
              
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload
                      ? "bg-red-500"
                      : selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload * 0.8
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}>
                    {selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload ? (
                      <AlertTriangle className="w-4 h-4 text-white" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${
                      selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload
                        ? "text-red-900"
                        : selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload * 0.8
                        ? "text-yellow-900"
                        : "text-green-900"
                    }`}>
                      Workload Analysis
                    </h4>
                    <p className={`text-sm ${
                      selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload
                        ? "text-red-700"
                        : selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload * 0.8
                        ? "text-yellow-700"
                        : "text-green-700"
                    }`}>
                      Impact of this assignment on teacher's workload
                    </p>
                  </div>
                </div>

                <div className={`bg-white/70 rounded-lg p-4 border ${
                  selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload
                    ? "border-red-200"
                    : selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload * 0.8
                    ? "border-yellow-200"
                    : "border-green-200"
                }`}>
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <div className="text-xs text-gray-600">Current</div>
                      <div className="text-lg font-bold text-gray-900">{selectedTeacherData.currentWorkload}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Adding</div>
                      <div className="text-lg font-bold text-blue-600">+{selectedCourseData.credits}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">New Total</div>
                      <div className={`text-lg font-bold ${
                        selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload
                          ? "text-red-600"
                          : "text-green-600"
                      }`}>
                        {selectedTeacherData.currentWorkload + selectedCourseData.credits}/{selectedTeacherData.maxWorkload}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Workload Progress</span>
                      <span>{Math.round(((selectedTeacherData.currentWorkload + selectedCourseData.credits) / selectedTeacherData.maxWorkload) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload
                            ? "bg-gradient-to-r from-red-500 to-pink-500"
                            : selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload * 0.8
                            ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                            : "bg-gradient-to-r from-green-500 to-emerald-500"
                        }`}
                        style={{ 
                          width: `${Math.min(((selectedTeacherData.currentWorkload + selectedCourseData.credits) / selectedTeacherData.maxWorkload) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  {selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800">
                        <strong>Warning:</strong> This assignment will exceed {selectedTeacherData.name}'s maximum workload by{" "}
                        <strong>{(selectedTeacherData.currentWorkload + selectedCourseData.credits) - selectedTeacherData.maxWorkload} credits</strong>.
                        Please confirm this is acceptable or consider reassigning.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogBody>
        
        <DialogFooter className="pt-6 border-t border-gray-200 flex gap-4">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            className="flex-1 h-12 border-gray-300 hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedTeacher || !selectedCourse || !startDate || !endDate}
            className={`flex-1 h-12 transition-all duration-300 ${
              !selectedTeacher || !selectedCourse || !startDate || !endDate
                ? 'opacity-50 cursor-not-allowed'
                : selectedTeacherData && selectedCourseData && selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl hover:scale-105'
            }`}
            iconLeft={<CheckCircle2 className="w-4 h-4" />}
          >
            {selectedTeacherData && selectedCourseData && selectedTeacherData.currentWorkload + selectedCourseData.credits > selectedTeacherData.maxWorkload 
              ? 'Assign (Override Limit)' 
              : 'Assign Teacher'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
