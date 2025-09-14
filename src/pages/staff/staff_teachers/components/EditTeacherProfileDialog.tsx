import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Upload, User, Camera, Trash2 } from "lucide-react";
import { updateTeacher } from "@/api/teacher.api";
import type { Teacher, UpdateTeacherProfile } from "@/types/teacher.type";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
  onSave: (updatedTeacher: Teacher) => void;
}

export default function EditTeacherProfileDialog({ 
  open, 
  onOpenChange, 
  teacher, 
  onSave 
}: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [teacherCode, setTeacherCode] = useState("");
  const [yearsExperience, setYearsExperience] = useState(0);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [cid, setCid] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");

  // Initialize form data when teacher changes
  useEffect(() => {
    if (teacher) {
      setTeacherCode(teacher.teacherInfo?.teacherCode || "");
      setYearsExperience(teacher.teacherInfo?.yearsExperience || 0);
      setFullName(teacher.fullName || "");
      setDateOfBirth(teacher.dateOfBirth || "");
      setCid(teacher.cid || "");
      setAddress(teacher.address || "");
      setAvatarUrl(teacher.avatarUrl || "");
      setBio(teacher.teacherInfo?.bio || "");
      setAvatarPreview(teacher.avatarUrl || "");
    }
  }, [teacher]);

  // Clear errors when user types
  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const setFieldError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearErrors = () => {
    setErrors({});
  };

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

  const handleSave = async () => {
    if (!teacher) return;

    clearErrors();
    let hasErrors = false;

    // Validation
    if (!fullName.trim()) {
      setFieldError("fullName", "Full name is required");
      hasErrors = true;
    }

    if (!dateOfBirth.trim()) {
      setFieldError("dateOfBirth", "Date of birth is required");
      hasErrors = true;
    }

    if (yearsExperience < 0) {
      setFieldError("yearsExperience", "Years of experience must be 0 or greater");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      setLoading(true);
      
      const updateData: UpdateTeacherProfile = {
        teacherCode: teacherCode.trim() || null,
        yearsExperience,
        fullName: fullName.trim(),
        dateOfBirth,
        cid: cid.trim() || null,
        address: address.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        bio: bio.trim() || null,
      };

      const updatedTeacher = await updateTeacher(teacher.accountId, updateData);
      onSave(updatedTeacher);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating teacher:", error);
      setFieldError("general", "Failed to update teacher profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ErrorMessage = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <div className="text-red-500 text-sm mt-1">
        {errors[field]}
      </div>
    );
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-5xl">
        <DialogHeader className="sticky top-0 bg-white z-10 border-b pb-4 shadow-sm">
          <DialogTitle>Edit Teacher Profile</DialogTitle>
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
                  label="Full Name *"
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
                  label="Date of Birth *"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    clearFieldError("dateOfBirth");
                  }}
                />
                <ErrorMessage field="dateOfBirth" />
              </div>
              <div>
                <Input
                  label="CID"
                  placeholder="Enter CID"
                  value={cid}
                  onChange={(e) => {
                    setCid(e.target.value);
                    clearFieldError("cid");
                  }}
                />
                <ErrorMessage field="cid" />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Address"
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearFieldError("address");
                  }}
                />
                <ErrorMessage field="address" />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Teacher Code"
                  placeholder="Enter teacher code"
                  value={teacherCode}
                  onChange={(e) => {
                    setTeacherCode(e.target.value);
                    clearFieldError("teacherCode");
                  }}
                />
                <ErrorMessage field="teacherCode" />
              </div>
              <div>
                <Input
                  label="Years of Experience"
                  type="number"
                  min="0"
                  placeholder="Enter years of experience"
                  value={yearsExperience}
                  onChange={(e) => {
                    setYearsExperience(parseInt(e.target.value) || 0);
                    clearFieldError("yearsExperience");
                  }}
                />
                <ErrorMessage field="yearsExperience" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  clearFieldError("bio");
                }}
                placeholder="Enter teacher bio"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <ErrorMessage field="bio" />
            </div>
          </div> */}

          <ErrorMessage field="general" />
        </DialogBody>
        <DialogFooter className="sticky bottom-0 bg-white border-t pt-4 flex flex-col gap-4">
        <div className="text-xs text-gray-500 text-center mt-2">
            Fields marked with * are required
          </div>
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </div>
          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
