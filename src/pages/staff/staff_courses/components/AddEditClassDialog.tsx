import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Calendar, Clock, Users, MapPin } from "lucide-react";

type Class = {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  teacher: string;
  teacherAvatar?: string;
  schedule: string;
  room: string;
  currentStudents: number;
  maxStudents: number;
  status: "active" | "inactive" | "full";
  startDate: string;
  endDate: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (classData: Partial<Class>) => void;
  classData?: Class | null;
  courseName: string;
};

export default function AddEditClassDialog({ open, onOpenChange, onSave, classData, courseName }: Props) {
  const [formData, setFormData] = useState<Partial<Class>>({
    name: "",
    teacher: "",
    schedule: "",
    room: "",
    currentStudents: 0,
    maxStudents: 20,
    status: "active",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        teacher: classData.teacher,
        schedule: classData.schedule,
        room: classData.room,
        currentStudents: classData.currentStudents,
        maxStudents: classData.maxStudents,
        status: classData.status,
        startDate: classData.startDate,
        endDate: classData.endDate,
      });
    } else {
      setFormData({
        name: "",
        teacher: "",
        schedule: "",
        room: "",
        currentStudents: 0,
        maxStudents: 20,
        status: "active",
        startDate: "",
        endDate: "",
      });
    }
  }, [classData]);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const isEditMode = !!classData;

  return (
         <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent size="xl" className="max-w-4xl">
                 <DialogHeader className="sticky top-0 bg-white z-10 border-b pb-4 shadow-sm">
           <DialogTitle className="text-xl font-semibold">
             {isEditMode ? "Edit Class" : "Add New Class"}
           </DialogTitle>
         </DialogHeader>
         <DialogBody className="space-y-6 pt-4 pb-20 overflow-y-auto max-h-[60vh]">
          {/* Course Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Course Information</h3>
            <p className="text-gray-600">{courseName}</p>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            
                         <div className="grid grid-cols-3 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
                 <Input
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   placeholder="Enter class name"
                   className="w-full"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
                 <Input
                   value={formData.teacher}
                   onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                   placeholder="Enter teacher name"
                   className="w-full"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
                 <Input
                   value={formData.room}
                   onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                   placeholder="Enter room number"
                   className="w-full"
                 />
               </div>
             </div>

                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Schedule *</label>
               <Input
                 value={formData.schedule}
                 onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                 placeholder="e.g., Mon, Wed, Fri 9:00-11:00"
                 className="w-full"
               />
             </div>
          </div>

          {/* Student Capacity */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2">Student Capacity</h3>
            
                         <div className="grid grid-cols-3 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Current Students</label>
                 <Input
                   type="number"
                   value={formData.currentStudents}
                   onChange={(e) => setFormData({ ...formData, currentStudents: parseInt(e.target.value) || 0 })}
                   placeholder="0"
                   className="w-full"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Students *</label>
                 <Input
                   type="number"
                   value={formData.maxStudents}
                   onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 20 })}
                   placeholder="20"
                   className="w-full"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                 <Select
                   value={formData.status}
                   onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "full" })}
                   options={[
                     { label: "Active", value: "active" },
                     { label: "Inactive", value: "inactive" },
                     { label: "Full", value: "full" }
                   ]}
                 />
               </div>
             </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2">Class Period</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          
        </DialogBody>
                 <DialogFooter className="sticky bottom-0 bg-gray-50 z-10 border-t pt-6 shadow-sm">
           <div className="flex items-center justify-between w-full">
             <p className="text-sm text-gray-600">All fields marked with * are required</p>
             <div className="flex gap-3">
               <Button variant="secondary" onClick={() => onOpenChange(false)}>
                 Cancel
               </Button>
               <Button onClick={handleSave} disabled={!formData.name || !formData.teacher || !formData.schedule || !formData.room}>
                 {isEditMode ? "Update Class" : "Create Class"}
               </Button>
             </div>
           </div>
         </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
