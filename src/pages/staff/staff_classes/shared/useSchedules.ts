import { useCallback, useState } from "react";
import type { ScheduleRow, TimeSlotOption } from "@/pages/staff/staff_classes/components/ScheduleSection";

// 1. Định nghĩa danh sách các ngày để tính toán thứ tự
const DAYS_ORDER = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function useSchedules(
  initial: ScheduleRow[] = [],
  opts?: {
    timeslotOptions?: TimeSlotOption[];
    onError?: (msg: string) => void;
  }
) {
  const [value, setValue] = useState<ScheduleRow[]>(initial);
  const [original, setOriginal] = useState<ScheduleRow[]>(initial);

  const load = useCallback((rows: ScheduleRow[]) => {
    setValue(rows ?? []);
    setOriginal(rows ?? []);
  }, []);

  const reset = useCallback(() => {
    setValue(original ?? []);
  }, [original]);

  // --- PHẦN CHỈNH SỬA LOGIC TỰ ĐỘNG TĂNG THỨ ---
  const add = useCallback((_onError?: (m: string) => void) => {
    setValue((prev) => {
      let nextDay = "Monday"; // Mặc định nếu chưa có dòng nào
      let nextSlot = "";

      // Nếu đã có dòng trước đó, lấy thứ của dòng cuối cùng và +1 ngày
      if (prev.length > 0) {
        const lastRow = prev[prev.length - 1];
        
        // Tìm vị trí của ngày hiện tại (ví dụ Monday là 1)
        const currentDayIndex = DAYS_ORDER.indexOf(lastRow.dayOfWeek);
        
        if (currentDayIndex !== -1) {
          // Cộng thêm 1, dùng % 7 để nếu là Saturday (6) thì quay về Sunday (0)
          const nextDayIndex = (currentDayIndex + 1) % 7;
          nextDay = DAYS_ORDER[nextDayIndex];
        }

        // UX: Copy luôn giờ của dòng trước để người dùng đỡ phải chọn lại
        nextSlot = lastRow.timeSlotID || "";
      }

      // Ép kiểu 'as any' cho nextDay vì TS có thể hiểu lầm là string thường
      return [...prev, { timeSlotID: nextSlot, dayOfWeek: nextDay as any }];
    });
  }, []);
  // ----------------------------------------------

  const remove = useCallback((index: number) => {
    setValue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const update = useCallback(
    (index: number, field: "timeSlotID" | "dayOfWeek", v: string | number) => {
      setValue((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: v } : r)));
    },
    []
  );

  const checkDuplicate = useCallback(
    (rows?: ScheduleRow[]) => {
      const arr = rows ?? value;
      const keySet = new Map<string, number[]>();
      arr.forEach((r, i) => {
        const key = `${r.timeSlotID}__${r.dayOfWeek}`;
        keySet.set(key, [...(keySet.get(key) || []), i]);
      });
      const dups: number[] = [];
      keySet.forEach((idxs) => {
        if (idxs.length > 1) dups.push(...idxs);
      });
      return { hasDup: dups.length > 0, dups };
    },
    [value]
  );

  const isTimeSlotAvailable = useCallback(
    (timeSlotID: string) => {
      if (!opts?.timeslotOptions) return true;
      return opts.timeslotOptions.some((o) => o.value === timeSlotID);
    },
    [opts?.timeslotOptions]
  );

  return {
    value,
    setValue,
    original,
    load,
    reset,
    add,
    remove,
    update,
    checkDuplicate,
    isTimeSlotAvailable
  };
}