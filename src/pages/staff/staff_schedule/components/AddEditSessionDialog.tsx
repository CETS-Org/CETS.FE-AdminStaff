import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (session: { date: string; startTime: string; endTime: string; room: string; type: string; teacherName?: string; className?: string }) => void;
  initial?: { date: string; startTime: string; endTime: string; room: string; type: string; teacherName?: string; className?: string } | null;
};

export default function AddEditSessionDialog({ open, onOpenChange, onSave, initial }: Props) {
  const [date, setDate] = useState(initial?.date || "");
  const [startTime, setStartTime] = useState(initial?.startTime || "");
  const [endTime, setEndTime] = useState(initial?.endTime || "");
  const [room, setRoom] = useState(initial?.room || "");
  const [type, setType] = useState(initial?.type || "lesson");
  const [teacherName, setTeacherName] = useState(initial?.teacherName || "");
  const [className, setClassName] = useState(initial?.className || "");

  useEffect(() => {
    setDate(initial?.date || "");
    setStartTime(initial?.startTime || "");
    setEndTime(initial?.endTime || "");
    setRoom(initial?.room || "");
    setType(initial?.type || "lesson");
    setTeacherName(initial?.teacherName || "");
    setClassName(initial?.className || "");
  }, [initial, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    onSave({ date, startTime, endTime, room, type, teacherName, className });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Session" : "Add Session"}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-3">
          <Input label="Class Name" placeholder="Enter class name" value={className} onChange={(e) => setClassName(e.target.value)} />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Input label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <Input label="Room" placeholder="Enter room" value={room} onChange={(e) => setRoom(e.target.value)} />
          <Input label="Teacher" placeholder="Enter teacher name" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} />
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { label: "Lesson", value: "lesson" },
              { label: "Exam", value: "exam" },
              { label: "Break", value: "break" },
            ]}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


