import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Upload, User, Camera, Trash2 } from "lucide-react";
import { updateStudent } from "@/api/student.api";
import type { Student, UpdateStudent } from "@/types/student.type";
import { useStudentStore } from "@/store/student.store";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (student: UpdateStudent) => void;
  initial?: UpdateStudent | null;
};


export default function AddEditStudentDialog({ open, onOpenChange, onSave, initial }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [cid, setCid] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [school, setSchool] = useState("");
  const [academicNote, setAcademicNote] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updatedStudent } = useStudentStore();
  
  useEffect(() => {
    if (initial) {
      setFullName(initial.fullName || "");
      setEmail(initial.email || "");
      setPhoneNumber(initial.phoneNumber || "");
      setDateOfBirth(initial.dateOfBirth || "");
      setCid(initial.cid || "");
      setAddress(initial.address || "");
      setAvatarUrl(initial.avatarUrl || "");
      setGuardianName(initial.guardianName || "");
      setGuardianPhone(initial.guardianPhone || "");
      setSchool(initial.school || "");
      setAcademicNote(initial.academicNote || "");
      setAvatarPreview(initial.avatarUrl || "");
    } else {
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setDateOfBirth("");
      setCid("");
      setAddress("");
      setAvatarUrl("");
      setGuardianName("");
      setGuardianPhone("");
      setSchool("");
      setAcademicNote("");
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
        setAvatarUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatarPreview("");
    setAvatarUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setErrors({});
    onOpenChange(false);
  };

  const clearErrors = () => {
    setErrors({});
  };

  const setFieldError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleSave = async () => {
    clearErrors();
    let hasErrors = false;

    // Only email is required based on UpdateStudent type
    if (!email) {
      setFieldError("email", "Email is required");
      hasErrors = true;
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFieldError("email", "Please enter a valid email address");
        hasErrors = true;
      }
    }

    // Validate phone number format if provided
    if (phoneNumber && phoneNumber.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
        setFieldError("phoneNumber", "Please enter a valid phone number");
        hasErrors = true;
      }
    }

    // Validate guardian phone format if provided
    if (guardianPhone && guardianPhone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(guardianPhone.replace(/\s/g, ''))) {
        setFieldError("guardianPhone", "Please enter a valid guardian phone number");
        hasErrors = true;
      }
    }

    // if (!initial) {
    //   setFieldError("general", "Student ID is required for editing");
    //   hasErrors = true;
    // }

    if (hasErrors) {
      return;
    }

    try {
      setLoading(true);
      
      const updateData: UpdateStudent = {
        accountID: initial!.accountID,
        fullName,
        email,
        phoneNumber,
        cid,
        address,
        dateOfBirth,
        avatarUrl,
        guardianName,
        guardianPhone,
        school,
        academicNote,
      };

      const updatedStd = await updateStudent(initial!.accountID, updateData);
      onSave(updatedStd);
      updatedStudent(updatedStd);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating student:", error);
      setFieldError("general", "Failed to update student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper component to display error message
  const ErrorMessage = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <div className="text-red-500 text-sm mt-1">
        {errors[field]}
      </div>
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
                      <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Choose Photo
                      </div>
                    </Button>
                    {avatarPreview && (
                      <Button
                        onClick={removeAvatar}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <div className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Remove
                        </div>
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
              <div>
                <Input
                  label="Full Name"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}              
                />
                <ErrorMessage field="fullName" />
              </div>
              <div>
                <Input
                  label="Email *"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  required
                />
                <ErrorMessage field="email" />
              </div>
              <div>
                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    clearFieldError("phoneNumber");
                  }}
                />
                <ErrorMessage field="phoneNumber" />
              </div>
            </div>
           
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
                <ErrorMessage field="dateOfBirth" />
              </div>
              <div>
                <Input
                  label="CID"
                  placeholder="Enter CID"
                  value={cid}
                  onChange={(e) => setCid(e.target.value)}
                />
                <ErrorMessage field="cid" />
              </div>
              <div>
                <Input
                  label="Address"
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <ErrorMessage field="address" />
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Guardian Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Input
                  label="Guardian Name"
                  placeholder="Enter guardian name"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                />
                <ErrorMessage field="guardianName" />
              </div>
              <div>
                <Input
                  label="Guardian Phone"
                  placeholder="Enter guardian phone"
                  value={guardianPhone}
                  onChange={(e) => {
                    setGuardianPhone(e.target.value);
                    clearFieldError("guardianPhone");
                  }}
                />
                <ErrorMessage field="guardianPhone" />
              </div>
              <div>
                <Input
                  label="School"
                  placeholder="Enter school name"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                />
                <ErrorMessage field="school" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Input
                  label="Academic Note"
                  placeholder="Enter academic notes"
                  value={academicNote}
                  onChange={(e) => setAcademicNote(e.target.value)}
                />
                <ErrorMessage field="academicNote" />
              </div>
            </div>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800 text-sm">
                {errors.general}
              </div>
            </div>
          )}

        </DialogBody>
        <DialogFooter className="sticky bottom-0 bg-gray-50 z-10 border-t pt-6 shadow-sm flex items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Only email field is required
          </div>
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={handleClose} className="min-w-[120px]">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="min-w-[140px]"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Student"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
