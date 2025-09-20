// src/components/schedule/StaffScheduleGrid.tsx
import React from "react";
import { addDays, fmtTime, toDateAny } from "@/components/schedule";
import type { StaffSession } from "@/components/schedule";
import StaffSessionCard from "./StaffSessionCard";

type ScheduleDisplayMode = 'full' | 'classOnly' | 'roomOnly';

type TimeSlot = {
  start: string;
  end: string;
};

type Props = {
  weekStart: Date;
  sessions: StaffSession[];
  startHour: number;
  slots: number;
  slotMinutes: number;
  timeSlots?: TimeSlot[];
  todayIdx: number;
  selectedIdx: number;
  onSessionClick: (session: StaffSession, startLabel: string, endLabel: string) => void;
  onEdit: (session: StaffSession) => void;
  onDelete: (session: StaffSession) => void;
  displayMode?: ScheduleDisplayMode;
};

export default function StaffScheduleGrid({
  weekStart,
  sessions,
  startHour,
  slots,
  slotMinutes,
  timeSlots,
  todayIdx,
  selectedIdx,
  onSessionClick,
  onEdit,
  onDelete,
  displayMode = 'full',
}: Props) {
  // Tạo các mốc thời gian theo slot hoặc custom time slots
  const slotTimes = timeSlots 
    ? timeSlots.map(slot => {
        const [hours, minutes] = slot.start.split(':').map(Number);
        return [hours, minutes] as const;
      })
    : Array.from({ length: slots }, (_, i) => {
        const total = startHour * 60 + i * slotMinutes;
        return [Math.floor(total / 60), total % 60] as const;
      });

  // Map session -> ô (dayIdx-slotIdx)
  function getPosition(dt: Date) {
    const dayIdx = (dt.getDay() + 6) % 7; // Mon=0
    const minutes = dt.getHours() * 60 + dt.getMinutes();
    
    if (timeSlots) {
      // Find which custom time slot this session belongs to
      const slotIdx = timeSlots.findIndex(slot => {
        const [startHours, startMinutes] = slot.start.split(':').map(Number);
        const [endHours, endMinutes] = slot.end.split(':').map(Number);
        const slotStart = startHours * 60 + startMinutes;
        const slotEnd = endHours * 60 + endMinutes;
        return minutes >= slotStart && minutes < slotEnd;
      });
      return { dayIdx, slotIdx };
    } else {
      // Original logic for regular slots
      const startMin = startHour * 60;
      const diff = minutes - startMin;
      const slotIdx = Math.floor(diff / slotMinutes);
      return { dayIdx, slotIdx };
    }
  }

  const cellMap = new Map<string, StaffSession[]>();
  for (const s of sessions) {
    const dt = toDateAny(s.start);
    if (Number.isNaN(+dt)) continue;
    const { dayIdx, slotIdx } = getPosition(dt);
    const maxSlots = timeSlots ? timeSlots.length : slots;
    if (slotIdx < 0 || slotIdx >= maxSlots) continue;
    const key = `${dayIdx}-${slotIdx}`;
    const list = cellMap.get(key) || [];
    list.push(s);
    cellMap.set(key, list);
  }

  return (
    <div className="border-t border-accent-200">
      {/* ===== Grid Header Row ===== */}
      <div className="grid grid-cols-[100px_repeat(7,minmax(0,1fr))] text-sm">
        <div className="p-2 border-b border-accent-400 font-bold text-primary-800 bg-accent-200 text-center">Time</div>
        {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d, i) => (
          <div
            key={d.toISOString()}
            className={
              "p-2 border-b border-accent-200 text-center border-l " +
              (i === todayIdx ? "bg-accent-50" : "bg-white")
            }
          >
            <div className="font-bold text-center text-primary-800 text-sm">
              {d.toLocaleDateString(undefined, { weekday: "short" })}
            </div>
            <div className="text-xs text-accent-600 font-medium">
              {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </div>
            {i === todayIdx && (
              <div className="mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-500 text-white font-semibold">
                  Today
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ===== Grid Body ===== */}
      <div className="grid grid-cols-[100px_repeat(7,minmax(0,1fr))]">
        {slotTimes.map(([h, m], row) => (
          <React.Fragment key={row}>
            <div className="border-t border-accent-400 p-1.5 text-xs font-semibold text-primary-700 bg-accent-200 text-center">
              {timeSlots && timeSlots[row] ? (
                <div>
                  <div>{timeSlots[row].start}</div>
                    |
                  <div >{timeSlots[row].end}</div>
                </div>
              ) : (
                fmtTime(h, m)
              )}
            </div>

            {Array.from({ length: 7 }, (_, dayIdx) => {
              const key = `${dayIdx}-${row}`;
              const items = cellMap.get(key) || [];

              // Background for today's column
              const colBase = dayIdx === todayIdx ? "bg-accent-25" : "bg-white";

              // Highlight slot if has session
              let slotHighlight = "";
              if (items.length > 0) {
                if (dayIdx === selectedIdx) slotHighlight = "bg-accent-100"; // selected day
                else if (dayIdx === todayIdx) slotHighlight = "bg-accent-50"; // today
              }

              return (
                <div
                  key={key}
                  className={`border-t border-l border-accent-200 p-1.5 h-[70px] ${colBase} ${slotHighlight} hover:bg-accent-25 transition-colors`}
                >
                  <div
                    className={
                      items.length <= 1
                        ? "h-full w-full flex items-center justify-center"
                        : "h-full space-y-1 flex flex-col"
                    }
                  >
                    {items.map((s) => {
                      const startLabel = fmtTime(h, m);
                      let endLabel: string;
                      
                      if (timeSlots && timeSlots[row]) {
                        // Use custom time slot end time
                        endLabel = timeSlots[row].end;
                      } else {
                        // Original logic
                        const eMin = m + (s.durationMin ?? slotMinutes);
                        endLabel = fmtTime(
                          h + Math.floor(eMin / 60),
                          eMin % 60
                        );
                      }
                      return (
                        <div key={s.id} className="flex-1 min-h-0">
                          <StaffSessionCard
                            session={s}
                            startLabel={startLabel}
                            endLabel={endLabel}
                            onSessionClick={onSessionClick}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            displayMode={displayMode}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
