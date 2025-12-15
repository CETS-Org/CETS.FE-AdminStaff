// src/pages/staff/staff_schedule/StaffSchedulePage.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { Calendar, RefreshCw, Filter, BookOpen, School, Info, ChevronRight, Plus } from "lucide-react";

// Hook lấy options
import { useLookupOptions } from "@/pages/staff/staff_classes/shared/useLookupOptions";

// Components
import StaffWeekSchedule from "@/pages/staff/staff_schedule/components/StaffWeekSchedule";
import SessionDetailDialog from "@/pages/staff/staff_schedule/components/SessionDetailDialog";

// APIs & Types
import { 
  getCourseOptions, 
  getClassOptions, 
  getClassMeetingsByClassId 
} from "@/pages/staff/staff_schedule/data/schedule.api";
import type { 
  CourseOption, 
  ClassStaffViewDTO, 
  ClassMeetingResponseDTO 
} from "@/pages/staff/staff_schedule/data/schedule.types";

export default function StaffSchedulePage() {
  // --- STATE ---
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [classes, setClasses] = useState<ClassStaffViewDTO[]>([]);
  
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  const [rawMeetings, setRawMeetings] = useState<ClassMeetingResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedMeeting, setSelectedMeeting] = useState<ClassMeetingResponseDTO | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { timeslotOptions } = useLookupOptions(false);

  // --- EFFECTS ---

  useEffect(() => {
    getCourseOptions().then(res => setCourses(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setSelectedClassId("all");
    if (selectedCourseId !== "all") {
        getClassOptions(selectedCourseId)
          .then(res => setClasses(res.data))
          .catch(console.error);
    } else {
        setClasses([]);
    }
  }, [selectedCourseId]);

  const fetchSchedule = useCallback(() => {
    if (selectedClassId === "all") {
        setRawMeetings([]); 
        return;
    }
    setIsLoading(true);
    getClassMeetingsByClassId(selectedClassId)
        .then(res => setRawMeetings(res.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
  }, [selectedClassId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // --- HELPER ---
  const calculateEndTime = (startTimeStr: string) => {
      if (!startTimeStr) return "00:00";
      const [h, m] = startTimeStr.split(':').map(Number);
      const totalMins = h * 60 + m + 90;
      const endH = Math.floor(totalMins / 60);
      const endM = totalMins % 60;
      return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  // --- LOGIC MAPPING ---
  const definedSlots = useMemo(() => {
    if (!timeslotOptions.length) return undefined;
    return timeslotOptions.map((t, index) => {
        const match = t.label.match(/(\d{1,2}):(\d{2})/);
        if (match) {
            const startStr = match[0]; 
            const endStr = calculateEndTime(startStr); 
            return { start: startStr, end: endStr, name: `Slot ${index + 1}` };
        }
        return null;
    }).filter(Boolean) as { start: string; end: string; name: string }[];
  }, [timeslotOptions]);

  const calendarEvents = useMemo(() => {
    if (!timeslotOptions.length) return [];
    return rawMeetings.map(meeting => {
        const meetingStartTime = meeting.slot ? meeting.slot.substring(0, 5) : "00:00";
        const matchedSlot = definedSlots?.find(ds => ds.start === meetingStartTime);
        const endTimeStr = matchedSlot ? matchedSlot.end : calculateEndTime(meetingStartTime);
        const startDateTime = `${meeting.date.replace(/-/g, ':')}:${meetingStartTime}`;
        const matchedOption = timeslotOptions.find(t => t.label.startsWith(meetingStartTime));
        const mappedSlotID = matchedOption ? matchedOption.value : "";
        const displayTitle = meeting.coveredTopic;

        return {
            id: meeting.id,
            title: displayTitle,
            classCode: "", 
            start: startDateTime, 
            endTime: endTimeStr,
            room: meeting.roomCode || "TBA", 
            type: meeting.isStudy ? "lesson" : "break",
            attendanceStatus: !meeting.isActive ? "cancelled" : (meeting.isStudy ? "upcoming" : "attended"),
            durationMin: 90,
            resource: { ...meeting, slotID: mappedSlotID } 
        };
    });
  }, [rawMeetings, timeslotOptions, definedSlots]);

  // Mở dialog Edit
  const handleSessionClick = (session: any) => {
      if (session.resource) {
          setSelectedMeeting(session.resource);
          setDetailsOpen(true);
      }
  };

  // Mở dialog Create
  const handleAddSession = () => {
      if (selectedClassId === "all") {
          // Có thể thêm toast notification ở đây nếu muốn
          return;
      }
      setSelectedMeeting(null); // Null -> Create Mode
      setDetailsOpen(true);
  };

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      <PageHeader
        title="Class Schedule"
        description="Manage sessions, view timetables, and organize class activities efficiently."
        icon={<BookOpen className="w-5 h-5 text-white" />}
        controls={[
            {
                type: 'button',
                label: 'Refresh',
                variant: 'secondary',
                icon: <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />,
                onClick: fetchSchedule,
                className: isLoading ? "opacity-50 pointer-events-none" : ""
            },
            // --- NÚT ADD SESSION ---
            {
                type: 'button',
                label: 'Add Session',
                icon: <Plus className="w-4 h-4" />,
                onClick: selectedClassId === "all" ? undefined : handleAddSession, // Chặn click bằng logic
                
                // Xóa dòng "disabled: ..." gây lỗi đi
                
                // Thêm logic style vào className
                className: `bg-blue-600 hover:bg-blue-700 text-white border-blue-600 ${
                    selectedClassId === "all" ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                }`
            }
        ]}
      />

      {/* --- FILTERS BAR (New Design) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 flex flex-col lg:flex-row gap-6 items-start lg:items-end">
        
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Course Selector */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" /> Step 1: Course
                </label>
                <Select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    options={[
                        { label: "Select a Course...", value: "all" },
                        ...courses.map(c => ({ label: `${c.courseCode} - ${c.courseName}`, value: c.id }))
                    ]}
                    className="w-full"
                />
            </div>

            {/* 2. Class Selector */}
            <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <School className="w-3.5 h-3.5" /> Step 2: Class
                </label>
                <Select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    disabled={selectedCourseId === "all" || classes.length === 0}
                    options={[
                        { label: classes.length === 0 ? (selectedCourseId === "all" ? "Waiting for Course..." : "No classes found") : "Select a Class...", value: "all" },
                        ...classes.map(c => ({ 
                            label: `${c.className} (${c.enrolledCount}/${c.capacity})`, 
                            value: c.id 
                        }))
                    ]}
                    className="w-full"
                />
                {/* Pulse Effect if Course Selected but Class Not Yet */}
                {selectedCourseId !== "all" && classes.length > 0 && selectedClassId === "all" && (
                    <div className="absolute -right-2 top-8 animate-pulse text-blue-500">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                    </div>
                )}
            </div>
        </div>

        {/* Status Indicator (Right Side) */}
        <div className="hidden lg:flex items-center gap-2 h-10 text-sm text-gray-400 border-l pl-6">
            {selectedClassId !== "all" ? (
                <span className="text-green-600 font-medium flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    Showing schedule <ChevronRight className="w-4 h-4"/>
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    <Info className="w-4 h-4"/> Select filters to view
                </span>
            )}
        </div>
      </div>

      {/* --- CALENDAR SECTION --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] relative">
         {selectedClassId === "all" ? (
             /* Empty State */
             <div className="flex flex-col items-center justify-center h-[500px] text-gray-400 space-y-6 bg-gray-50/30">
                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-gray-100 shadow-sm">
                    <Calendar className="w-10 h-10 text-gray-300"/>
                 </div>
                 <div className="text-center max-w-md px-4">
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No Class Selected</h3>
                    <p className="text-gray-500">
                        Please select a <strong>Course</strong> and a <strong>Class</strong> from the filters above to load the weekly schedule and manage sessions.
                    </p>
                 </div>
             </div>
         ) : (
             <>
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center">
                        <div className="bg-white p-4 rounded-full shadow-lg mb-3">
                            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin"/>
                        </div>
                        <span className="text-sm font-semibold text-blue-700">Loading schedule data...</span>
                    </div>
                )}
                
                {/* Calendar Content */}
                <div className="p-1">
                    <StaffWeekSchedule 
                        sessions={calendarEvents as any} 
                        startHour={7}
                        slots={14}
                        timeSlots={definedSlots} 
                        onSessionClick={handleSessionClick}
                        displayMode="full"
                    />
                </div>
             </>
         )}
      </div>

      {/* --- DIALOG (Truyền context để Create) --- */}
      <SessionDetailDialog 
         open={detailsOpen}
         onOpenChange={setDetailsOpen}
         sessionData={selectedMeeting}
         // Truyền thông tin lớp/khóa đang chọn
         contextClassId={selectedClassId}
         contextCourseId={selectedCourseId}
         onSuccess={fetchSchedule}
      />
    </div>
  );
}