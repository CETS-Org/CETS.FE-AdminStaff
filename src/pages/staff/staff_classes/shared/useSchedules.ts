import { useCallback, useState } from "react";
import type { ScheduleRow, TimeSlotOption } from "@/pages/staff/staff_classes/components/ScheduleSection";

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

  const add = useCallback((_onError?: (m: string) => void) => {
    setValue((prev) => [...prev, { timeSlotID: "", dayOfWeek: 0 }]);
  }, []);

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
