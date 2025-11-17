import { useState, useEffect, useMemo } from 'react';
import { getTimeSlots } from '@/api';
import { DEFAULT_TIMESLOTS, type TimeSlotLookup } from '@/types/timetable.type';

const buildTimeSlotMapFromDefaults = (): Record<string, string> => {
  const slotMap: Record<string, string> = {};
  DEFAULT_TIMESLOTS.forEach((slot, index) => {
    slotMap[`Slot${index + 1}`] = slot.startTime;
  });
  return slotMap;
};

export const useTimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlotLookup[]>([]);
  const [timeSlotMap, setTimeSlotMap] = useState<Record<string, string>>(buildTimeSlotMapFromDefaults());

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await getTimeSlots();
        const slots = response.data || [];
        
        if (slots.length > 0) {
          setTimeSlots(slots);

          const slotMap: Record<string, string> = {};
          slots.forEach((slot: any) => {
            if (slot.code && slot.name) {
              const timeMatch = slot.name.match(/(\d{2}:\d{2})/);
              if (timeMatch) {
                slotMap[slot.code] = timeMatch[1];
              }
            }
          });
          setTimeSlotMap(slotMap);
        } else {
          // Use default timeslots if API returns empty
          console.warn('No time slots from API, using defaults');
        }
      } catch (err) {
        console.warn('Could not fetch time slots, using defaults:', err);
        // timeSlotMap is already initialized with defaults
      }
    };

    fetchTimeSlots();
  }, []);

  const scheduleConfig = useMemo(() => {
    // Use timeSlots from API if available, otherwise use DEFAULT_TIMESLOTS
    const slotsToUse = timeSlots.length > 0 ? timeSlots : DEFAULT_TIMESLOTS;

    if (slotsToUse.length === 0) {
      return { startHour: 9, slots: 13, slotMinutes: 60 };
    }

    let times: number[];
    
    if (timeSlots.length > 0) {
      // Parse from API response
      times = timeSlots
        .map((slot: any) => {
          const timeMatch = slot.name?.match(/(\d{2}):(\d{2})/);
          if (timeMatch) {
            return parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
          }
          return null;
        })
        .filter((t): t is number => t !== null)
        .sort((a, b) => a - b);
    } else {
      // Parse from DEFAULT_TIMESLOTS
      times = DEFAULT_TIMESLOTS
        .map((slot) => {
          const [hours, minutes] = slot.startTime.split(':').map(Number);
          return hours * 60 + minutes;
        })
        .sort((a, b) => a - b);
    }

    if (times.length === 0) {
      return { startHour: 9, slots: 13, slotMinutes: 60 };
    }

    const startMinutes = Math.min(...times);
    const endMinutes = Math.max(...times) + 90;
    const startHour = Math.floor(startMinutes / 60);
    const totalMinutes = endMinutes - startMinutes;
    const slots = Math.ceil(totalMinutes / 60);

    return { startHour, slots, slotMinutes: 60 };
  }, [timeSlots]);

  return { timeSlots, timeSlotMap, scheduleConfig };
};

