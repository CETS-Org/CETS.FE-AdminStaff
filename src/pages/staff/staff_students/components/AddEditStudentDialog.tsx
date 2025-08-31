import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

type Student = {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  level: string;
  enrolledCourses: string[];
  status: "active" | "inactive" | "graduated";
  joinDate: string;
  avatar?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (student: Omit<Student, 'id'>) => void;
  initial?: Student | null;
};

const availableCourses = [
  "IELTS Foundation",
  "TOEIC Advanced", 
  "Kids English",
  "Business English",
  "Conversation Club"
];

export default function AddEditStudentDialog({ open, onOpenChange, onSave, initial }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "inactive" | "graduated">("active");
  const [joinDate, setJoinDate] = useState("");

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setEmail(initial.email);
      setPhone(initial.phone);
      setAge(initial.age.toString());
      setLevel(initial.level);
      setEnrolledCourses(initial.enrolledCourses);
      setStatus(initial.status);
      setJoinDate(initial.joinDate);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setAge("");
      setLevel("");
      setEnrolledCourses([]);
      setStatus("active");
      setJoinDate(new Date().toISOString().slice(0, 10));
    }
  }, [initial, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    if (!name || !email || !phone || !age || !level || !joinDate) {
      alert("Please fill in all required fields");
      return;
    }

    onSave({
      name,
      email,
      phone,
      age: parseInt(age),
      level,
      enrolledCourses,
      status,
      joinDate,
    });
  };

  const toggleCourse = (course: string) => {
    setEnrolledCourses(prev => 
      prev.includes(course) 
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Student" : "Add New Student"}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email *"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone *"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Age *"
              type="number"
              placeholder="Enter age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="English Level *"
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
              ]}
            />
            <Input
              label="Join Date *"
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
            />
          </div>

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "inactive" | "graduated")}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Graduated", value: "graduated" },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Enrolled Courses
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableCourses.map((course) => (
                <label key={course} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enrolledCourses.includes(course)}
                    onChange={() => toggleCourse(course)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">{course}</span>
                </label>
              ))}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

