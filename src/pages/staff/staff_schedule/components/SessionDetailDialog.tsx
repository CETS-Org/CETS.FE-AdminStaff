// src/pages/staff/staff_schedule/components/SessionDetailDialog.tsx
import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Label from "@/components/ui/Label";
import {
  Edit,
  Save,
  Trash2,
  MapPin,
  Clock,
  FileText,
  AlertCircle,
  Power,
  GraduationCap,
  BookOpen,
  User,
  Loader2,
  RotateCcw,
  Plus,
  AlertTriangle,
} from "lucide-react";

// Hooks & APIs
import { useLookupOptions } from "@/pages/staff/staff_classes/shared/useLookupOptions";
import {
  updateClassMeeting,
  deleteClassMeeting,
  createClassMeeting,
  getRoomOptions,
} from "../data/schedule.api";
import { getAvailableTeachersForClass } from "@/pages/staff/staff_classes/data/classPlacement.api";

// Types
import type {
  ClassMeetingResponseDTO,
  UpdateClassMeetingRequestDTO,
  CreateClassMeetingRequestDTO,
  LookupOption,
} from "../data/schedule.types";
import type { TeacherOption } from "@/pages/staff/staff_classes/data/classPlacement.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionData: ClassMeetingResponseDTO | null;
  contextClassId?: string;
  contextCourseId?: string;
  onSuccess: () => void;
};

