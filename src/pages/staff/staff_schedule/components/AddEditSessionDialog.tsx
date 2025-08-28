import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (session: { date: string; time: string; room: string; type: string; teacherName?: string }) => void;
  initial?: { date: string; time: string; room: string; type: string; teacherName?: string } | null;
};

export default function AddEditSessionDialog({ open, onOpenChange, onSave, initial }: Props) {
  const [date, setDate] = useState(initial?.date || "");
  const [time, setTime] = useState(initial?.time || "");
  const [room, setRoom] = useState(initial?.room || "");
  const [type, setType] = useState(initial?.type || "lesson");
  const [teacherName, setTeacherName] = useState(initial?.teacherName || "");

  useEffect(() => {
    setDate(initial?.date || "");
    setTime(initial?.time || "");
    setRoom(initial?.room || "");
    setType(initial?.type || "lesson");
    setTeacherName(initial?.teacherName || "");
  }, [initial, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    onSave({ date, time, room, type, teacherName });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Session" : "Add Session"}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-3">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
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


