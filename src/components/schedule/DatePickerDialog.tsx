// src/components/schedule/DatePickerDialog.tsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  today: Date;
  triggerRef?: React.RefObject<HTMLElement | null>;
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysOfWeek = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function DatePickerDialog({
  open,
  onOpenChange,
  selectedDate,
  onDateSelect,
  today,
  triggerRef,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || today);
  const [showDropdown, setShowDropdown] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentMonthIndex = currentMonth.getMonth();
  const currentYear = currentMonth.getFullYear();

  // Get calendar grid with days
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    
    // Get the first day of week (0 = Sunday, 1 = Monday, etc.)
    // We'll use Monday as start of week (weekStartsOn = 1)
    let firstDayOfWeek = firstDay.getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc. for Monday-first week
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const calendarDays = getCalendarDays(currentMonth);

  // Sync currentMonth when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  // Update position when open (fixed positioning relative to viewport)
  useEffect(() => {
    if (open && triggerRef?.current) {
      const updatePosition = () => {
        if (!triggerRef?.current) return;
        
        const triggerRect = triggerRef.current.getBoundingClientRect();
        
        // Estimate popover width (max-w-sm = 384px)
        const popoverWidth = 384;
        
        // Position below the trigger button, centered
        // Use getBoundingClientRect() which is relative to viewport for fixed positioning
        let top = triggerRect.bottom + 8;
        let left = triggerRect.left + (triggerRect.width / 2) - (popoverWidth / 2);

        // Keep within viewport
        const padding = 8;
        if (left < padding) left = padding;
        if (left + popoverWidth > window.innerWidth - padding) {
          left = window.innerWidth - popoverWidth - padding;
        }

        // Check if popover would go below viewport
        const estimatedHeight = 400; // Approximate popover height
        if (top + estimatedHeight > window.innerHeight) {
          // Position above the button instead
          top = triggerRect.top - estimatedHeight - 8;
          if (top < padding) {
            top = padding;
          }
        }

        setPosition({ top, left });
        setIsPositioned(true);
      };

      // Reset positioning state
      setIsPositioned(false);
      
      // Initial position calculation
      updatePosition();
      
      // After popover renders, recalculate with actual dimensions
      const timeoutId = setTimeout(() => {
        if (triggerRef?.current && popoverRef.current) {
          const triggerRect = triggerRef.current.getBoundingClientRect();
          const popoverRect = popoverRef.current.getBoundingClientRect();

          let top = triggerRect.bottom + 8;
          let left = triggerRect.left + (triggerRect.width / 2) - (popoverRect.width / 2);

          const padding = 8;
          if (left < padding) left = padding;
          if (left + popoverRect.width > window.innerWidth - padding) {
            left = window.innerWidth - popoverRect.width - padding;
          }

          // Check if popover would go below viewport
          if (top + popoverRect.height > window.innerHeight) {
            top = triggerRect.top - popoverRect.height - 8;
            if (top < padding) {
              top = padding;
            }
          }

          setPosition({ top, left });
          setIsPositioned(true);
        }
      }, 10);

      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  }, [open, triggerRef]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        onOpenChange(false);
      }
    };

    if (open || showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, showDropdown, onOpenChange, triggerRef]);

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(monthIndex);
    setCurrentMonth(newDate);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const todayDate = new Date();
    return (
      date.getDate() === todayDate.getDate() &&
      date.getMonth() === todayDate.getMonth() &&
      date.getFullYear() === todayDate.getFullYear()
    );
  };

  const handleDayClick = (date: Date) => {
    onDateSelect(date);
    onOpenChange(false);
  };

  if (!open || !isPositioned) return null;

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed z-[1500] max-w-sm border border-gray-200 shadow-xl rounded-lg bg-white p-0"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateZ(0)', // Force GPU acceleration
        willChange: 'transform', // Optimize for position changes
        pointerEvents: 'auto', // Ensure popover can receive events
      }}
    >
      <div className="p-4">
          {/* Header */}
          <div className="mb-4">
            {/* Month/Year Display with Navigation and Dropdown */}
            <div className="flex items-center justify-center gap-4 mb-3 relative">
              <button
                onClick={handlePreviousMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Clickable Month/Year with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors px-2 py-1 rounded"
                  aria-label="Select month and year"
                >
                  {months[currentMonthIndex]} {currentYear}
                </button>
                
                {/* Combined Month and Year Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[280px] max-h-[400px] overflow-hidden flex">
                    {/* Month List */}
                    <div className="flex-1 border-r border-gray-200 max-h-[400px] overflow-y-auto">
                      <div className="p-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 sticky top-0">
                        Month
                      </div>
                      {months.map((month, index) => (
                        <button
                          key={month}
                          onClick={() => {
                            handleMonthChange(index);
                            setShowDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors ${
                            index === currentMonthIndex ? "bg-blue-100 font-semibold" : ""
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                    
                    {/* Year List */}
                    <div className="flex-1 max-h-[400px] overflow-y-auto">
                      <div className="p-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 sticky top-0">
                        Year
                      </div>
                      {Array.from({ length: 20 }, (_, i) => currentYear - 10 + i).map((year) => (
                        <button
                          key={year}
                          onClick={() => {
                            handleYearChange(year);
                            setShowDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors ${
                            year === currentYear ? "bg-blue-100 font-semibold" : ""
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="mb-4">
            <div className="grid grid-cols-7 gap-0">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div key={`empty-${index}`} className="aspect-square"></div>
                  );
                }
                
                const dayNumber = date.getDate();
                const selected = isSelected(date);
                const isTodayDate = isToday(date);
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => handleDayClick(date)}
                    className={`aspect-square flex items-center justify-center text-sm rounded-md transition-colors ${
                      selected
                        ? "bg-blue-600 text-white font-bold"
                        : isTodayDate
                        ? "bg-blue-50 text-blue-900 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {dayNumber}
                  </button>
                );
              })}
            </div>
          </div>

      </div>
    </div>,
    document.body
  );
}
