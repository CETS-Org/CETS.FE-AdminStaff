import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

type Course = {
  id: number;
  name: string;
  level: string;
  duration: string;
  price: number;
  maxStudents: number;
  currentStudents: number;
  status: "active" | "inactive" | "full";
  description?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (course: Omit<Course, 'id'>) => void;
  initial?: Course | null;
};

export default function AddEditCourseDialog({ open, onOpenChange, onSave, initial }: Props) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [currentStudents, setCurrentStudents] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "full">("active");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setLevel(initial.level);
      setDuration(initial.duration);
      setPrice(initial.price.toString());
      setMaxStudents(initial.maxStudents.toString());
      setCurrentStudents(initial.currentStudents.toString());
      setStatus(initial.status);
      setDescription(initial.description || "");
    } else {
      setName("");
      setLevel("");
      setDuration("");
      setPrice("");
      setMaxStudents("");
      setCurrentStudents("");
      setStatus("active");
      setDescription("");
    }
  }, [initial, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    if (!name || !level || !duration || !price || !maxStudents || !currentStudents) {
      alert("Please fill in all required fields");
      return;
    }

    onSave({
      name,
      level,
      duration,
      price: parseInt(price),
      maxStudents: parseInt(maxStudents),
      currentStudents: parseInt(currentStudents),
      status,
      description: description || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Course" : "Add New Course"}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Course Name *"
              placeholder="Enter course name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Select
              label="Level *"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              options={[
                { label: "Beginner", value: "Beginner" },
                { label: "A1", value: "A1" },
                { label: "A2", value: "A2" },
                { label: "B1", value: "B1" },
                { label: "B2", value: "B2" },
                { label: "C1", value: "C1" },
                { label: "C2", value: "C2" },
                { label: "All levels", value: "All levels" },
              ]}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration *"
              placeholder="e.g., 6 months"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <Input
              label="Price (VND) *"
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Students *"
              type="number"
              placeholder="Enter max students"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
            />
            <Input
              label="Current Students *"
              type="number"
              placeholder="Enter current students"
              value={currentStudents}
              onChange={(e) => setCurrentStudents(e.target.value)}
            />
          </div>

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "inactive" | "full")}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Full", value: "full" },
            ]}
          />

          <Input
            label="Description"
            placeholder="Enter course description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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

