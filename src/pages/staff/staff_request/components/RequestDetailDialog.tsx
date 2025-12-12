import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { CheckCircle, XCircle, Clock, User, Mail, Calendar, AlertCircle, File, Download, MapPin, PauseCircle, AlertTriangle, ExternalLink, Star } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { getAttachmentDownloadUrl, getAcademicRequestHistory, type AcademicRequestHistoryItem } from "@/api/academicRequest.api";
import { getAvailableRoomsForSlot } from "@/api/room.api";
import type { AcademicRequest } from "@/types/academicRequest.type";
import { SuspensionReasonCategoryLabels } from "@/types/suspensionRequest.type";
import { DropoutReasonCategoryLabels, type ExitSurveyData } from "@/types/dropoutRequest.type";
import { AcademicRequestReasonCategoryLabels } from "@/types/academicRequestReasonCategories";

interface StatusLookup {
  id: string;
  name: string;
  code: string;
}

interface RequestDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: AcademicRequest | null;
  onStartReview?: () => void;
  onNeedInfo?: (reply: string) => void;
  onApprove: (reply: string, selectedRoomID?: string) => void;
  onReject: (reply: string) => void;
  onRequestUpdate?: (updatedRequest: AcademicRequest) => void;
  statusLookups?: StatusLookup[];
}

