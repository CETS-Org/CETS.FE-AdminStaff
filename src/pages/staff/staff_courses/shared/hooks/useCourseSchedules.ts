import { useState } from 'react';
import type { CourseScheduleUI, LookupOption } from '../types/course-form.types';

export const useCourseSchedules = (timeslotOptions: LookupOption[]) => {
  const [schedules, setSchedules] = useState<CourseScheduleUI[]>([]);
  const [originalSchedules, setOriginalSchedules] = useState<CourseScheduleUI[]>([]);

  const checkScheduleDuplicate = (timeSlotID: string, dayOfWeek: number, excludeIndex?: number): boolean => {
    return schedules.some((sch, idx) => {
      if (excludeIndex !== undefined && idx === excludeIndex) return false;
      return sch.timeSlotID === timeSlotID && Number(sch.dayOfWeek) === Number(dayOfWeek);
    });
  };

  const isTimeSlotAvailable = (timeSlotID: string, dayOfWeek: number, currentIndex: number): boolean => {
    return !checkScheduleDuplicate(timeSlotID, dayOfWeek, currentIndex);
  };

  const isDayAvailable = (dayOfWeek: number, currentIndex: number): boolean => {
    return timeslotOptions.some(slot => !checkScheduleDuplicate(slot.value, dayOfWeek, currentIndex));
  };

  const addSchedule = (onError: (message: string) => void) => {
    if (timeslotOptions.length === 0) {
      onError("Please wait for timeslots to load");
      return;
    }
    
    let foundAvailable = false;
    let newTimeSlotID = timeslotOptions[0].value;
    let newDayOfWeek = 1;
    
    for (let day = 0; day <= 6; day++) {
      if (!checkScheduleDuplicate(timeslotOptions[0].value, day)) {
        newTimeSlotID = timeslotOptions[0].value;
        newDayOfWeek = day;
        foundAvailable = true;
        break;
      }
    }
    
    if (!foundAvailable) {
      for (const slot of timeslotOptions) {
        for (let day = 0; day <= 6; day++) {
          if (!checkScheduleDuplicate(slot.value, day)) {
            newTimeSlotID = slot.value;
            newDayOfWeek = day;
            foundAvailable = true;
            break;
          }
        }
        if (foundAvailable) break;
      }
    }
    
    if (!foundAvailable) {
      onError("All schedule combinations are already in use. Please remove an existing schedule to add a new one.");
      return;
    }
    
    setSchedules(prev => [...prev, { timeSlotID: newTimeSlotID, dayOfWeek: newDayOfWeek }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(prev => prev.filter((_, i) => i !== index));
  };

  const updateSchedule = (
    index: number, 
    field: 'timeSlotID' | 'dayOfWeek', 
    value: string | number,
    onError: (message: string) => void
  ) => {
    if (field === 'timeSlotID') {
      const newTimeSlotID = value as string;
      const currentDay = Number(schedules[index].dayOfWeek);

      if (!isTimeSlotAvailable(newTimeSlotID, currentDay, index)) {
        const availableDay = [0,1,2,3,4,5,6].find(day => isTimeSlotAvailable(newTimeSlotID, day, index));
        if (availableDay !== undefined) {
          setSchedules(prev => prev.map((sch, i) =>
            i === index ? { ...sch, timeSlotID: newTimeSlotID, dayOfWeek: availableDay } : sch
          ));
          return;
        }
        onError("This time slot is already used across all days. Please select a different time slot.");
        return;
      }
    } else if (field === 'dayOfWeek') {
      const newDayOfWeek = Number(value);
      const currentTimeSlot = schedules[index].timeSlotID;
      
      if (!isTimeSlotAvailable(currentTimeSlot, newDayOfWeek, index)) {
        const availableSlot = timeslotOptions.find(opt => 
          isTimeSlotAvailable(opt.value, newDayOfWeek, index)
        );
        
        if (availableSlot) {
          setSchedules(prev => prev.map((sch, i) => 
            i === index ? { ...sch, dayOfWeek: newDayOfWeek, timeSlotID: availableSlot.value } : sch
          ));
          return;
        } else {
          onError("No available time slots for this day. Please select a different day.");
          return;
        }
      }
    }
    
    const updatedSchedule = { ...schedules[index], [field]: value };
    
    if (checkScheduleDuplicate(updatedSchedule.timeSlotID, Number(updatedSchedule.dayOfWeek), index)) {
      onError("This schedule combination already exists. Please choose a different option.");
      return;
    }
    
    setSchedules(prev => prev.map((sch, i) => i === index ? updatedSchedule : sch));
  };

  const loadSchedules = (apiSchedules: any[]) => {
    const mappedSchedules: CourseScheduleUI[] = apiSchedules.map((sch: any) => ({
      id: sch.id,
      timeSlotID: sch.timeSlotID,
      dayOfWeek: sch.dayOfWeek
    }));
    setSchedules(mappedSchedules);
    setOriginalSchedules(JSON.parse(JSON.stringify(mappedSchedules)));
  };

  const resetSchedules = () => {
    setSchedules([]);
    setOriginalSchedules([]);
  };

  return {
    schedules,
    originalSchedules,
    setSchedules,
    checkScheduleDuplicate,
    isTimeSlotAvailable,
    isDayAvailable,
    addSchedule,
    removeSchedule,
    updateSchedule,
    loadSchedules,
    resetSchedules
  };
};

