// src/components/schedule/StaffWeekSchedule.tsx
import { useMemo, useState } from "react";
import {
  ScheduleHeader,
  SessionDetailsDialog,
  DatePickerDialog,
  startOfWeek,
  addDays,
  isSameDay,
  toDateAny,
} from "@/components/schedule";
import type { StaffSession, SessionDetailsData } from "@/components/schedule";
import StaffScheduleGrid from "./StaffScheduleGrid";

type ScheduleDisplayMode = 'full' | 'classOnly' | 'roomOnly';

// --- UPDATE: Thêm trường name và export để Grid dùng lại ---
export type TimeSlot = {
  start: string;
  end: string;
  name?: string; 
};

type Props = {
  sessions: StaffSession[];
  startHour?: number;
  slots?: number;
  slotMinutes?: number;
  timeSlots?: TimeSlot[]; // Nhận mảng slots tùy chỉnh
  onSessionClick?: (session: StaffSession) => void; 
  onEdit?: (session: StaffSession) => void;
  onDelete?: (session: StaffSession) => void;
  displayMode?: ScheduleDisplayMode;
};

export default function StaffWeekSchedule({
  sessions,
  startHour = 7,
  slots = 16,
  slotMinutes = 60,
  timeSlots,
  onSessionClick,
  onEdit,
  onDelete,
  displayMode = 'full',
}: Props) {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<SessionDetailsData | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const today = new Date();
  const todayIdx = (() => {
    const s = startOfWeek(weekStart);
    for (let i = 0; i < 7; i++) if (isSameDay(addDays(s, i), today)) return i;
    return -1;
  })();

  const selectedIdx = (() => {
    if (!selectedDate) return -1;
    const s = startOfWeek(weekStart);
    for (let i = 0; i < 7; i++) if (isSameDay(addDays(s, i), selectedDate)) return i;
    return -1;
  })();

  const weekSessions = useMemo(() => {
    const s = startOfWeek(weekStart);
    const e = addDays(s, 7);
    return sessions.filter((ev) => {
      const t = toDateAny(ev.start);
      return !Number.isNaN(+t) && t >= s && t < e;
    });
  }, [sessions, weekStart]);

  function openDetailsInternal(s: StaffSession, startLabel: string, endLabel: string) {
    const dt = toDateAny(s.start);
    const dateStr = dt.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setDetailsData({
      courseName: s.title,
      className: `Class ${s.classCode}`,
      instructor: s.instructor || "TBA",
      date: dateStr,
      time: `${startLabel} – ${endLabel}`,
      roomNumber: s.room ?? "—",
      format: "In-person",
      meetingLink: undefined,
    });
    setDetailsOpen(true);
  }

  function handleSessionClickWrapper(s: StaffSession, startLabel: string, endLabel: string) {
    if (onSessionClick) {
        onSessionClick(s);
    } else {
        openDetailsInternal(s, startLabel, endLabel);
    }
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setWeekStart(startOfWeek(date));
    setPickerOpen(false);
  }

  function handleEdit(session: StaffSession) {
    if (onEdit) onEdit(session);
  }

  function handleDelete(session: StaffSession) {
    if (onDelete) onDelete(session);
  }

  return (
    <div className="bg-white rounded-xl border-0 shadow-none">
      <ScheduleHeader
        weekStart={weekStart}
        weekEnd={weekEnd}
        onPreviousWeek={() => setWeekStart((d) => addDays(d, -7))}
        onNextWeek={() => setWeekStart((d) => addDays(d, 7))}
        onOpenDatePicker={() => setPickerOpen(true)}
      />

      <StaffScheduleGrid
        weekStart={weekStart}
        sessions={weekSessions}
        startHour={startHour}
        slots={slots}
        slotMinutes={slotMinutes}
        timeSlots={timeSlots}
        todayIdx={todayIdx}
        selectedIdx={selectedIdx}
        onSessionClick={handleSessionClickWrapper}
        onEdit={handleEdit}
        onDelete={handleDelete}
        displayMode={displayMode}
      />

      <SessionDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        sessionData={detailsData}
        isStudent={false}
      />

      <DatePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        today={today}
      />
    </div>
  );
}