export default function RequestDetailDialog({
  isOpen,
  onClose,
  request,
  onStartReview,
  onNeedInfo,
  onApprove,
  onReject,
  onRequestUpdate,
  statusLookups = []
}: RequestDetailDialogProps) {
  const [reply, setReply] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | "needinfo">("approve");
  const [selectedRoomID, setSelectedRoomID] = useState<string>("");
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [exitSurveyData, setExitSurveyData] = useState<ExitSurveyData | null>(null);
  const [isLoadingExitSurvey, setIsLoadingExitSurvey] = useState(false);
  const [showExitSurvey, setShowExitSurvey] = useState(false);
  const [history, setHistory] = useState<AcademicRequestHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { showToast } = useToast();

  const fetchAvailableRooms = async () => {
    if (!request?.toMeetingDate || !request?.toSlotID) return;
    
    setIsLoadingRooms(true);
    try {
      // Fetch available rooms based on date and slot, checking against class meetings
      const rooms = await getAvailableRoomsForSlot(request.toMeetingDate, request.toSlotID);
      setAvailableRooms(rooms);
      
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

  // Reset reply when dialog opens/closes or request changes
  useEffect(() => {
    if (!isOpen) {
      setReply("");
      setShowConfirmDialog(false);
    }
  }, [isOpen]);

  // Fetch available rooms for meeting reschedule
  useEffect(() => {
    if (request && request.requestType === "meeting_reschedule" && (request.status === "pending" || request.status === "underreview") && request.toMeetingDate && request.toSlotID) {
      fetchAvailableRooms();
    } else {
      setAvailableRooms([]);
      setSelectedRoomID("");
    }
  }, [request?.id, request?.toMeetingDate, request?.toSlotID, request?.requestType, request?.status]);

  // Fetch request history when dialog opens or request changes
  useEffect(() => {
    const loadHistory = async () => {
      if (!isOpen || !request?.id) {
        setHistory([]);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const response = await getAcademicRequestHistory(request.id);
        setHistory(response.data || []);
      } catch (error: any) {
        console.error("Error loading academic request history:", error);
        setHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [isOpen, request?.id]);

  const getStatusLabelFromHistory = (statusID: string): string => {
    const lookup = statusLookups.find(
      (s) => s.id === statusID || s.id.toLowerCase() === statusID.toLowerCase()
    );
    if (!lookup) return "Status changed";
    // Prefer code if it's a clean value like "Pending", otherwise use name
    const label = lookup.name || lookup.code || "Status changed";
    return label;
  };

  const getStatusDotColor = (statusID: string): string => {
    const lookup = statusLookups.find(
      (s) => s.id === statusID || s.id.toLowerCase() === statusID.toLowerCase()
    );
    if (!lookup) return "bg-gray-400";
    
    const statusName = (lookup.name || "").toLowerCase();
    const statusCode = (lookup.code || "").toLowerCase();
    const combinedStatus = `${statusName} ${statusCode}`;
    
    // Map status to appropriate colors
    if (combinedStatus.includes("approved") || combinedStatus.includes("accept") || combinedStatus.includes("resolved")) {
      return "bg-green-500";
    } else if (combinedStatus.includes("rejected") || combinedStatus.includes("reject") || combinedStatus.includes("denied") || combinedStatus.includes("declined")) {
      return "bg-red-500";
    } else if (combinedStatus.includes("underreview") || combinedStatus.includes("under review") || combinedStatus.includes("reviewing")) {
      return "bg-purple-500";
    } else if (combinedStatus.includes("needinfo") || combinedStatus.includes("need info") || combinedStatus.includes("more info")) {
      return "bg-blue-500";
    } else if (combinedStatus.includes("pending") || combinedStatus.includes("submitted")) {
      return "bg-yellow-500";
    } else if (combinedStatus.includes("completed") || combinedStatus.includes("expired")) {
      return "bg-gray-500";
    } else if (combinedStatus.includes("suspended") || combinedStatus.includes("awaitingreturn")) {
      return "bg-orange-500";
    }
    
    return "bg-gray-400";
  };

  if (!request) return null;

  const handleStartReview = () => {
    if (onStartReview) {
      onStartReview();
    }
  };

  const handleNeedInfo = () => {
    if (!reply.trim()) {
      showToast('Please provide a message explaining what information is needed', 'error');
      return;
    }
    setConfirmAction("needinfo");
    setShowConfirmDialog(true);
  };

  const handleApprove = () => {
    // Validate room selection for meeting reschedule
    if (request.requestType === "meeting_reschedule" && request.status === "underreview" && !selectedRoomID) {
      showToast('Please select a room for the rescheduled meeting', 'error');
      return;
    }
    setConfirmAction("approve");
    setShowConfirmDialog(true);
  };

  const handleReject = () => {
    if (!reply.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }
    setConfirmAction("reject");
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = (replyMessage: string) => {
    if (confirmAction === "approve") {
      onApprove(replyMessage, selectedRoomID || undefined);
    } else if (confirmAction === "reject") {
      onReject(replyMessage);
    } else if (confirmAction === "needinfo" && onNeedInfo) {
      onNeedInfo(replyMessage);
    }
    setShowConfirmDialog(false);
    setReply("");
    setSelectedRoomID("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "underreview":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "needinfo":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
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
      case "enrollment_cancellation":
        return "Enrollment Cancellation";
      case "suspension":
        return "Suspension";
      case "dropout":
        return "Dropout";
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
      case "enrollment_cancellation":
        return "Approving this request will cancel the student's enrollment. Please verify the cancellation policy and any refund implications.";
      case "suspension":
        return "Approving this request will suspend the student's enrollment for the specified period. The student's account status will be set to 'Suspended' on the start date.";
      case "dropout":
        return "Approving this request will PERMANENTLY terminate the student's enrollment. This action is IRREVERSIBLE and the student will be marked as 'Dropped Out' on the effective date.\n";
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
      case "suspension":
        return (
          <>
            {req.suspensionStartDate && (
              <p><span className="font-medium">Start Date:</span> {new Date(req.suspensionStartDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            )}
            {req.suspensionEndDate && (
              <p><span className="font-medium">End Date:</span> {new Date(req.suspensionEndDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            )}
            {req.suspensionStartDate && req.suspensionEndDate && (
              <p><span className="font-medium">Duration:</span> {
                Math.ceil((new Date(req.suspensionEndDate).getTime() - new Date(req.suspensionStartDate).getTime()) / (1000 * 60 * 60 * 24))
              } days</p>
            )}
            {req.expectedReturnDate && (
              <p><span className="font-medium">Expected Return:</span> {new Date(req.expectedReturnDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            )}
            {req.reasonCategory && (
              <p><span className="font-medium">Reason Category:</span> {
                req.reasonCategory in SuspensionReasonCategoryLabels
                  ? SuspensionReasonCategoryLabels[req.reasonCategory as keyof typeof SuspensionReasonCategoryLabels]
                  : req.reasonCategory in AcademicRequestReasonCategoryLabels
                  ? AcademicRequestReasonCategoryLabels[req.reasonCategory as keyof typeof AcademicRequestReasonCategoryLabels]
                  : req.reasonCategory
              }</p>
            )}
          </>
        );
      case "dropout":
        return (
          <>
            {req.effectiveDate && (
              <p><span className="font-medium">Effective Date:</span> {new Date(req.effectiveDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            )}
            {req.completedExitSurvey !== undefined && (
              <p><span className="font-medium">Exit Survey:</span> {req.completedExitSurvey ? 'Completed ✓' : 'Not Completed ✗'}</p>
            )}
            {req.reasonCategory && (
              <p><span className="font-medium">Reason Category:</span> {
                req.reasonCategory in DropoutReasonCategoryLabels
                  ? DropoutReasonCategoryLabels[req.reasonCategory as keyof typeof DropoutReasonCategoryLabels]
                  : req.reasonCategory
              }</p>
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

  // Load exit survey data for dropout requests from MongoDB
  const handleViewExitSurvey = async () => {
    if (!request.exitSurveyId) {
      showToast('Exit survey not available', 'error');
      return;
    }

    setIsLoadingExitSurvey(true);
    try {
      const { getExitSurveyById } = await import('@/api/exitSurvey.api');
      const surveyResponse = await getExitSurveyById(request.exitSurveyId);
      
      // Map MongoDB response to ExitSurveyData format
      const surveyData: ExitSurveyData = {
        studentID: surveyResponse.studentId,
        reasonCategory: surveyResponse.reasonCategory as any,
        reasonDetail: surveyResponse.reasonDetail,
        feedback: surveyResponse.feedback,
        futureIntentions: surveyResponse.futureIntentions,
        comments: surveyResponse.comments,
        acknowledgesPermanent: surveyResponse.acknowledgesPermanent,
        completedAt: surveyResponse.completedAt,
      };
      
      setExitSurveyData(surveyData);
      setShowExitSurvey(true);
    } catch (error: any) {
      console.error('Error loading exit survey:', error);
      showToast('Failed to load exit survey', 'error');
    } finally {
      setIsLoadingExitSurvey(false);
    }
  };

  // Render rating stars for exit survey
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent size="xl" className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>View and manage academic request details</DialogDescription>
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
                      {request.priority ? request.priority.charAt(0).toUpperCase() + request.priority.slice(1).toLowerCase() : request.priority}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        request.status === "pending" || request.status === "submitted" ? "bg-yellow-100 text-yellow-800" :
                        request.status === "underreview" ? "bg-purple-100 text-purple-800" :
                        request.status === "needinfo" ? "bg-blue-100 text-blue-800" :
                        request.status === "approved" || request.status === "resolved" ? "bg-green-100 text-green-800" :
                        request.status === "rejected" ? "bg-red-100 text-red-800" :
                        request.status === "completed" ? "bg-gray-100 text-gray-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {request.status === "underreview" ? "Under Review" : 
                         request.status === "needinfo" ? "Need Info" : 
                         request.status}
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

              {/* Request History / Logs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    Request History
                  </h3>
                  {isLoadingHistory && (
                    <span className="text-xs text-gray-500">Loading...</span>
                  )}
                </div>
                {history.length === 0 && !isLoadingHistory && (
                  <p className="text-xs text-gray-500 italic">
                    No history records found for this request yet.
                  </p>
                )}
                {history.length > 0 && (
                  <div className="border border-gray-200 rounded-lg divide-y max-h-60 overflow-y-auto bg-white">
                    {history.map((item) => (
                      <div key={item.id} className="px-3 py-2 text-xs flex items-center gap-3">
                        <div className="flex items-center justify-center">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${getStatusDotColor(item.statusID)}`} />
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-800">
                              {getStatusLabelFromHistory(item.statusID)}
                            </span>
                            {item.attachmentUrl && (
                              <div className="text-[11px] text-gray-600 mt-0.5">
                                Attachment updated
                              </div>
                            )}
                          </div>
                          {item.updatedAt && (
                            <span className="text-[11px] text-gray-500 whitespace-nowrap ml-2">
                              {new Date(item.updatedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reason Category */}
              {request.reasonCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason Category</label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {request.reasonCategory in DropoutReasonCategoryLabels
                      ? DropoutReasonCategoryLabels[request.reasonCategory as keyof typeof DropoutReasonCategoryLabels]
                      : request.reasonCategory in SuspensionReasonCategoryLabels
                      ? SuspensionReasonCategoryLabels[request.reasonCategory as keyof typeof SuspensionReasonCategoryLabels]
                      : request.reasonCategory in AcademicRequestReasonCategoryLabels
                      ? AcademicRequestReasonCategoryLabels[request.reasonCategory as keyof typeof AcademicRequestReasonCategoryLabels]
                      : request.reasonCategory}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{request.reason}</p>
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

              {/* Dropout Details */}
              {request.requestType === "dropout" && (
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 bg-red-50/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-900">Dropout Request Details</span>
                    </div>
                    <div className="space-y-4">
                      {/* Effective Date */}
                      {request.effectiveDate && (
                        <div className="bg-white rounded-md p-3 border border-red-200">
                          <div className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Effective Date
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(request.effectiveDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <p className="text-xs text-red-600 mt-1">
                            Student enrollment will be terminated on this date
                          </p>
                        </div>
                      )}

                      {/* Exit Survey Status - Always show for dropout requests */}
                      <div className={`rounded-md p-3 border ${
                        request.completedExitSurvey 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className={`text-xs font-semibold mb-2 flex items-center gap-2 ${
                          request.completedExitSurvey ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                          {request.completedExitSurvey ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          Exit Survey Status
                        </div>
                        <div className="text-sm font-medium text-gray-900 mb-2">
                          {request.completedExitSurvey ? 'Completed' : 'Not Completed'}
                        </div>
                        {request.completedExitSurvey && request.exitSurveyId && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleViewExitSurvey}
                            loading={isLoadingExitSurvey}
                            iconLeft={<ExternalLink className="w-4 h-4 mr-1" />}
                          >
                          
                            View Exit Survey
                          </Button>
                        )}
                        {/* Debug info - remove after testing */}
                        {!request.exitSurveyId && request.completedExitSurvey && (
                          <p className="text-xs text-red-600 mt-2">
                            Exit survey data is missing from the request
                          </p>
                        )}
                      </div>

                      {/* Important Notice for Staff */}
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-red-800">
                            <p className="font-semibold mb-1">⚠️ PERMANENT ACTION - Review Checklist:</p>
                            <ul className="space-y-1 list-disc list-inside">
                              <li>Verify exit survey is completed</li>
                              <li>Check for outstanding financial obligations</li>
                              <li>Confirm student understands this is permanent</li>
                              <li>Verify all required documentation is provided</li>
                              <li>Ensure this is not a temporary leave (use Suspension instead)</li>
                              <li>Review exit survey feedback for improvement areas</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Suspension Details */}
              {request.requestType === "suspension" && (request.suspensionStartDate || request.suspensionEndDate) && (
                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 bg-orange-50/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <PauseCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-orange-900">Suspension Period Details</span>
                    </div>
                    <div className="space-y-4">
                      {/* Suspension Period */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {request.suspensionStartDate && (
                          <div className="bg-white rounded-md p-3 border border-orange-200">
                            <div className="text-xs font-semibold text-orange-700 mb-2 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              Start Date
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(request.suspensionStartDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                        {request.suspensionEndDate && (
                          <div className="bg-white rounded-md p-3 border border-orange-200">
                            <div className="text-xs font-semibold text-orange-700 mb-2 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              End Date
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(request.suspensionEndDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Duration */}
                      {request.suspensionStartDate && request.suspensionEndDate && (
                        <div className="bg-white rounded-md p-3 border border-orange-200">
                          <div className="text-xs font-semibold text-orange-700 mb-2 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Duration
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {Math.ceil((new Date(request.suspensionEndDate).getTime() - new Date(request.suspensionStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </div>
                        </div>
                      )}

                      {/* Expected Return Date */}
                      {request.expectedReturnDate && (
                        <div className="bg-green-50 rounded-md p-3 border border-green-200">
                          <div className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3" />
                            Expected Return Date
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(request.expectedReturnDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            Student is expected to return on this date
                          </p>
                        </div>
                      )}

                      {/* Important Notice for Staff */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-yellow-800">
                            <p className="font-semibold mb-1">Review Checklist:</p>
                            <ul className="space-y-1 list-disc list-inside">
                              <li>Verify student has no unpaid tuition</li>
                              <li>Check student suspension count this year (max 2)</li>
                              <li>Ensure proper documentation is provided (required for 30+ days)</li>
                              <li>Confirm dates meet policy requirements (7-90 days, 7-day notice)</li>
                              <li>Verify no overlapping suspension periods</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
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
              {request.status !== "pending" && request.status !== "underreview" && request.staffResponse && (
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
              
              {/* Reply Section - Show for pending and underreview */}
              {(request.status === "pending" || request.status === "underreview") && (
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply {request.status === "underreview" && "(Required for Need Info/Reject)"}
                  </label>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={request.status === "pending" 
                    ? "Enter your response to the student..." 
                    : "Enter your response to the student (required for Need Info and Reject actions)..."}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter>
            {request.status === "pending" && onStartReview && (
              <Button
                onClick={handleStartReview}
                iconLeft={<Clock className="w-4 h-4 mr-2" />}
                className="!bg-blue-600 hover:!bg-blue-700 !text-white"
              >
                Start Review
              </Button>
            )}
            {request.status === "underreview" && (
              <>
                <Button
                  onClick={handleNeedInfo}
                  iconLeft={<AlertCircle className="w-4 h-4 mr-2" />}
                  className="!bg-orange-600 hover:!bg-orange-700 !text-white"
                  disabled={!reply.trim()}
                >
                  Need Info
                </Button>
                <Button
                  onClick={handleReject}
                  iconLeft={<XCircle className="w-4 h-4 mr-2" />}
                  className="!bg-red-600 hover:!bg-red-700 !text-white"
                  disabled={!reply.trim()}
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
            <DialogTitle>
              {confirmAction === "approve" ? "Approve" : 
               confirmAction === "reject" ? "Reject" : 
               "Request More Information"} {getTypeLabel(request.requestType)} Request
            </DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {confirmAction === "approve" 
                ? getApprovalDescription(request.requestType)
                : confirmAction === "reject"
                ? `Are you sure you want to reject this ${getTypeLabel(request.requestType).toLowerCase()} request?`
                : `This will mark the request as needing more information and return it to pending status. The student will be notified to provide additional details.`}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex-1 overflow-y-auto max-h-none">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {confirmAction === "approve" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : confirmAction === "reject" ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
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
                  placeholder={`Enter your ${confirmAction === "approve" ? "approval" : confirmAction === "reject" ? "rejection" : "information request"} message...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm resize-none bg-gray-50 text-gray-700 cursor-not-allowed"
                  rows={4}
                />
                <p className="text-xs text-gray-500 italic">Reply is entered in the request details dialog</p>
                {(confirmAction === "reject" || confirmAction === "needinfo") && !reply.trim() && (
                  <p className="text-sm text-red-600">Please provide a {confirmAction === "reject" ? "reason for rejection" : "message explaining what information is needed"} in the request details dialog</p>
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
              className={`${
                confirmAction === "approve" ? "bg-green-600 hover:bg-green-700" : 
                confirmAction === "reject" ? "bg-red-600 hover:bg-red-700" :
                "bg-orange-600 hover:bg-orange-700"
              } text-white`}
              disabled={
                ((confirmAction === "reject" || confirmAction === "needinfo") && !reply.trim()) ||
                (confirmAction === "approve" && request.requestType === "meeting_reschedule" && !selectedRoomID)
              }
            >
              {confirmAction === "approve" 
                ? `Approve ${getTypeLabel(request.requestType)}`
                : confirmAction === "reject"
                ? `Reject ${getTypeLabel(request.requestType)}`
                : `Request More Information`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exit Survey Viewing Modal */}
      {showExitSurvey && exitSurveyData && (
        <Dialog open={showExitSurvey} onOpenChange={setShowExitSurvey}>
          <DialogContent size="xl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <File className="w-5 h-5 text-blue-600" />
                </div>
                Exit Survey Response
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">Reason Category</div>
                    <div className="text-sm text-gray-900 font-medium">
                      {DropoutReasonCategoryLabels[exitSurveyData.reasonCategory as keyof typeof DropoutReasonCategoryLabels] || exitSurveyData.reasonCategory}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">Reason Detail</div>
                    <div className="text-sm text-gray-900">{exitSurveyData.reasonDetail}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">Completed At</div>
                    <div className="text-sm text-gray-900">
                      {new Date(exitSurveyData.completedAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Ratings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Feedback Ratings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Teacher Quality</div>
                      {renderRatingStars(exitSurveyData.feedback.teacherQuality)}
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Class Pacing</div>
                      {renderRatingStars(exitSurveyData.feedback.classPacing)}
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Materials Quality</div>
                      {renderRatingStars(exitSurveyData.feedback.materials)}
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Staff Service</div>
                      {renderRatingStars(exitSurveyData.feedback.staffService)}
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Schedule Flexibility</div>
                      {renderRatingStars(exitSurveyData.feedback.schedule)}
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Facilities</div>
                      {renderRatingStars(exitSurveyData.feedback.facilities)}
                    </div>
                  </div>
                </div>

                {/* Comments & Future Intentions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Additional Information</h3>
                  
                  <div className="bg-white border rounded-lg p-4">
                    <div className="text-xs font-semibold text-gray-500 mb-2">Comments</div>
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {exitSurveyData.comments || 'No comments provided'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-xs font-semibold text-gray-500 mb-2">
                        Would recommend to others?
                      </div>
                      <div className={`text-sm font-medium ${
                        exitSurveyData.futureIntentions.wouldRecommendToOthers ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {exitSurveyData.futureIntentions.wouldRecommendToOthers ? 'Yes ✓' : 'No ✗'}
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg p-4">
                      <div className="text-xs font-semibold text-gray-500 mb-2">
                        Would return in future?
                      </div>
                      <div className={`text-sm font-medium ${
                        exitSurveyData.futureIntentions.wouldReturnInFuture ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {exitSurveyData.futureIntentions.wouldReturnInFuture ? 'Yes ✓' : 'No ✗'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="secondary"
                    onClick={() => setShowExitSurvey(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
