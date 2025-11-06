import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { PlusCircle, Trash2, AlertCircle } from "lucide-react";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sun..Sat
export type TimeSlotOption = { value: string; label: string };
export type ScheduleRow = { id?: string; timeSlotID: string; dayOfWeek: DayOfWeek };

export type ScheduleSectionProps = {
  value: ScheduleRow[];
  timeslotOptions: TimeSlotOption[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: "timeSlotID" | "dayOfWeek", v: string | number) => void;
  checkDuplicate?: (rows: ScheduleRow[]) => { hasDup: boolean; dups?: number[] };
  dayLabel?: (d: DayOfWeek) => string;
  readOnly?: boolean;
  className?: string;
};

export default function ScheduleSection({
  value,
  timeslotOptions,
  onAdd,
  onRemove,
  onChange,
  checkDuplicate,
  dayLabel = (d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d],
  readOnly,
  className
}: ScheduleSectionProps) {
  const dupInfo = checkDuplicate?.(value);
  const dupIndexes = new Set(dupInfo?.dups || []);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">Schedules</h3>
          {dupInfo?.hasDup && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
              <AlertCircle className="w-3 h-3" />
              Duplicate time slots detected
            </span>
          )}
        </div>
        {!readOnly && (
          <Button size="sm" onClick={onAdd} iconLeft={<PlusCircle className="w-4 h-4" />}>
            Add Schedule
          </Button>
        )}
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-gray-500">No schedule yet. Click “Add Schedule”.</p>
      ) : (
        <div className="space-y-3">
          {value.map((row, idx) => {
            const isDup = dupIndexes.has(idx);
            return (
              <div
                key={row.id ?? idx}
                className={`grid grid-cols-1 md:grid-cols-3 gap-3 p-3 border rounded-md ${
                  isDup ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white"
                }`}
              >
                <div>
                  <Label>Day of Week</Label>
                  <Select
                    value={String(row.dayOfWeek)}
                    onChange={(e) => onChange(idx, "dayOfWeek", Number(e.target.value))}
                    disabled={readOnly}
                    options={[
                      { value: "0", label: dayLabel(0) },
                      { value: "1", label: dayLabel(1) },
                      { value: "2", label: dayLabel(2) },
                      { value: "3", label: dayLabel(3) },
                      { value: "4", label: dayLabel(4) },
                      { value: "5", label: dayLabel(5) },
                      { value: "6", label: dayLabel(6) }
                    ]}
                  />
                </div>
                <div>
                  <Label>Time Slot</Label>
                  <Select
                    value={row.timeSlotID || ""}
                    onChange={(e) => onChange(idx, "timeSlotID", e.target.value)}
                    disabled={readOnly}
                    options={timeslotOptions}
                  />
                </div>
                <div className="flex items-end justify-end">
                  {!readOnly && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-white hover:text-white !bg-red-500 hover:!bg-accent2-500 border-red-200"
                      onClick={() => onRemove(idx)}
                      iconLeft={<Trash2 className="w-4 h-4" />}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
