import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

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
  onConfirm: () => void;
  classData: Class | null;
};

export default function DeleteClassDialog({ open, onOpenChange, onConfirm, classData }: Props) {
  if (!classData) return null;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
         <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent size="lg" className="max-w-3xl">
                 <DialogHeader className="sticky top-0 bg-white z-10 border-b pb-4 shadow-sm">
           <DialogTitle className="text-red-600 flex items-center gap-2">
             <AlertTriangle className="w-5 h-5" />
             Delete Class
           </DialogTitle>
         </DialogHeader>
         <DialogBody>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete the class <strong>"{classData.name}"</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">This action cannot be undone</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• All class sessions will be removed</li>
                <li>• Student enrollments will be affected</li>
                <li>• Class data will be permanently deleted</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Class Details:</strong><br />
                Course: {classData.courseName}<br />
                Teacher: {classData.teacher}<br />
                Students: {classData.currentStudents}/{classData.maxStudents}
              </p>
            </div>
          </div>
        </DialogBody>
                 <DialogFooter className="sticky bottom-0 bg-gray-50 z-10 border-t pt-6 shadow-sm">
           <Button variant="secondary" onClick={() => onOpenChange(false)}>
             Cancel
           </Button>
           <Button 
             onClick={handleConfirm} 
             className="bg-red-600 hover:bg-red-700 text-white"
           >
             Delete Class
           </Button>
         </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
