// src/pages/staff/staff_classes/components/StatusDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { CheckCircle2, XCircle } from "lucide-react";

type StatusType = "success" | "error" | null;

interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: StatusType;
  title: string;
  message: string;
}

export default function StatusDialog({ open, onOpenChange, status, title, message }: StatusDialogProps) {
  const isSuccess = status === "success";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center">
        <div className="flex flex-col items-center justify-center py-4">
          <div className={`p-3 rounded-full mb-4 ${isSuccess ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
             {isSuccess ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isSuccess ? "text-green-700" : "text-red-700"}`}>
            {title}
          </h3>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <Button 
            onClick={() => onOpenChange(false)} 
            className={`w-full ${isSuccess ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white border-transparent`}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}