export default function SessionDetailDialog({
  open,
  onOpenChange,
  sessionData,
  contextClassId,
  contextCourseId,
  onSuccess,
}: Props) {
  const isCreateMode = !sessionData;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  // State cho delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { timeslotOptions } = useLookupOptions(true);
  const [roomOptions, setRoomOptions] = useState<LookupOption[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<LookupOption[]>([]);

  const [formData, setFormData] = useState<
    Partial<UpdateClassMeetingRequestDTO & CreateClassMeetingRequestDTO>
  >({});

  const getDayOfWeek = (dateStr: string) => {
    if (!dateStr) return 0;
    return new Date(dateStr).getDay();
  };

  /** ✅ Fetch teachers: ưu tiên lấy courseId từ sessionData, fallback sang contextCourseId */
  const fetchAvailableTeachers = useCallback(
    async (targetDate: string, targetSlotId: string) => {
      if (!targetDate || !targetSlotId) return;

      const effectiveCourseId =
        (sessionData as any)?.courseId ||
        contextCourseId ||
        (sessionData as any)?.courseID ||
        "";

      if (!effectiveCourseId || effectiveCourseId === "all") {
        console.warn("No valid courseId when fetching teachers", {
          effectiveCourseId,
          sessionData,
          contextCourseId,
        });
        setTeacherOptions([]);
        return;
      }

      try {
        setIsLoadingTeachers(true);

        const res = await getAvailableTeachersForClass({
          courseId: effectiveCourseId,
          startDate: targetDate,
          endDate: targetDate,
          schedules: [
            {
              dayOfWeek: getDayOfWeek(targetDate),
              timeSlotID: targetSlotId,
            },
          ],
        });

        const opts = res.data.map((t: TeacherOption) => ({
          value: t.id,
          label: `${t.fullName} (${t.email})`,
        }));
        setTeacherOptions(opts);
      } catch (err) {
        console.error("Failed to fetch teachers", err);
        setTeacherOptions([]);
      } finally {
        setIsLoadingTeachers(false);
      }
    },
    [sessionData, contextCourseId]
  );

  /** Khởi tạo form cho create / edit */
  const initializeForm = useCallback(() => {
    if (isCreateMode) {
      // CREATE MODE
      setFormData({
        classID: contextClassId,
        isStudy: true,
        isActive: true,
        isDeleted: false,
        onlineMeetingUrl: "",
        passcode: "",
        progressNote: "",
        recordingUrl: "",
        coveredTopicID: "00000000-0000-0000-0000-000000000000",
        date: "",
        slotID: "",
        roomID: "",
        teacherAssignmentID: "",
      });
      setIsEditing(true);
      setTeacherOptions([]); // reset teacher list
    } else if (sessionData) {
      // EDIT MODE
      setIsEditing(false);

      const matchedSlot = timeslotOptions.find((t) =>
        t.label.includes(sessionData.slot)
      );
      const initialSlotID = sessionData.slotID || matchedSlot?.value || "";

      setFormData({
        id: sessionData.id,
        slotID: initialSlotID,
        date: sessionData.date,
        isStudy: sessionData.isStudy,
        roomID: sessionData.roomID,
        teacherAssignmentID: sessionData.teacherAssignmentID,
        onlineMeetingUrl: sessionData.onlineMeetingUrl,
        passcode: sessionData.passcode,
        progressNote: sessionData.progressNote,
        recordingUrl: sessionData.recordingUrl,
        coveredTopicID: "00000000-0000-0000-0000-000000000000",
        isActive: sessionData.isActive,
        isDeleted: sessionData.isDeleted,
      });

      if (initialSlotID && sessionData.date) {
        fetchAvailableTeachers(sessionData.date, initialSlotID);
      }
    }
  }, [
    isCreateMode,
    sessionData,
    contextClassId,
    timeslotOptions,
    fetchAvailableTeachers,
  ]);

  // Khi Date/Slot thay đổi trong EDIT hoặc CREATE -> fetch teacher
  useEffect(() => {
    if (isEditing && formData.date && formData.slotID) {
      fetchAvailableTeachers(formData.date, formData.slotID);
    }
  }, [isEditing, formData.date, formData.slotID, fetchAvailableTeachers]);

  // Load room options khi mở dialog
  useEffect(() => {
    if (open) {
      getRoomOptions()
        .then((res) => {
          const options = res.data.map((r) => ({
            value: r.id,
            label: `${r.roomCode} (Cap: ${r.capacity})`,
          }));
          setRoomOptions(options);
        })
        .catch((err) => console.error("Failed to load rooms", err));
    }
  }, [open]);

  // Khởi tạo form mỗi khi dialog open
  useEffect(() => {
    if (open) {
      initializeForm();
    }
  }, [open, initializeForm]);

  // --- HANDLERS ---

  const handleSave = async () => {
    if (!formData.date || !formData.slotID) {
      alert("Date and Time Slot are required.");
      return;
    }
    try {
      setIsLoading(true);
      if (isCreateMode) {
        if (!formData.classID) {
          alert("Error: Class context missing.");
          return;
        }
        const createPayload: CreateClassMeetingRequestDTO = {
          classID: formData.classID,
          slotID: formData.slotID,
          date: formData.date,
          roomID: formData.roomID || undefined,
          teacherAssignmentID: formData.teacherAssignmentID || undefined,
          onlineMeetingUrl: formData.onlineMeetingUrl || undefined,
          passcode: formData.passcode || undefined,
          progressNote: formData.progressNote || undefined,
          coveredTopicID:
            "01fabb2c-e4b1-4710-921a-edcc6c7dd17e", 
        };
        await createClassMeeting(createPayload);
      } else {
        if (!formData.id) return;
        const updatePayload: UpdateClassMeetingRequestDTO = {
          ...(formData as UpdateClassMeetingRequestDTO),
          teacherAssignmentID: formData.teacherAssignmentID || undefined,
        };
        await updateClassMeeting(updatePayload);
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Save failed", error);
      const msg =
        error?.response?.data?.message || "Failed to save session.";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Click Delete -> chỉ mở popup confirm
  const handleDeleteClick = () => {
    if (!sessionData || !formData.slotID) return;
    setDeleteConfirmOpen(true);
  };

  // Thực thi delete sau khi confirm
  const executeDelete = async () => {
    if (!sessionData || !formData.slotID) return;
    try {
      setIsLoading(true);
      await deleteClassMeeting(sessionData, formData.slotID);
      onSuccess();
      setDeleteConfirmOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete session.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset all changes?")) {
      initializeForm();
    }
  };

  const toggleStatus = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  if (!isCreateMode && !sessionData) return null;

  // --- UI HELPERS ---
  const displayRoom =
    roomOptions.find((r) => r.value === sessionData?.roomID)?.label ||
    sessionData?.roomID ||
    "No Room Assigned";

  const matchedSlotOption = timeslotOptions.find(
    (t) => t.value === sessionData?.slotID
  );
  const displaySlotName =
    matchedSlotOption?.label || `Slot (${sessionData?.slot})`;

  const statusColor = sessionData?.isActive
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-red-100 text-red-700 border-red-200";
  const statusText = sessionData?.isActive ? "Active" : "Cancelled";
  const typeText = sessionData?.isStudy
    ? "Academic Lesson"
    : "Activity / Break";
  const dialogTitle = isCreateMode
    ? "Create New Session"
    : isEditing
    ? "Edit Session"
    : typeText;

  return (
    <>
      {/* --- MAIN SESSION DIALOG --- */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="lg" className="max-w-2xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex justify-between items-center w-full pr-8">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  {dialogTitle}
                  {!isEditing && !isCreateMode && (
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${statusColor}`}
                    >
                      {statusText}
                    </span>
                  )}
                </DialogTitle>
                {!isCreateMode && !isEditing && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>ID: {sessionData?.id.slice(0, 8)}...</span>
                  </div>
                )}
              </div>

              {!isCreateMode && !isEditing && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleDeleteClick}
                    iconLeft={<Trash2 className="w-4 h-4" />}
                  >
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    iconLeft={<Edit className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <DialogBody className="py-6">
            {/* VIEW MODE */}
            {!isEditing && !isCreateMode && sessionData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600 mt-1">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-blue-500 uppercase block mb-0.5">
                        Date & Time
                      </label>
                      <div className="text-lg font-bold text-gray-900">
                        {sessionData.date}
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {displaySlotName}
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl flex items-start gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-purple-600 mt-1">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-purple-500 uppercase block mb-0.5">
                        Location
                      </label>
                      <div className="text-lg font-bold text-gray-900">
                        {displayRoom}
                      </div>
                      <div className="text-sm text-gray-500">
                        Offline Campus
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex items-start gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-orange-600 mt-1">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-orange-500 uppercase block mb-1">
                        Class Info
                      </label>
                      <div className="text-sm font-bold text-gray-900 line-clamp-1">
                        {sessionData.courseName || "Unknown"}
                      </div>
                      <div className="text-sm font-medium text-gray-600 flex items-center gap-1.5 mt-1">
                        <User className="w-3.5 h-3.5" />{" "}
                        {sessionData.teacherName || "No Teacher"}
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-start gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600 mt-1">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-emerald-500 uppercase block mb-1">
                        Topic / Syllabus
                      </label>
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {sessionData.coveredTopic || "No specific topic"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                    <FileText className="w-4 h-4" />
                    <span>Notes</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-600 text-sm min-h-[80px]">
                    {sessionData.progressNote || "No notes."}
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT/CREATE MODE */
              <div className="space-y-5">
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4 flex items-center gap-3 text-sm text-blue-800">
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-medium">
                    {isCreateMode
                      ? "Creating new session"
                      : `Editing for: ${sessionData?.courseName}`}
                  </span>
                </div>

                {!isCreateMode && (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <AlertCircle
                        className={`w-5 h-5 ${
                          formData.isActive ? "text-green-600" : "text-red-600"
                        }`}
                      />
                      <span className="font-medium text-sm text-gray-700">
                        Status:
                      </span>
                      <span
                        className={`font-bold text-sm ${
                          formData.isActive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formData.isActive ? "Active" : "Cancelled"}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant={formData.isActive ? "danger" : "secondary"}
                      onClick={toggleStatus}
                      iconLeft={<Power className="w-3 h-3" />}
                    >
                      {formData.isActive ? "Cancel Session" : "Re-activate"}
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label required>Date</Label>
                    <Input
                      type="date"
                      value={formData.date || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label required>Time Slot</Label>
                    <Select
                      options={timeslotOptions}
                      value={formData.slotID || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, slotID: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label>Room</Label>
                    <Select
                      options={[
                        { label: "-- Select Room --", value: "" },
                        ...roomOptions,
                      ]}
                      value={formData.roomID || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, roomID: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Label className="mb-0">Instructor</Label>
                      {isLoadingTeachers && (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                      )}
                    </div>
                    <Select
                      disabled={
                        isLoadingTeachers || !formData.date || !formData.slotID
                      }
                      options={[
                        {
                          label: isLoadingTeachers
                            ? "Loading..."
                            : "-- Select Teacher --",
                          value: "",
                        },
                        ...teacherOptions,
                      ]}
                      value={formData.teacherAssignmentID || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          teacherAssignmentID: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <textarea
                    className="w-full min-h-[80px] p-3 rounded-md border border-gray-300 text-sm"
                    value={formData.progressNote || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        progressNote: e.target.value,
                      })
                    }
                    placeholder="Enter notes..."
                  />
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter className="border-t pt-4">
            {isEditing ? (
              <div className="flex justify-end gap-2 w-full">
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  iconLeft={<RotateCcw className="w-4 h-4" />}
                >
                  Reset
                </Button>
                <div className="flex-1" />
                <Button
                  variant="secondary"
                  onClick={() =>
                    isCreateMode ? onOpenChange(false) : setIsEditing(false)
                  }
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  iconLeft={
                    isCreateMode ? (
                      <Plus className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )
                  }
                >
                  {isLoading
                    ? "Saving..."
                    : isCreateMode
                    ? "Create Session"
                    : "Save Changes"}
                </Button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <DialogTitle className="text-lg">Confirm Deletion</DialogTitle>
            </div>
          </DialogHeader>
          <DialogBody>
            <p className="text-gray-600">
              Are you sure you want to delete this session? This action will
              remove the session from the schedule and cannot be undone.
            </p>
            {sessionData && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm">
                <p>
                  <strong>Date:</strong> {sessionData.date}
                </p>
                <p>
                  <strong>Topic:</strong>{" "}
                  {sessionData.coveredTopic || "No topic"}
                </p>
              </div>
            )}
          </DialogBody>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={executeDelete}
              disabled={isLoading}
              iconLeft={
                isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )
              }
            >
              {isLoading ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
