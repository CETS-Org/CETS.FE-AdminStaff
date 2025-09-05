import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { CheckCircle, XCircle } from "lucide-react";

interface ConfirmRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reply: string) => void;
  action: "approve" | "reject";
  studentName: string;
  requestType: string;
}

export default function ConfirmRequestDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
  studentName,
  requestType
}: ConfirmRequestDialogProps) {
  const [reply, setReply] = useState("");

  const handleConfirm = () => {
    onConfirm(reply);
    setReply("");
    onClose();
  };

  const handleCancel = () => {
    setReply("");
    onClose();
  };

  const isApprove = action === "approve";
  const actionText = isApprove ? "Approve" : "Reject";
  const buttonColor = isApprove ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent size="lg" className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{`${actionText} Request`}</DialogTitle>
          <DialogDescription>{`Are you sure you want to ${action.toLowerCase()} this request?`}</DialogDescription>
        </DialogHeader>
        <DialogBody>
      <div className="space-y-4">
        {/* Request Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {isApprove ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-medium">Request Details</span>
          </div>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Student:</span> {studentName}</p>
            <p><span className="font-medium">Type:</span> {requestType}</p>
          </div>
        </div>

        {/* Reply Input */}
        <div className="space-y-2">
          <label htmlFor="reply" className="block text-sm font-medium text-gray-700">
            Reply to Student {isApprove ? "(Optional)" : "(Required)"}
          </label>
          <textarea
            id="reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={`Enter your ${isApprove ? "approval" : "rejection"} message...`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            required={!isApprove}
          />
          {!isApprove && !reply.trim() && (
            <p className="text-sm text-red-600">Please provide a reason for rejection</p>
          )}
        </div>

        </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={`${buttonColor} text-white`}
            disabled={!isApprove && !reply.trim()}
          >
            {actionText} Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
