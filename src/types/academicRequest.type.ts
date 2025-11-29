export interface AcademicRequestResponse {
  id: string;
  studentID: string;
  studentName?: string;
  studentEmail?: string;
  requestTypeID: string;
  requestTypeName?: string;
  academicRequestStatusID: string;
  statusName?: string;
  priorityID?: string;
  priorityName?: string;
  reason: string;
  createdAt: string;
  fromClassID?: string;
  fromClassName?: string;
  toClassID?: string;
  toClassName?: string;
  effectiveDate?: string;
  // For class transfer - specific meeting details
  fromMeetingDate?: string;
  fromSlotID?: string;
  fromSlotName?: string;
  toMeetingDate?: string;
  toSlotID?: string;
  toSlotName?: string;
  attachmentUrl?: string;
  processedBy?: string;
  processedByName?: string;
  processedAt?: string;
  staffResponse?: string;
  // For meeting reschedule
  classMeetingID?: string;
  meetingInfo?: string;
  // New meeting details (for meeting reschedule, uses toMeetingDate and toSlotID)
  newRoomID?: string;
  newRoomName?: string;
  // For suspension requests
  suspensionStartDate?: string;
  suspensionEndDate?: string;
  reasonCategory?: string;
  expectedReturnDate?: string;
  // For dropout requests
  completedExitSurvey?: boolean;
  exitSurveyId?: string;
}

export interface ProcessAcademicRequest {
  requestID: string;
  statusID: string;
  description?: string;
  staffID: string;
  attachmentUrl?: string;
  // For meeting reschedule - selected room by staff
  selectedRoomID?: string;
}

// UI-specific Request type (mapped from AcademicRequestResponse)
export interface AcademicRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  requestType: "course_change" | "schedule_change" | "refund" | "other" | "class_transfer" | "meeting_reschedule" | "enrollment_cancellation" | "suspension" | "dropout";
  description: string;
  status: "pending" | "underreview" | "needinfo" | "approved" | "rejected";
  submittedDate: string;
  priority: "low" | "medium" | "high";
  reason: string;
  staffResponse?: string;
  processedByName?: string;
  processedAt?: string;
  attachmentUrl?: string;
  // Class transfer fields
  fromClassID?: string;
  fromClassName?: string;
  toClassID?: string;
  toClassName?: string;
  effectiveDate?: string;
  // For class transfer - specific meeting details
  fromMeetingDate?: string;
  fromSlotID?: string;
  fromSlotName?: string;
  toMeetingDate?: string;
  toSlotID?: string;
  toSlotName?: string;
  // Meeting reschedule fields
  classMeetingID?: string;
  meetingInfo?: string;
  // New meeting details (for meeting reschedule, uses toMeetingDate and toSlotID)
  newRoomID?: string;
  newRoomName?: string;
  // For suspension requests
  suspensionStartDate?: string;
  suspensionEndDate?: string;
  reasonCategory?: string;
  expectedReturnDate?: string;
  // For dropout requests
  completedExitSurvey?: boolean;
  exitSurveyId?: string;
}

