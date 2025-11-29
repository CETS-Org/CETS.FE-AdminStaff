import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import type { Room, RoomType } from "@/types/room.type";
import {
  DoorOpen,
  Users,
  Tag,
  Activity,
  Hash,
  GraduationCap,
  User,
  Calendar,
  Clock,
  X,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import {
  getSlotInfo,
  type SlotInfoResponse,
  bookSlot,
  getBookingCourses,
  getBookingClassesByCourse,
  getBookingTeachersByCourse,
  type BookingCourse,
  type BookingClass,
  type BookingTeacher,
  cancelBooking,
} from "@/api/room.api";

interface ClassInfo {
  id: string;
  className: string;
  courseName: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  roomTypeName?: string;
}

interface RoomSchedulePopupProps {
  open: boolean;
  onClose: () => void;
  room: Room;
  roomTypes: RoomType[];
  dayIndex: number;
  dayName: string;
  timeSlot: number; // Slot number (1-5)
  timeSlotDisplay: string; // Display time (e.g., "09:00")
  date: Date;
  classInfo: ClassInfo | null; // Can be null if no class is scheduled
  onBookingSuccess?: () => void;
}

export default function RoomSchedulePopup({
  open,
  onClose,
  room,
  roomTypes,
  dayName,
  timeSlot,
  timeSlotDisplay,
  date,
  classInfo,
  onBookingSuccess,
}: RoomSchedulePopupProps) {
  const getRoomTypeName = (roomTypeId: string): string => {
    if (room.roomTypeName) return room.roomTypeName;
    const roomType = roomTypes.find((rt) => rt.id === roomTypeId);
    return roomType?.name || "Unknown";
  };

  // Get the raw status string from backend sources (slot-info, room list)
  const getRawRoomStatus = () => {
    const backendStatus = slotInfo?.room?.status as string | undefined;
    const rawStatus =
      backendStatus ||
      room.roomStatusName ||
      room.roomStatus ||
      (room.isActive ? "Available" : "Maintenance");
    return rawStatus.trim();
  };

  // Whether this room can be booked (not Maintenance/Unavailable)
  const isRoomBookable = () => {
    const status = getRawRoomStatus();
    const normalized = status.toLowerCase();
    if (normalized.includes("maintenance") || normalized.includes("unavailable")) {
      return false;
    }
    return true;
  };

  const getRoomStatus = () => {
    const status = getRawRoomStatus();
    const normalized = status.toLowerCase();

    switch (status) {
      case "Available":
        return {
          label: "Available",
          badgeClass:
            "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300",
          dotClass: "bg-green-500",
        };
      case "Reserved":
        return {
          label: "Reserved",
          badgeClass:
            "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300",
          dotClass: "bg-green-500",
        };
      case "InUse":
      case "In Use":
        return {
          label: "In Use",
          badgeClass:
            "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-300",
          dotClass: "bg-orange-500",
        };
      case "Maintenance":
        return {
          label: "Maintenance",
          badgeClass:
            "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300",
          dotClass: "bg-red-500",
        };
      case "Unavailable":
        return {
          label: "Unavailable",
          badgeClass:
            "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300",
          dotClass: "bg-red-500",
        };
      default:
        if (normalized.includes("available") || normalized.includes("reserved")) {
          return {
            label: status,
            badgeClass:
              "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300",
            dotClass: "bg-green-500",
          };
        }
        if (normalized.includes("in use")) {
          return {
            label: status,
            badgeClass:
              "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-300",
            dotClass: "bg-orange-500",
          };
        }
        if (normalized.includes("maintenance") || normalized.includes("unavailable")) {
          return {
            label: status,
            badgeClass:
              "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300",
            dotClass: "bg-red-500",
          };
        }
        return {
          label: status,
          badgeClass:
            "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300",
          dotClass: "bg-gray-400",
        };
    }
  };

  // Calculate end time based on slot number
  const getEndTime = (slot: number): string => {
    const timeSlots: Record<number, string> = {
      1: "13:30", // Slot 1 (9:00) ends at 13:30
      2: "15:00", // Slot 2 (13:30) ends at 15:00
      3: "16:30", // Slot 3 (15:00) ends at 16:30
      4: "18:00", // Slot 4 (16:30) ends at 18:00
      5: "19:30", // Slot 5 (18:00) ends at 19:30
    };
    return timeSlots[slot] || "";
  };

  const slotTime = timeSlotDisplay;
  const endTime = getEndTime(timeSlot);

  // Check if classInfo exists
  const hasClass = !!classInfo;

  // Slot detail from backend
  const [slotInfo, setSlotInfo] = useState<SlotInfoResponse | null>(null);
  const [loadingSlotInfo, setLoadingSlotInfo] = useState(false);
  const [slotInfoError, setSlotInfoError] = useState<string | null>(null);

  // Booking form state (for empty slots)
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState({
    courseId: "",
    classId: "",
    teacherId: "",
  });

  const [courses, setCourses] = useState<BookingCourse[]>([]);
  const [classes, setClasses] = useState<BookingClass[]>([]);
  const [teachers, setTeachers] = useState<BookingTeacher[]>([]);

  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleBookingFormChange = (field: "courseId" | "classId" | "teacherId", value: string) => {
    setBookingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBookSlotClick = () => {
    setShowBookingForm(true);
    setBookingError(null);
  };

  const handleCancelBooking = () => {
    setShowBookingForm(false);
    setBookingError(null);
    setBookingSubmitting(false);
    setBookingData({
      courseId: "",
      classId: "",
      teacherId: "",
    });
  };

  const handleSubmitBooking = async () => {
    try {
      setBookingSubmitting(true);
      setBookingError(null);

      const isoDate = date.toISOString().split("T")[0];

      await bookSlot({
        classId: bookingData.classId,
        courseId: bookingData.courseId,
        teacherId: bookingData.teacherId,
        roomId: room.id,
        slotNumber: timeSlot,
        date: isoDate,
      });

      // After successful booking, close form
      setShowBookingForm(false);
      setBookingData({ courseId: "", classId: "", teacherId: "" });

      // Let parent refresh rooms / statuses
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      setBookingError("Failed to book this slot. Please try again.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Prefer detailed class from slotInfo, and use meetingId as booking identifier
  const effectiveClass = slotInfo?.currentClass
    ? {
        id: slotInfo.currentClass.meetingId,
        className: slotInfo.currentClass.className,
        courseName: slotInfo.currentClass.courseName,
        teacherName: slotInfo.currentClass.teacherName,
        startDate: classInfo?.startDate || "",
        endDate: classInfo?.endDate || "",
        roomTypeName: classInfo?.roomTypeName,
      }
    : classInfo;

  const handleCancelExistingBooking = async () => {
    if (!effectiveClass?.id) return;
    try {
      setCancelSubmitting(true);
      setCancelError(null);
      await cancelBooking(effectiveClass.id);
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      setCancelError("Failed to cancel booking. Please try again.");
    } finally {
      setCancelSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchSlotInfo = async () => {
      if (!hasClass) return;
      try {
        setLoadingSlotInfo(true);
        setSlotInfoError(null);
        const isoDate = date.toISOString().split("T")[0];
        const data = await getSlotInfo(room.id, isoDate, timeSlot);
        setSlotInfo(data);
      } catch (error) {
        console.warn("Failed to load slot info", error);
        setSlotInfoError("Failed to load detailed slot information.");
      } finally {
        setLoadingSlotInfo(false);
      }
    };

    if (open) {
      setSlotInfo(null);
      setSlotInfoError(null);
      fetchSlotInfo();
    }
  }, [open, room.id, timeSlot, date, hasClass]);

  // Calculate popup position to center in viewport
  const [popupLeft, setPopupLeft] = useState<string>('50%');

  useEffect(() => {
    if (!open) return;

    const calculatePosition = () => {
      // Wait for layout to settle
      requestAnimationFrame(() => {
        // Always center in viewport (window center)
        setPopupLeft('50%');
      });
    };

    // Calculate immediately
    calculatePosition();
    
    // Recalculate on resize
    const handleResize = () => calculatePosition();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  // Load courses when popup opens (for empty slots and bookable rooms)
  useEffect(() => {
    if (!open || hasClass || !isRoomBookable()) return;

    const fetchCourses = async () => {
      const data = await getBookingCourses();
      setCourses(data || []);
    };

    fetchCourses();
  }, [open, hasClass]);

  // When course changes, load classes & teachers for that course
  useEffect(() => {
    if (!bookingData.courseId) {
      setClasses([]);
      setTeachers([]);
      setBookingData((prev) => ({ ...prev, classId: "", teacherId: "" }));
      return;
    }

    const fetchDependentData = async () => {
      const [cls, tchs] = await Promise.all([
        getBookingClassesByCourse(bookingData.courseId),
        getBookingTeachersByCourse(bookingData.courseId),
      ]);
      setClasses(cls || []);
      setTeachers(tchs || []);
      setBookingData((prev) => ({ ...prev, classId: "", teacherId: "" }));
    };

    fetchDependentData();
  }, [bookingData.courseId]);

  // Reset form when popup closes
  useEffect(() => {
    if (!open) {
      setSlotInfo(null);
      setSlotInfoError(null);
    }
  }, [open]);

  // Debug log
  console.log('RoomSchedulePopup render:', { open, room: room.roomCode, classInfo, hasClass, popupLeft });

  const handleBookThisSlotClick = () => {
    console.log('Book This Slot clicked for room', room.id, 'date', date, 'slot', timeSlot);
    handleBookSlotClick();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      console.log('Dialog onOpenChange:', isOpen);
      if (!isOpen) onClose();
    }}>
      <DialogContent 
        className="sm:max-w-[550px] overflow-y-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-h-[90vh]"
        style={{
          margin: 0,
        }}
      >
        {/* Decorative gradient background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-5"></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-all duration-200 z-10 hover:scale-110 active:scale-95 shadow-sm"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-3 pr-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <DoorOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Room Information
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pb-4 relative z-10">
          {/* Room Header */}
          <div className="text-center pb-6 border-b-2 border-gray-100 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent rounded-t-xl"></div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-200">
                <DoorOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{room.roomCode}</h3>
              <p className="text-sm font-medium text-gray-600 mb-3">{getRoomTypeName(room.roomTypeId)}</p>
              
              {/* Status Badge */}
              <div className="mt-3">
                {(() => {
                  const status = getRoomStatus();
                  return (
                    <span
                      className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm ${status.badgeClass}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 animate-pulse ${status.dotClass}`}
                      />
                      {status.label}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Selected Time Slot Info */}
          <div className="relative p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-md overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Time Slot {timeSlot}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {dayName} | {slotTime}-{endTime}
              </p>
            </div>
          </div>

          {/* Room Information */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-gray-800 border-l-4 border-blue-500 pl-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
              Room Information
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <Hash className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Room Code
                  </label>
                  <p className="text-sm font-bold text-gray-900 font-mono truncate">
                    {room.roomCode}
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Room Type
                  </label>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {getRoomTypeName(room.roomTypeId)}
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Capacity
                  </label>
                  <p className="text-sm font-bold text-gray-900">
                    {room.capacity} <span className="text-xs font-normal text-gray-500">people</span>
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                    Status
                  </label>
                  <p className="text-sm font-bold text-gray-900">
                    {getRoomStatus().label}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Class Information */}
          <div className="space-y-4 pt-4 border-t-2 border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-gray-800 border-l-4 border-green-500 pl-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                Current Class
              </h4>
              {hasClass && (
                <Button 
                  variant="danger" 
                  size="sm"
                  iconLeft={<X className="w-4 h-4" />}
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={cancelSubmitting}
                >
                  {cancelSubmitting ? "Cancelling..." : "Cancel Booking"}
                </Button>
              )}
            </div>

            {hasClass ? (
              <>
                {/* Show class information if class exists */}
                <div className="relative p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl border-2 border-green-200 shadow-lg space-y-4 overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-200/40 to-teal-200/40 rounded-full -mr-20 -mt-20"></div>
                  <div className="relative space-y-4">
                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 pt-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                          Class Name
                        </label>
                        <p className="text-base font-bold text-gray-900">
                          {effectiveClass?.className}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <Tag className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 pt-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                          Course
                        </label>
                        <p className="text-base font-bold text-gray-900">
                          {effectiveClass?.courseName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 pt-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                          Teacher
                        </label>
                        <p className="text-base font-bold text-gray-900">
                          {effectiveClass?.teacherName}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </>
            ) : (
              // Show message if no class is scheduled
              <div className="space-y-4">
                {!showBookingForm ? (
                  <>
                    <div className="relative p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      <div className="relative flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                          <Info className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            No class is scheduled for this room.
                          </p>
                        </div>
                      </div>
                    </div>

                    {isRoomBookable() ? (
                      <Button
                        className="w-full"
                        size="lg"
                        iconLeft={<Calendar className="w-4 h-4" />}
                        onClick={handleBookThisSlotClick}
                      >
                        Book This Slot
                      </Button>
                    ) : (
                      <p className="text-xs text-red-600 font-medium text-center">
                        This room is not available for booking (Maintenance / Unavailable).
                      </p>
                    )}
                  </>
                ) : (
                  <div className="relative p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-lg space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Book This Slot
                      </h5>
                      <button
                        onClick={handleCancelBooking}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                          Course
                        </label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={bookingData.courseId}
                          onChange={(e) => handleBookingFormChange("courseId", e.target.value)}
                        >
                          <option value="">Select a course...</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.courseCode} - {c.courseName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                          Class
                        </label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={bookingData.classId}
                          onChange={(e) => handleBookingFormChange("classId", e.target.value)}
                        >
                          <option value="">Select a class...</option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.classCode} - {c.className}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                          Teacher
                        </label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={bookingData.teacherId}
                          onChange={(e) => handleBookingFormChange("teacherId", e.target.value)}
                        >
                          <option value="">Select a teacher...</option>
                          {teachers.map((t) => (
                            <option key={t.accountId} value={t.accountId}>
                              {t.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {bookingError && (
                      <p className="text-sm text-red-600">{bookingError}</p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={handleSubmitBooking}
                        disabled={
                          bookingSubmitting ||
                          !bookingData.classId ||
                          !bookingData.teacherId
                        }
                      >
                        {bookingSubmitting ? "Booking..." : "Confirm Booking"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelBooking}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cancel booking confirmation popup */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Cancellation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel this booking for
                {" "}
                <span className="font-semibold text-gray-900">{effectiveClass?.className}</span>
                ?
              </p>
              {cancelError && (
                <p className="text-sm text-red-600 mb-3">{cancelError}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!cancelSubmitting) setShowCancelConfirm(false);
                  }}
                >
                  No
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={async () => {
                    await handleCancelExistingBooking();
                    setShowCancelConfirm(false);
                  }}
                  disabled={cancelSubmitting}
                >
                  {cancelSubmitting ? "Cancelling..." : "Yes, Cancel"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

