import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { UserPlus, Calendar, Users, BookOpen, AlertTriangle, CheckCircle2, Clock, Award } from "lucide-react";

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
      <DialogContent size="lg" className="max-w-4xl bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Confirm Teacher Assignment
              </h2>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Review and confirm the assignment details before proceeding
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <DialogBody className="space-y-8 py-6">
          {/* Enhanced Course Information */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/50 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="relative p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Course Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-700">Course Name</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900 ml-4">{selectedCourse.name}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-700">Course Code</span>
                  </div>
                  <p className="text-lg font-bold text-indigo-900 ml-4">{selectedCourse.code}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-700">Department</span>
                  </div>
                  <p className="text-base font-semibold text-purple-900 ml-4">{selectedCourse.department}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-700">Credits & Semester</span>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-full">
                      {selectedCourse.credits} Credits
                    </span>
                    <span className="text-base font-semibold text-emerald-900">
                      {selectedCourse.semester} {selectedCourse.year}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Selected Teachers */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Selected Teachers</h3>
                <p className="text-sm text-gray-600">
                  {selectedTeachers.length} teacher{selectedTeachers.length !== 1 ? 's' : ''} will be assigned to this course
                </p>
              </div>
              <div className="ml-auto px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-full font-semibold">
                {selectedTeachers.length}
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {selectedTeachers.map((teacher, index) => {
                const newWorkload = teacher.currentWorkload + selectedCourse.credits;
                const isOverloaded = newWorkload > teacher.maxWorkload;
                const workloadPercentage = (newWorkload / teacher.maxWorkload) * 100;
                
                return (
                  <div key={teacher.id} className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    isOverloaded 
                      ? 'border-red-300 bg-gradient-to-r from-red-50 to-pink-50' 
                      : workloadPercentage > 80
                      ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50'
                      : 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50'
                  }`}>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              isOverloaded ? 'bg-red-500' : workloadPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{teacher.name}</div>
                              <div className="text-sm text-gray-600">{teacher.email}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 ml-11">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium">
                              {teacher.specialization}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span>Current: {teacher.currentWorkload}/{teacher.maxWorkload}</span>
                              <span>→</span>
                              <span className={`font-semibold ${
                                isOverloaded ? 'text-red-600' : workloadPercentage > 80 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                New: {newWorkload}/{teacher.maxWorkload}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isOverloaded ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            +{selectedCourse.credits} credits
                          </div>
                          {isOverloaded && (
                            <div className="flex items-center gap-1 mt-1 text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="text-xs">Overloaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Assignment Period */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Assignment Period</h3>
                <p className="text-sm text-gray-600">Set the start and end dates for this assignment</p>
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
                <p className="text-sm text-gray-600">Any special instructions or requirements for this assignment</p>
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

          {/* Enhanced Workload Warning */}
          {selectedTeachers.some(t => t.currentWorkload + selectedCourse.credits > t.maxWorkload) && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-400/20 rounded-full transform translate-x-12 -translate-y-12"></div>
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-red-900">Workload Warning</h4>
                    <p className="text-sm text-red-700">Some teachers will exceed their maximum capacity</p>
                  </div>
                </div>
                
                <div className="bg-white/70 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-800">
                    <strong>Important:</strong> The following assignment will cause some teachers to exceed their maximum workload. 
                    Please review and confirm that this is acceptable, or consider adjusting the assignment.
                  </p>
                  <div className="mt-2 space-y-1">
                    {selectedTeachers
                      .filter(t => t.currentWorkload + selectedCourse.credits > t.maxWorkload)
                      .map(teacher => (
                        <div key={teacher.id} className="text-xs text-red-700">
                          • <strong>{teacher.name}</strong>: {teacher.currentWorkload + selectedCourse.credits}/{teacher.maxWorkload} credits 
                          (exceeds by {(teacher.currentWorkload + selectedCourse.credits) - teacher.maxWorkload})
                        </div>
                      ))
                    }
                  </div>
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
            onClick={handleConfirm}
            disabled={!startDate || !endDate}
            className={`flex-1 h-12 transition-all duration-300 ${
              !startDate || !endDate
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl hover:scale-105'
            }`}
            iconLeft={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
