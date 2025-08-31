import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

type Teacher = {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  status: "active" | "inactive" | "on_leave";
  joinDate: string;
  avatar?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (teacher: Omit<Teacher, 'id'>) => void;
  initial?: Teacher | null;
};

const specializations = [
  "IELTS",
  "TOEIC", 
  "Kids English",
  "Business English",
  "Conversation",
  "Grammar",
  "Pronunciation"
];

const experienceOptions = [
  "1 year",
  "2 years", 
  "3 years",
  "4 years",
  "5 years",
  "6 years",
  "7+ years"
];

export default function AddEditTeacherDialog({ open, onOpenChange, onSave, initial }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "on_leave">("active");
  const [joinDate, setJoinDate] = useState("");

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setEmail(initial.email);
      setPhone(initial.phone);
      setSpecialization(initial.specialization);
      setExperience(initial.experience);
      setStatus(initial.status);
      setJoinDate(initial.joinDate);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setSpecialization("");
      setExperience("");
      setStatus("active");
      setJoinDate(new Date().toISOString().slice(0, 10));
    }
  }, [initial, open]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    if (!name || !email || !phone || !specialization || !experience || !joinDate) {
      alert("Please fill in all required fields");
      return;
    }

    onSave({
      name,
      email,
      phone,
      specialization,
      experience,
      status,
      joinDate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
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
              label="Join Date *"
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Specialization *"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              options={specializations.map(s => ({ label: s, value: s }))}
            />
            <Select
              label="Experience *"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              options={experienceOptions.map(e => ({ label: e, value: e }))}
            />
          </div>

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "inactive" | "on_leave")}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "On Leave", value: "on_leave" },
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

