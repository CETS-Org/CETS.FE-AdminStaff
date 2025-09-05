import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Upload, User, Camera, Trash2 } from "lucide-react";

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
  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setAvatar(initial.avatar || "");
      setAvatarPreview(initial.avatar || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setAge("");
      setLevel("");
      setEnrolledCourses([]);
      setStatus("active");
      setJoinDate(new Date().toISOString().slice(0, 10));
      setAvatar("");
      setAvatarPreview("");
    }
  }, [initial, open]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatarPreview("");
    setAvatar("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      avatar,
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
      <DialogContent size="xl" className="max-w-5xl">
        <DialogHeader className="sticky top-0 bg-white z-10 border-b pb-4 shadow-sm">
          <DialogTitle>{initial ? "Edit Student" : "Add New Student"}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-6 pt-2">
          {/* Avatar Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Profile Photo</h3>
            <div className="flex items-center gap-8">
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100 cursor-pointer hover:border-primary-300 transition-colors"
                  onClick={handleAvatarClick}
                >
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Upload Profile Photo</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload a professional photo. Supported formats: JPG, PNG, GIF. Max size: 5MB.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleAvatarClick}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Photo
                    </Button>
                    {avatarPreview && (
                      <Button
                        onClick={removeAvatar}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-3 gap-4">
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
              <Input
                label="Phone *"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
           
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Age *"
                type="number"
                placeholder="Enter age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
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

            <div className="grid grid-cols-3 gap-4">
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
              <div></div>
              <div></div>
            </div>
          </div>

          {/* Course Enrollment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Course Enrollment</h3>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-4">
                Enrolled Courses
              </label>
              <div className="grid grid-cols-3 gap-4">
                {availableCourses.map((course) => (
                  <label key={course} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={enrolledCourses.includes(course)}
                      onChange={() => toggleCourse(course)}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700 font-medium">{course}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="sticky bottom-0 bg-gray-50 z-10 border-t pt-6 shadow-sm flex items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            All fields marked with * are required
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={handleClose} className="min-w-[120px]">
              Cancel
            </Button>
            <Button onClick={handleSave} className="min-w-[140px]">
              {initial ? "Update Student" : "Add Student"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
