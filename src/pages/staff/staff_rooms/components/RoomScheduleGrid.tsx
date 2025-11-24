import { useState, useMemo } from "react";
import type { Room, RoomType } from "@/types/room.type";
import { DoorOpen } from "lucide-react";
import RoomSchedulePopup from "./RoomSchedulePopup";

interface ClassInfo {
  id: string;
  className: string;
  courseName: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  dayOfWeek: string;
  timeSlot: string;
}

interface RoomScheduleGridProps {
  rooms: Room[];
  roomTypes: RoomType[];
  classesByRoom: Record<string, ClassInfo[]>; // Map roomId to classes
  currentWeek: Date;
  onRoomClick?: (room: Room) => void;
  onBookingSuccess?: () => void;
}

// Days of week
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Time slots: Slot 1 (9:00), Slot 2 (13:30), Slot 3 (15:00), Slot 4 (16:30), Slot 5 (18:00)
const TIME_SLOTS = [
  { slot: 1, time: "9:00", display: "09:00" },
  { slot: 2, time: "13:30", display: "13:30" },
  { slot: 3, time: "15:00", display: "15:00" },
  { slot: 4, time: "16:30", display: "16:30" },
  { slot: 5, time: "18:00", display: "18:00" },
];

export default function RoomScheduleGrid({
  rooms,
  roomTypes,
  classesByRoom,
  currentWeek,
  onRoomClick,
  onBookingSuccess,
}: RoomScheduleGridProps) {
  const [selectedSlot, setSelectedSlot] = useState<{
    room: Room;
    dayIndex: number;
    timeSlot: { slot: number; time: string; display: string };
    date: Date;
  } | null>(null);

  // Calculate dates for the current week (Monday to Saturday)
  const weekDates = useMemo(() => {
    const monday = new Date(currentWeek);
    const day = monday.getDay();
    const diff = day === 0 ? 6 : day - 1; // Adjust to make Monday = 0
    monday.setDate(monday.getDate() - diff);
    
    return DAYS_OF_WEEK.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  }, [currentWeek]);

  // Get room type name
  const getRoomTypeName = (roomTypeId: string, room?: Room): string => {
    if (room && room.roomTypeName) return room.roomTypeName;
    const roomType = roomTypes.find((rt) => rt.id === roomTypeId);
    return roomType?.name || "Unknown";
  };

  // Map room status to label and color
  const getRoomStatus = (room: Room): { label: string; dotClass: string; textClass: string } => {
    // Prefer backend roomStatusName (e.g. "In Use Room") if present
    const rawStatus =
      room.roomStatusName || room.roomStatus || (room.isActive ? "Available" : "Maintenance");
    const status = rawStatus.trim();
    const normalized = status.toLowerCase();

    switch (status) {
      case "Available":
        return {
          label: "Available",
          dotClass: "bg-green-500",
          textClass: "text-green-700",
        };
      case "Reserved":
        return {
          label: "Reserved",
          dotClass: "bg-green-500",
          textClass: "text-green-700",
        };
      case "InUse":
      case "In Use":
        return {
          label: "In Use",
          dotClass: "bg-orange-500",
          textClass: "text-orange-700",
        };
      case "Maintenance":
        return {
          label: "Maintenance",
          dotClass: "bg-red-500",
          textClass: "text-red-700",
        };
      case "Unavailable":
        return {
          label: "Unavailable",
          dotClass: "bg-red-500",
          textClass: "text-red-700",
        };
      default:
        if (normalized.includes("available") || normalized.includes("reserved")) {
          return {
            label: status,
            dotClass: "bg-green-500",
            textClass: "text-green-700",
          };
        }
        if (normalized.includes("in use")) {
          return {
            label: status,
            dotClass: "bg-orange-500",
            textClass: "text-orange-700",
          };
        }
        if (normalized.includes("maintenance") || normalized.includes("unavailable")) {
          return {
            label: status,
            dotClass: "bg-red-500",
            textClass: "text-red-700",
          };
        }
        return {
          label: status,
          dotClass: "bg-gray-400",
          textClass: "text-gray-600",
        };
    }
  };

  // Room is bookable if not Maintenance/Unavailable
  const isRoomBookable = (room: Room): boolean => {
    const rawStatus =
      room.roomStatusName || room.roomStatus || (room.isActive ? "Available" : "Maintenance");
    const status = rawStatus.trim().toLowerCase();
    if (status.includes("maintenance") || status.includes("unavailable")) {
      return false;
    }
    return true;
  };

  // Check if a time slot has a class
  const hasClassAtSlot = (
    room: Room,
    dayIndex: number,
    timeSlot: { slot: number; time: string; display: string }
  ): ClassInfo | null => {
    const classes = classesByRoom[room.id] || [];
    const dayName = DAYS_OF_WEEK[dayIndex];
    
    // Find class that matches day and time slot
    const matchingClass = classes.find((cls) => {
      // Check if day matches
      const classDay = cls.dayOfWeek;
      const matchesDay = classDay === dayName || 
                        classDay === `Monday` && dayIndex === 0 ||
                        classDay === `Tuesday` && dayIndex === 1 ||
                        classDay === `Wednesday` && dayIndex === 2 ||
                        classDay === `Thursday` && dayIndex === 3 ||
                        classDay === `Friday` && dayIndex === 4 ||
                        classDay === `Saturday` && dayIndex === 5;
      
      if (!matchesDay) return false;
      
      // Check if time slot matches
      // timeSlot format: "9:00", "13:30", "Slot 1", etc.
      const classTimeSlot = cls.timeSlot.toLowerCase().trim();
      const slotTime = timeSlot.time.toLowerCase().trim();
      const slotNum = `slot ${timeSlot.slot}`.toLowerCase();
      
      // Match by exact time, or by slot number
      const matchesTime = classTimeSlot === slotTime || 
                         classTimeSlot === slotNum ||
                         classTimeSlot === timeSlot.slot.toString() ||
                         classTimeSlot.includes(slotTime) ||
                         classTimeSlot.includes(timeSlot.slot.toString());
      
      return matchesTime;
    });

    return matchingClass || null;
  };


  const handleSlotClick = (room: Room, dayIndex: number, timeSlot: { slot: number; time: string; display: string }) => {
    console.log('Slot clicked:', { room: room.roomCode, dayIndex, timeSlot });
    const date = weekDates[dayIndex];
    const slotData = { room, dayIndex, timeSlot, date };
    setSelectedSlot(slotData);
    console.log('Selected slot set:', slotData);
  };

  const handleClosePopup = () => {
    setSelectedSlot(null);
  };

  // Get classes for selected slot - return null if no class
  const getSelectedSlotClass = (): ClassInfo | null => {
    if (!selectedSlot) {
      return null;
    }
    
    // Try to find actual class
    const actualClass = hasClassAtSlot(
      selectedSlot.room,
      selectedSlot.dayIndex,
      selectedSlot.timeSlot
    );
    
    // If found, return it
    if (actualClass) {
      console.log('Found actual class:', actualClass);
      return actualClass;
    }
    
    // No class found, return null
    console.log('No class found for this slot');
    return null;
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto relative">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full border-collapse">
              {/* Header */}
              <thead className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-b-2 border-gray-300 sticky top-0 z-20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 border-r-2 border-gray-300 sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-30 min-w-[120px] shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <DoorOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>Room</span>
                    </div>
                  </th>
                  {DAYS_OF_WEEK.map((day, index) => {
                    const date = weekDates[index];
                    const isToday = date && new Date().toDateString() === date.toDateString();
                    return (
                      <th
                        key={index}
                        className={`px-2 py-3 text-center border-r border-gray-300 last:border-r-0 ${
                          isToday 
                            ? "bg-blue-50 border-blue-200" 
                            : ""
                        }`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                            {day}
                          </span>
                          {date && (
                            <span className={`text-[10px] font-bold ${
                              isToday 
                                ? "text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full" 
                                : "text-gray-500"
                            }`}>
                              {date.getDate()}/{date.getMonth() + 1}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
              {rooms.map((room, roomIndex) => (
                <tr
                  key={room.id}
                  className={`border-b border-gray-200 transition-all duration-200 ${
                    roomIndex % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  } hover:bg-blue-50/30 group`}
                >
                  {/* Room name cell */}
                  <td 
                    className="px-4 py-3 border-r-2 border-gray-300 sticky left-0 z-10 bg-white group-hover:bg-blue-50/50 transition-colors shadow-sm cursor-pointer"
                    onClick={() => onRoomClick && onRoomClick(room)}
                    title="Click to view/edit room information"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${
                          room.isActive
                            ? "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600"
                            : "bg-gradient-to-br from-gray-300 to-gray-400"
                        }`}
                      >
                        <DoorOpen
                          className={`w-5 h-5 ${
                            room.isActive ? "text-white" : "text-white"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm">
                          {room.roomCode}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          <div className="truncate">{getRoomTypeName(room.roomTypeId, room)}</div>
                          {(() => {
                            const status = getRoomStatus(room);
                            return (
                              <div className="inline-flex items-center flex-shrink-0 mt-0.5">
                                <span className={`w-1 h-1 rounded-full mr-0.5 ${status.dotClass}`}></span>
                                <span className={`text-[10px] font-medium ${status.textClass}`}>
                                  {status.label}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Time slot cells for each day */}
                  {DAYS_OF_WEEK.map((_, dayIndex) => {
                    const date = weekDates[dayIndex];
                    const isToday = date && new Date().toDateString() === date.toDateString();
                    return (
                      <td
                        key={dayIndex}
                        className={`px-1.5 py-2 border-r border-gray-200 last:border-r-0 transition-colors ${
                          isToday ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <div className="flex gap-2 justify-center px-3">
                          {TIME_SLOTS.map((timeSlot) => {
                            const classInfo = hasClassAtSlot(room, dayIndex, timeSlot);
                            const isOccupied = !!classInfo;
                            const roomBookable = isRoomBookable(room);
                            const isDisabled = !room.isActive || !roomBookable;

                            const tooltipText = !roomBookable
                              ? `Room is not available (Maintenance / Unavailable)`
                              : isDisabled
                              ? `Room is inactive`
                              : isOccupied && classInfo
                              ? `${timeSlot.display} - ${classInfo.className}\n${classInfo.courseName}\nTeacher: ${classInfo.teacherName}`
                              : `Available at ${timeSlot.display}\nClick to book`;

                            return (
                              <button
                                key={timeSlot.slot}
                                onClick={() => !isDisabled && handleSlotClick(room, dayIndex, timeSlot)}
                                disabled={isDisabled}
                                title={tooltipText}
                                className={`w-8 h-8 rounded transition-all duration-200 flex flex-col items-center justify-center flex-shrink-0 relative group ${
                                  isDisabled
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed opacity-60"
                                    : isOccupied
                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-110 active:scale-95 hover:shadow-lg"
                                    : "bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-200 transform hover:scale-110 active:scale-95 hover:shadow-sm"
                                }`}
                              >
                                {/* Slot number */}
                                <span className={`text-xs font-bold leading-none ${
                                  isDisabled 
                                    ? "text-gray-500" 
                                    : isOccupied 
                                    ? "text-white" 
                                    : "text-orange-800"
                                }`}>
                                  {timeSlot.slot}
                                </span>
                                
                                {/* Time display - small text below */}
                                <span className={`text-[7px] leading-none mt-0.5 ${
                                  isDisabled
                                    ? "text-gray-400"
                                    : isOccupied
                                    ? "text-blue-100"
                                    : "text-orange-600"
                                }`}>
                                  {timeSlot.display}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Overlay to hide slots when scrolling horizontally */}
        <div className="absolute top-0 right-0 bottom-0 w-20 bg-white pointer-events-none z-10 opacity-100"></div>
      </div>
    </div>

      {/* Popup - Always show when slot is selected */}
      {selectedSlot && (
        <RoomSchedulePopup
          open={!!selectedSlot}
          onClose={handleClosePopup}
          room={selectedSlot.room}
          roomTypes={roomTypes}
          dayIndex={selectedSlot.dayIndex}
          dayName={DAYS_OF_WEEK[selectedSlot.dayIndex]}
          timeSlot={selectedSlot.timeSlot.slot}
          timeSlotDisplay={selectedSlot.timeSlot.display}
          date={selectedSlot.date}
          classInfo={getSelectedSlotClass()}
          onBookingSuccess={onBookingSuccess}
        />
      )}
    </>
  );
}

