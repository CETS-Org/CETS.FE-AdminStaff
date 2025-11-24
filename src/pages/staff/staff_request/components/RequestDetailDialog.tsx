import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { CheckCircle, XCircle, Clock, User, Mail, Calendar, AlertCircle, File, Download, MapPin } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { getAttachmentDownloadUrl } from "@/api/academicRequest.api";
import { getRooms } from "@/api/room.api";
import type { AcademicRequest } from "@/types/academicRequest.type";

interface RequestDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: AcademicRequest | null;
  onApprove: (reply: string, selectedRoomID?: string) => void;
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
  const [selectedRoomID, setSelectedRoomID] = useState<string>("");
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const { showToast } = useToast();

  const fetchAvailableRooms = async () => {
    if (!request?.toMeetingDate || !request?.toSlotID) return;
    
    setIsLoadingRooms(true);
    try {
      // TODO: Create API endpoint to get available rooms for specific date and slot
      // For now, fetch all active rooms
      const rooms = await getRooms();
      const activeRooms = rooms.filter((room: any) => room.isActive);
      setAvailableRooms(activeRooms);
      
      // Pre-select the room if one was already chosen
      if (request.newRoomID) {
        setSelectedRoomID(request.newRoomID);
      }
    } catch (error: any) {
      console.error('Error fetching available rooms:', error);
      showToast('Failed to load available rooms', 'error');
      setAvailableRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Fetch available rooms for meeting reschedule
  useEffect(() => {
    if (request && request.requestType === "meeting_reschedule" && request.status === "pending" && request.toMeetingDate && request.toSlotID) {
      fetchAvailableRooms();
    } else {
      setAvailableRooms([]);
      setSelectedRoomID("");
    }
  }, [request?.id, request?.toMeetingDate, request?.toSlotID, request?.requestType, request?.status]);

  if (!request) return null;

  const handleApprove = () => {
    // Validate room selection for meeting reschedule
    if (request.requestType === "meeting_reschedule" && request.status === "pending" && !selectedRoomID) {
      showToast('Please select a room for the rescheduled meeting', 'error');
      return;
    }
    setConfirmAction("approve");
    setShowConfirmDialog(true);
  };

  const handleReject = () => {
    setConfirmAction("reject");
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = (replyMessage: string) => {
    if (confirmAction === "approve") {
      onApprove(replyMessage, selectedRoomID || undefined);
    } else {
      onReject(replyMessage);
    }
    setShowConfirmDialog(false);
    setReply("");
    setSelectedRoomID("");
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
      case "class_transfer":
        return "Class Transfer";
      case "meeting_reschedule":
        return "Meeting Reschedule";
      case "refund":
        return "Refund";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  const getApprovalDescription = (type: string): string => {
    switch (type) {
      case "class_transfer":
        return "Approving this request will transfer the student from one class to another. The transfer will take effect on the specified date.";
      case "meeting_reschedule":
        return "Approving this request will reschedule the class meeting to a new date, time, and room. The syllabus items will be automatically adjusted.";
      case "course_change":
        return "Approving this request will change the student's enrolled course. Please ensure all prerequisites are met.";
      case "schedule_change":
        return "Approving this request will modify the student's class schedule. Please verify schedule conflicts.";
      case "refund":
        return "Approving this request will process a refund for the student. Please verify the refund amount and policy compliance.";
      case "other":
        return "Are you sure you want to approve this request?";
      default:
        return "Are you sure you want to approve this request?";
    }
  };

  const getTypeSpecificDetails = (req: AcademicRequest): React.ReactNode => {
    switch (req.requestType) {
      case "class_transfer":
        return (
          <>
            {req.fromClassName && (
              <p><span className="font-medium">From Class:</span> {req.fromClassName}</p>
            )}
            {req.toClassName && (
              <p><span className="font-medium">To Class:</span> {req.toClassName}</p>
            )}
            {req.effectiveDate && (
              <p><span className="font-medium">Effective Date:</span> {new Date(req.effectiveDate).toLocaleDateString()}</p>
            )}
          </>
        );
      case "meeting_reschedule":
        return (
          <>
            {(req.fromMeetingDate || req.fromSlotName) && (
              <p><span className="font-medium">Original Meeting:</span> {
                [
                  req.fromMeetingDate ? new Date(req.fromMeetingDate).toLocaleDateString() : '',
                  req.fromSlotName || ''
                ].filter(Boolean).join(' - ')
              }</p>
            )}
            {req.toMeetingDate && (
              <p><span className="font-medium">New Date:</span> {new Date(req.toMeetingDate).toLocaleDateString()}</p>
            )}
            {req.toSlotName && (
              <p><span className="font-medium">New Time:</span> {req.toSlotName}</p>
            )}
            {selectedRoomID && availableRooms.find(r => r.id === selectedRoomID) && (
              <p><span className="font-medium">Selected Room:</span> {availableRooms.find(r => r.id === selectedRoomID)?.roomCode}</p>
            )}
          </>
        );
      case "refund":
        return (
          <p><span className="font-medium">Reason:</span> {req.reason}</p>
        );
      default:
        return null;
    }
  };

  const handleDownloadAttachment = async () => {
    if (!request.attachmentUrl) {
      showToast('No attachment available to download', 'error');
      return;
    }

    try {
      showToast('Preparing download...', 'info');
      
      // Get the presigned download URL from the backend
      const response = await getAttachmentDownloadUrl(request.attachmentUrl);
      const downloadUrl = response.data.downloadUrl;

      // Open the presigned URL in a new tab
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Download started!', 'success');
    } catch (error: any) {
      console.error("Download attachment error:", error);
      showToast(`Failed to download attachment: ${error.response?.data?.error || error.message || "Unknown error"}`, 'error');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent size="xl" className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>View and manage student request details</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex-1 overflow-y-auto max-h-none">
            <div className="space-y-6">
              {/* Submitter Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Submitter Information</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{request.reason}</p>
                </div>
              </div>

              {/* Class Transfer Details */}
              {request.requestType === "class_transfer" && (request.fromClassName || request.toClassName) && (
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 bg-blue-50/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">Class Transfer Details</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {request.fromClassName && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">From Class</label>
                          <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md">
                            {request.fromClassName}
                          </div>
                        </div>
                      )}
                      {request.toClassName && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">To Class</label>
                          <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md">
                            {request.toClassName}
                          </div>
                        </div>
                      )}
                    </div>
                    {request.effectiveDate && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                        <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded-md">
                          {new Date(request.effectiveDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Meeting Reschedule Details */}
              {request.requestType === "meeting_reschedule" && request.classMeetingID && (
                <div className="space-y-4">
                  <div className="border-l-4 border-purple-500 bg-purple-50/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">Meeting Reschedule Details</span>
                    </div>
                    <div className="space-y-4">
                      {/* Original Meeting */}
                      <div className="bg-white rounded-md p-3 border border-purple-200">
                        <div className="text-xs font-semibold text-purple-700 mb-2">Original Meeting</div>
                        {request.fromMeetingDate || request.fromSlotName ? (
                          <div className="space-y-1.5 text-sm">
                            {request.fromMeetingDate && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Date:</span>
                                <span className="text-gray-900">
                                  {new Date(request.fromMeetingDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                            {request.fromSlotName && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">Time:</span>
                                <span className="text-gray-900">{request.fromSlotName}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Original meeting details not available</div>
                        )}
                      </div>

                      {/* New Meeting Details */}
                      <div className="bg-white rounded-md p-3 border border-green-200">
                        <div className="text-xs font-semibold text-green-700 mb-2">New Meeting Details</div>
                        <div className="space-y-2 text-sm">
                          {request.toMeetingDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-700">New Date:</span>
                              <span className="text-gray-900">
                                {new Date(request.toMeetingDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                          {request.toSlotName && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-700">New Time:</span>
                              <span className="text-gray-900">{request.toSlotName}</span>
                            </div>
                          )}
                          {request.newRoomName && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-700">Requested Room:</span>
                              <span className="text-gray-900">{request.newRoomName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Room Selection for Staff (only when pending) */}
                      {request.status === "pending" && request.toMeetingDate && request.toSlotID && (
                        <div className="bg-white rounded-md p-3 border border-blue-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Room for Rescheduled Meeting <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedRoomID}
                            onChange={(e) => setSelectedRoomID(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoadingRooms}
                            required
                          >
                            <option value="">Select a room...</option>
                            {availableRooms.map((room: any) => (
                              <option key={room.id} value={room.id}>
                                {room.roomCode} (Capacity: {room.capacity})
                              </option>
                            ))}
                          </select>
                          {isLoadingRooms && (
                            <p className="text-xs text-gray-500 mt-1">Loading available rooms...</p>
                          )}
                          {!isLoadingRooms && availableRooms.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">No available rooms found for this date and time slot</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Attachment */}
              {request.attachmentUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Document
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {request.attachmentUrl.split('/').pop() || 'Attachment'}
                        </p>
                        <p className="text-xs text-gray-500">Supporting document</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={handleDownloadAttachment}
                      className="flex items-center gap-2"
                      iconLeft={<Download className="w-4 h-4" />}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {/* Staff Response */}
              {request.status !== "pending" && request.staffResponse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Staff Response</label>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{request.staffResponse}</p>
                    {request.processedByName && (
                      <p className="text-xs text-gray-600 mt-2">
                        By {request.processedByName} {request.processedAt && `on ${new Date(request.processedAt).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Reply Section  */}
              {request.status === "pending" && (
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Enter your response to the student..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>
              )}
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
                  iconLeft={<XCircle className="w-4 h-4 mr-2" />}
                  className="!bg-red-600 hover:!bg-red-700 !text-white"
                >
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  iconLeft={<CheckCircle className="w-4 h-4 mr-2" />}
                  className="!bg-green-600 hover:!bg-green-700 !text-white"
                >
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => !open && setShowConfirmDialog(false)}>
        <DialogContent size="lg" className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{`${confirmAction === "approve" ? "Approve" : "Reject"} ${getTypeLabel(request.requestType)} Request`}</DialogTitle>
            <DialogDescription>
              {confirmAction === "approve" 
                ? getApprovalDescription(request.requestType)
                : `Are you sure you want to reject this ${getTypeLabel(request.requestType).toLowerCase()} request?`}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex-1 overflow-y-auto max-h-none">
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
                  {getTypeSpecificDetails(request)}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-reply" className="block text-sm font-medium text-gray-700">
                  Reply to Student {confirmAction === "approve" ? "(Optional)" : "(Required)"}
                </label>
                <textarea
                  id="confirm-reply"
                  value={reply}
                  readOnly
                  disabled
                  placeholder={`Enter your ${confirmAction === "approve" ? "approval" : "rejection"} message...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm resize-none bg-gray-50 text-gray-700 cursor-not-allowed"
                  rows={4}
                />
                <p className="text-xs text-gray-500 italic">Reply is entered in the request details dialog</p>
                {confirmAction === "reject" && !reply.trim() && (
                  <p className="text-sm text-red-600">Please provide a reason for rejection in the request details dialog</p>
                )}
                {confirmAction === "approve" && request.requestType === "meeting_reschedule" && !selectedRoomID && (
                  <p className="text-sm text-red-600">Please select a room for the rescheduled meeting in the request details dialog</p>
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
              disabled={
                (confirmAction === "reject" && !reply.trim()) ||
                (confirmAction === "approve" && request.requestType === "meeting_reschedule" && !selectedRoomID)
              }
            >
              {confirmAction === "approve" 
                ? `Approve ${getTypeLabel(request.requestType)}`
                : `Reject ${getTypeLabel(request.requestType)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
