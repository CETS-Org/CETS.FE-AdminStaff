// src/components/schedule/StaffScheduleGrid.tsx
import React from "react";
import { addDays, fmtTime, toDateAny } from "@/components/schedule";
import type { StaffSession } from "@/components/schedule";
import StaffSessionCard from "./StaffSessionCard";
import type { TimeSlot } from "./StaffWeekSchedule"; // Import Type từ file trên

type ScheduleDisplayMode = 'full' | 'classOnly' | 'roomOnly';

type Props = {
  weekStart: Date;
  sessions: StaffSession[];
  startHour: number;
  slots: number;
  slotMinutes: number;
  timeSlots?: TimeSlot[]; // Nhận danh sách slot
  todayIdx: number;
  selectedIdx: number;
  onSessionClick: (session: StaffSession, startLabel: string, endLabel: string) => void;
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
  displayMode = 'full',
}: Props) {
  
  const slotTimes = timeSlots 
    ? timeSlots.map(slot => {
        const [hours, minutes] = slot.start.split(':').map(Number);
        return [hours, minutes] as const;
      })
    : Array.from({ length: slots }, (_, i) => {
        const total = startHour * 60 + i * slotMinutes;
        return [Math.floor(total / 60), total % 60] as const;
      });

  function getPosition(dt: Date) {
    const dayIdx = (dt.getDay() + 6) % 7; // Mon=0
    const minutes = dt.getHours() * 60 + dt.getMinutes();
    
    if (timeSlots) {
      // Logic tìm slot: Session nằm trong khoảng start-end của slot nào
      const slotIdx = timeSlots.findIndex(slot => {
        const [startHours, startMinutes] = slot.start.split(':').map(Number);
        const [endHours, endMinutes] = slot.end.split(':').map(Number);
        
        const slotStart = startHours * 60 + startMinutes;
        const slotEnd = endHours * 60 + endMinutes;
        
        // Chấp nhận sai số nhỏ hoặc trùng khớp
        return minutes >= slotStart && minutes < slotEnd;
      });
      return { dayIdx, slotIdx };
    } else {
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
    
    // Nếu tìm thấy slot hợp lệ
    if (slotIdx >= 0 && slotIdx < maxSlots) {
        const key = `${dayIdx}-${slotIdx}`;
        const list = cellMap.get(key) || [];
        list.push(s);
        cellMap.set(key, list);
    }
  }

  return (
    <div className="border-t border-accent-200">
      {/* ===== Grid Header Row ===== */}
      <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))] text-sm">
        <div className="p-2 border-b border-accent-400 font-bold text-primary-800 bg-accent-200 text-center flex items-center justify-center">
            Time / Slot
        </div>
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
      <div className="grid grid-cols-[120px_repeat(7,minmax(0,1fr))]">
        {slotTimes.map(([h, m], row) => (
          <React.Fragment key={row}>
            
            {/* --- CỘT HIỂN THỊ GIỜ / SLOT --- */}
            <div className="border-t border-r border-accent-400 p-2 text-xs bg-gray-50 flex flex-col justify-center items-center text-center h-24">
              {timeSlots && timeSlots[row] ? (
                <>
                  {/* Tên Slot (VD: Slot 1) */}
                  {timeSlots[row].name && (
                      <span className="font-bold text-blue-700 mb-1 text-sm block">
                          {timeSlots[row].name}
                      </span>
                  )}
                  {/* Giờ (VD: 07:00 - 09:00) */}
                  <div className="text-gray-500 font-medium bg-white px-2 py-1 rounded border border-gray-200 shadow-sm inline-block whitespace-nowrap">
                    {timeSlots[row].start} - {timeSlots[row].end}
                  </div>
                </>
              ) : (
                fmtTime(h, m)
              )}
            </div>

            {/* --- CÁC CỘT NGÀY TRONG TUẦN --- */}
            {Array.from({ length: 7 }, (_, dayIdx) => {
              const key = `${dayIdx}-${row}`;
              const items = cellMap.get(key) || [];
              const colBase = dayIdx === todayIdx ? "bg-accent-25" : "bg-white";

              // Highlight slot logic
              let slotHighlight = "";
              if (items.length > 0) {
                if (dayIdx === selectedIdx) slotHighlight = "bg-accent-100"; 
                else if (dayIdx === todayIdx) slotHighlight = "bg-accent-50"; 
              }

              return (
                <div
                  key={key}
                  // h-24 (height: 6rem ~ 96px) để khớp với cột giờ bên trái
                  className={`border-t border-l border-accent-200 p-1 h-24 ${colBase} ${slotHighlight} hover:bg-accent-25 transition-colors`}
                >
                  <div
                    className={
                      items.length <= 1
                        ? "h-full w-full flex items-center justify-center"
                        : "h-full space-y-1 flex flex-col overflow-y-auto"
                    }
                  >
                    {items.map((s) => {
                      let startLabel = fmtTime(h, m);
                      let endLabel = "";
                      
                      if (timeSlots && timeSlots[row]) {
                        startLabel = timeSlots[row].start;
                        endLabel = timeSlots[row].end;
                      } else {
                        const eMin = m + (s.durationMin ?? slotMinutes);
                        endLabel = fmtTime(h + Math.floor(eMin / 60), eMin % 60);
                      }

                      return (
                        <div key={s.id} className="w-full min-h-0 flex-1">
                          <StaffSessionCard
                            session={s}
                            startLabel={startLabel}
                            endLabel={endLabel}
                            onSessionClick={onSessionClick}
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