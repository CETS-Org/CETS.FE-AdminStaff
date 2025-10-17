import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import { Trash2 } from "lucide-react";
import type { CourseScheduleUI, LookupOption } from '../../shared/types/course-form.types';

type CourseScheduleSectionProps = {
  schedules: CourseScheduleUI[];
  timeslotOptions: LookupOption[];
  onAddSchedule: () => void;
  onRemoveSchedule: (index: number) => void;
  onUpdateSchedule: (index: number, field: 'timeSlotID' | 'dayOfWeek', value: string | number) => void;
  isTimeSlotAvailable: (timeSlotID: string, dayOfWeek: number, currentIndex: number) => boolean;
  checkScheduleDuplicate: (timeSlotID: string, dayOfWeek: number, excludeIndex?: number) => boolean;
};

const allDays = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export default function CourseScheduleSection({
  schedules,
  timeslotOptions,
  onAddSchedule,
  onRemoveSchedule,
  onUpdateSchedule,
  isTimeSlotAvailable,
  checkScheduleDuplicate
}: CourseScheduleSectionProps) {
  return (
    <div className="space-y-4 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">Course Schedules</h4>
          <p className="text-xs text-gray-500 mt-1">Set recurring meeting times for this course</p>
        </div>
        <Button size="sm" variant="secondary" onClick={onAddSchedule}>
          Add Schedule
        </Button>
      </div>
      
      {schedules.length === 0 && (
        <p className="text-xs text-gray-500">No schedules added yet. Add schedule slots for this course.</p>
      )}
      
      <div className="space-y-3">
        {schedules.map((schedule, idx) => {
          const isDuplicate = checkScheduleDuplicate(schedule.timeSlotID, schedule.dayOfWeek, idx);
          const currentDay = Number(schedule.dayOfWeek);
          const currentTimeSlot = schedule.timeSlotID;
          
          // Filter available days for current timeslot
          const availableDays = allDays.filter(d => 
            d.value === currentDay || isTimeSlotAvailable(currentTimeSlot, d.value, idx)
          );
          
          // Filter available timeslots for current day
          const availableTimeSlots = timeslotOptions.filter(opt => 
            opt.value === currentTimeSlot || isTimeSlotAvailable(opt.value, currentDay, idx)
          );
          
          return (
            <div 
              key={`${idx}-${schedule.timeSlotID}-${schedule.dayOfWeek}`} 
              className={`border rounded-lg p-4 ${isDuplicate ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
            >
              {isDuplicate && (
                <div className="w-full mb-3 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700 font-medium">
                  ⚠️ This schedule is a duplicate and will not be saved. Please change the day or time slot.
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Day of Week</Label>
                    <Select
                      key={`day-${idx}-${schedules.length}`}
                      value={schedule.dayOfWeek.toString()}
                      onChange={(e) => onUpdateSchedule(idx, 'dayOfWeek', Number(e.target.value))}
                      className="mt-1"
                    >
                      {availableDays.length === 0 ? (
                        <option value="">No available days</option>
                      ) : (
                        availableDays.map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))
                      )}
                    </Select>
                    {[0, 1, 2, 3, 4, 5, 6].filter(day => isTimeSlotAvailable(schedule.timeSlotID, day, idx)).length === 0 && (
                      <p className="text-xs text-red-600 mt-1">This time slot is taken on all days. Please select a different time slot.</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-xs">Time Slot</Label>
                    <Select
                      key={`timeslot-${idx}-${schedule.dayOfWeek}-${schedules.length}`}
                      value={schedule.timeSlotID}
                      onChange={(e) => onUpdateSchedule(idx, 'timeSlotID', e.target.value)}
                      className="mt-1"
                    >
                      {availableTimeSlots.length === 0 ? (
                        <option value="">No available time slots</option>
                      ) : (
                        availableTimeSlots.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))
                      )}
                    </Select>
                    {timeslotOptions.filter(opt => isTimeSlotAvailable(opt.value, Number(schedule.dayOfWeek), idx)).length === 0 && (
                      <p className="text-xs text-red-600 mt-1">No available time slots for this day. Please select a different day.</p>
                    )}
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="text-white hover:text-white !bg-red-500 hover:!bg-accent2-500 border-red-200 !p-2 mt-5"
                  onClick={() => onRemoveSchedule(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

