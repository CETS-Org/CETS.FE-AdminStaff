import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { Calendar, Clock, Users, MapPin, User, Award } from "lucide-react";

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
  classData: Class | null;
  onEdit: (classData: Class) => void;
};

export default function ClassDetailDialog({ open, onOpenChange, classData, onEdit }: Props) {
  if (!classData) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'full':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleEdit = () => {
    onEdit(classData);
    onOpenChange(false);
  };

  return (
         <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent size="xl" className="max-w-5xl">
                 <DialogHeader className="sticky top-0 bg-white z-10 border-b pb-4 shadow-sm">
           <DialogTitle className="text-xl font-semibold flex items-center gap-2">
             <Award className="w-5 h-5" />
             Class Details
           </DialogTitle>
         </DialogHeader>
         <DialogBody className="space-y-6 pt-4">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{classData.name}</h2>
                <p className="text-gray-600 mt-1">{classData.courseName}</p>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(classData.status)}`}>
                {classData.status}
              </span>
            </div>
          </div>

          {/* Teacher Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Teacher Information
            </h3>
            <div className="flex items-center gap-3">
              <img 
                src={classData.teacherAvatar || "https://via.placeholder.com/60x60?text=?"} 
                alt={classData.teacher} 
                className="w-15 h-15 rounded-full border-2 border-gray-200"
              />
              <div>
                <p className="font-medium text-gray-900">{classData.teacher}</p>
                <p className="text-sm text-gray-600">Lead Instructor</p>
              </div>
            </div>
          </div>

                     {/* Schedule and Location */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule
              </h3>
              <p className="text-gray-700">{classData.schedule}</p>
            </div>
                         <div className="bg-white border border-gray-200 rounded-lg p-4">
               <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                 <MapPin className="w-4 h-4" />
                 Location
               </h3>
               <p className="text-gray-700">{classData.room}</p>
             </div>
             <div className="bg-white border border-gray-200 rounded-lg p-4">
               <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 Class Period
               </h3>
               <div className="space-y-2">
                 <div>
                   <p className="text-sm text-gray-600">Start Date</p>
                   <p className="font-medium text-gray-900">{new Date(classData.startDate).toLocaleDateString()}</p>
                 </div>
                 <div>
                   <p className="text-sm text-gray-600">End Date</p>
                   <p className="font-medium text-gray-900">{new Date(classData.endDate).toLocaleDateString()}</p>
                 </div>
               </div>
             </div>
           </div>

          {/* Student Capacity */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Student Capacity
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{classData.currentStudents}</p>
                <p className="text-sm text-gray-600">Current Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{classData.maxStudents}</p>
                <p className="text-sm text-gray-600">Maximum Capacity</p>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(classData.currentStudents / classData.maxStudents) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((classData.currentStudents / classData.maxStudents) * 100)}% full
                </p>
              </div>
            </div>
          </div>

          

          {/* Additional Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Additional Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Class ID</p>
                <p className="font-medium text-gray-900">{classData.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Course ID</p>
                <p className="font-medium text-gray-900">{classData.courseId}</p>
              </div>
            </div>
          </div>
        </DialogBody>
                 <DialogFooter className="sticky bottom-0 bg-gray-50 z-10 border-t pt-6 shadow-sm">
           <div className="flex gap-3">
             <Button variant="secondary" onClick={() => onOpenChange(false)}>
               Close
             </Button>
             <Button onClick={handleEdit}>
               Edit Class
             </Button>
           </div>
         </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
