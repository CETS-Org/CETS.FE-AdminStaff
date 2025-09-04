import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { CheckCircle, XCircle, Clock, User, Mail, Calendar, AlertCircle } from "lucide-react";

interface Request {
  id: string;
  studentName: string;
  studentEmail: string;
  requestType: "course_change" | "schedule_change" | "refund" | "other";
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  priority: "low" | "medium" | "high";
  note?: string;
}

interface RequestDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  onApprove: (reply: string) => void;
  onReject: (reply: string) => void;
}

export default function RequestDetailDialog({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject
}: RequestDetailDialogProps) {
  const [reply, setReply] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject">("approve");

  if (!request) return null;

  const handleApprove = () => {
    setConfirmAction("approve");
    setShowConfirmDialog(true);
  };

  const handleReject = () => {
    setConfirmAction("reject");
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = (replyMessage: string) => {
    if (confirmAction === "approve") {
      onApprove(replyMessage);
    } else {
      onReject(replyMessage);
    }
    setShowConfirmDialog(false);
    setReply("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "course_change":
        return "Course Change";
      case "schedule_change":
        return "Schedule Change";
      case "refund":
        return "Refund";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>View and manage student request details</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-6">
              {/* Student Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Student Information</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Name:</span>
                    <span>{request.studentName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span className="text-blue-600">{request.studentEmail}</span>
                  </div>
                </div>
              </div>

              {/* Request Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {getTypeLabel(request.requestType)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        request.status === "approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(request.submittedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{request.description}</p>
                </div>
              </div>

              {/* Student Note */}
              {request.note && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Note</label>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-gray-800">{request.note}</p>
                  </div>
                </div>
              )}

              {/* Reply Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Enter your response to the student..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
            {request.status === "pending" && (
              <>
                <Button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => !open && setShowConfirmDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`${confirmAction === "approve" ? "Approve" : "Reject"} Request`}</DialogTitle>
            <DialogDescription>{`Are you sure you want to ${confirmAction} this request?`}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {confirmAction === "approve" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">Request Details</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Student:</span> {request.studentName}</p>
                  <p><span className="font-medium">Type:</span> {getTypeLabel(request.requestType)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-reply" className="block text-sm font-medium text-gray-700">
                  Reply to Student {confirmAction === "approve" ? "(Optional)" : "(Required)"}
                </label>
                <textarea
                  id="confirm-reply"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={`Enter your ${confirmAction === "approve" ? "approval" : "rejection"} message...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  required={confirmAction === "reject"}
                />
                {confirmAction === "reject" && !reply.trim() && (
                  <p className="text-sm text-red-600">Please provide a reason for rejection</p>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleConfirmAction(reply)}
              className={`${confirmAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`}
              disabled={confirmAction === "reject" && !reply.trim()}
            >
              {confirmAction === "approve" ? "Approve" : "Reject"} Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
