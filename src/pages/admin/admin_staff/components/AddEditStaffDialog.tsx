import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { User, Upload, Camera, Trash2 } from "lucide-react";
import type { Account, Role } from "@/types/account.type";
import type { UpdateStaffProfile, AddStaffProfile } from "@/types/staff.type";
import { updateStaffProfile, addStaff, getRoles } from "@/api/staff.api";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import { useNavigate } from "react-router-dom";

interface AddEditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSuccess?: () => void;
  staff?: Account | null;
  mode: "add" | "edit";
}

export default function AddEditStaffDialog({
  open,
  onOpenChange,
  onUpdateSuccess,
  staff,
  mode
}: AddEditStaffDialogProps) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    cid: "",
    avatarUrl: "",
    roleID: "",
    statusName: "Active"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [staffRoles, setStaffRoles] = useState<Role[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  

  // Derived form validity for disabling submit
  const isFormValid = (() => {
    const hasFullName = formData.fullName.trim().length > 0;
    const hasEmail = formData.email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const hasPhone = formData.phoneNumber.trim().length > 0 && /^0\d{9}$/.test(formData.phoneNumber.replace(/\s/g, ''));
    
    // Check date of birth and age
    let hasValidDob = false;
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob <= today) {
        // Calculate age
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();
        
        // Adjust age if birthday hasn't occurred this year
        const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
        hasValidDob = actualAge >= 18;
      }
    }
    
    const validCid = formData.cid.trim().length > 0 && /^\d{9,12}$/.test(formData.cid.trim());
    const roleOk = mode === "edit" ? true : !!formData.roleID;
    return hasFullName && hasEmail && hasPhone && hasValidDob && validCid && roleOk;
  })();

  // Fetch roles when dialog opens
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const allRoles = await getRoles();
        // Prefer staff roles; fallback to all roles if none matched
        const filteredRoles = allRoles.filter(role => role.roleName?.toLowerCase().includes('staff'));
        setStaffRoles(filteredRoles.length > 0 ? filteredRoles : allRoles);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setUpdateError('Failed to load roles');
      }
    };

    if (open) {
      fetchRoles();
    }
  }, [open]);

  // Initialize form data when dialog opens or staff changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && staff) {
        setFormData({
          fullName: staff.fullName || "",
          email: staff.email || "",
          phoneNumber: staff.phoneNumber || "",
          dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : "",
          address: staff.address || "",
          cid: staff.cid || "",
          avatarUrl: staff.avatarUrl || "",
          roleID: "", // For edit mode, we don't change role
          statusName: staff.statusName || "Active"
        });
        setAvatarPreview(staff.avatarUrl || "");
      } else {
        // Reset form for add mode
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          dateOfBirth: "",
          address: "",
          cid: "",
          avatarUrl: "",
          roleID: "",
          statusName: "Active"
        });
        setAvatarPreview("");
      }
      setErrors({});
      setUpdateError(null);
    }
  }, [open, mode, staff]);

  // Set default role to Academic Staff when roles are loaded and we're in add mode
  useEffect(() => {
    if (open && mode === "add" && staffRoles.length > 0) {
      // Find Academic Staff role - prioritize exact match, then partial match
      const academicStaffRole = staffRoles.find(role => 
        role.roleName?.toLowerCase() === 'academic staff' ||
        role.roleName?.toLowerCase().includes('academic staff')
      ) || staffRoles.find(role => 
        role.roleName?.toLowerCase().includes('academic')
      ) || staffRoles.find(role => 
        role.roleName?.toLowerCase().includes('staff')
      );
      
      if (academicStaffRole && formData.roleID !== academicStaffRole.id) {
        setFormData(prev => ({ ...prev, roleID: academicStaffRole.id }));
      }
    }
  }, [open, mode, staffRoles]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Required phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      const phoneRegex = /^0\d{9}$/;
      const cleanedPhone = formData.phoneNumber.replace(/\s/g, '');
      if (!phoneRegex.test(cleanedPhone)) {
        newErrors.phoneNumber = "Phone number must start with 0 and have 10 digits";
      }
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      } else {
        // Calculate age
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();
        
        // Adjust age if birthday hasn't occurred this year
        const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
        
        if (actualAge < 18) {
          newErrors.dateOfBirth = "Age must be at least 18 years old";
        }
      }
    }

    if (!formData.cid.trim()) {
      newErrors.cid = "CID is required";
    } else {
      const cidRegex = /^\d{9,12}$/;
      const trimmedCid = formData.cid.trim();
      if (!cidRegex.test(trimmedCid)) {
        newErrors.cid = "CID must be 9-12 digits";
      }
    }

    // Role is auto-set to Academic Staff in add mode, so no need to validate
    // if (mode === "add" && !formData.roleID) {
    //   newErrors.roleID = "Role is required";
    // }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
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
        setFormData(prev => ({ ...prev, avatarUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatarPreview("");
    setFormData(prev => ({ ...prev, avatarUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const performSave = async () => {
    const isValid = validateForm();
    
    if (isValid) {
      setIsLoading(true);
      setUpdateError(null);
      
      try {
        if (mode === "edit" && staff) {
          // For edit mode, use the updateStaffProfile API
          const updateData: UpdateStaffProfile = {
            fullName: formData.fullName.trim() || null,
            email: formData.email.trim() || null,
            phoneNumber: formData.phoneNumber.trim() || null,
            dateOfBirth: formData.dateOfBirth || null,
            address: formData.address.trim() || null,
            cid: formData.cid.trim() || null,
            avatarUrl: formData.avatarUrl.trim() || null
          };
          
          await updateStaffProfile(staff.accountId, updateData);
          
          if (onUpdateSuccess) onUpdateSuccess();
          onOpenChange(false);
          
          // Create preloaded staff data to avoid refetching
          const preloadedStaff = {
            ...staff,
            fullName: updateData.fullName ?? staff.fullName,
            email: updateData.email ?? staff.email,
            phoneNumber: updateData.phoneNumber ?? staff.phoneNumber,
            dateOfBirth: updateData.dateOfBirth ?? staff.dateOfBirth,
            address: updateData.address ?? staff.address,
            cid: updateData.cid ?? staff.cid,
            avatarUrl: updateData.avatarUrl ?? staff.avatarUrl,
          };
          
          navigate(`/admin/staffs/${staff.accountId}`, { 
            state: { 
              updateStatus: "success", 
              preloadedStaff 
            } 
          });
        } else {
          // For add mode, use the addStaff API
          const staffData: AddStaffProfile = {
            email: formData.email.trim() || null,
            phoneNumber: formData.phoneNumber.trim() || null,
            fullName: formData.fullName.trim() || null,
            dateOfBirth: formData.dateOfBirth || null,
            address: formData.address.trim() || null,
            cid: formData.cid.trim() || null, // CID will be hashed in backend
            avatarUrl: formData.avatarUrl.trim() || null,
            roleID: formData.roleID || null
          };
          
          const created = await addStaff(staffData);
          
          // Show success message with email notification info
          alert(`Staff account created successfully!\n\nAn email containing login credentials has been sent to:\n${staffData.email}\n\nThe staff member can use this email and the password provided in the email to log in to the system.`);
          
          if (onUpdateSuccess) onUpdateSuccess();
          onOpenChange(false);
          const newId = (created as any)?.accountId || (created as any)?.id || (created as any)?.accountID;
          if (newId) {
            // Create preloaded staff data for new staff
            const preloadedStaff = {
              accountId: newId,
              fullName: staffData.fullName,
              email: staffData.email,
              phoneNumber: staffData.phoneNumber,
              dateOfBirth: staffData.dateOfBirth,
              address: staffData.address,
              cid: staffData.cid,
              avatarUrl: staffData.avatarUrl,
              roleNames: [], // Will be populated by API
              statusName: "Active", // Default status
              createdAt: new Date().toISOString(),
            };
            
            navigate(`/admin/staffs/${newId}`, { 
              state: { 
                updateStatus: "success", 
                preloadedStaff,
                emailSent: true,
                emailAddress: staffData.email
              } 
            });
          }
        }
      } catch (error) {
        console.error("Error saving staff:", error);
        const message = (error as any)?.response?.data?.message || (error as Error)?.message || "Failed to save staff";
        setUpdateError(message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = () => {
    // For add mode, call API directly without confirmation
    // For edit mode, show confirmation dialog
    if (mode === "add") {
      void performSave();
    } else {
      setIsConfirmOpen(true);
    }
  };


  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange} modal={!isConfirmOpen}>
      <DialogContent size="lg" className="flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {mode === "add" ? "Add New Staff" : "Edit Staff"}
            </DialogTitle>
            {/* <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button> */}
          </div>
        </DialogHeader>

        <DialogBody className="flex-1 overflow-y-auto scrollbar-hide">
          {updateError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{updateError}</p>
            </div>
          )}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
               {/* Avatar Section */}
            <div className="space-y-4">
              
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  value={formData.fullName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, fullName: value }));
                    setErrors(prev => ({
                      ...prev,
                      fullName: value.trim() ? "" : "Full name is required",
                    }));
                  }}
                  error={errors.fullName}
                  placeholder="Enter full name"
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, email: value }));
                    setErrors(prev => ({
                      ...prev,
                      email: !value.trim()
                        ? "Email is required"
                        : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Please enter a valid email"),
                    }));
                  }}
                  error={errors.email}
                  placeholder="Enter email address"
                />
                
                <Input
                  label="Phone Number *"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, phoneNumber: value }));
                    setErrors(prev => ({
                      ...prev,
                      phoneNumber: !value.trim()
                        ? "Phone number is required"
                        : (/^0\d{9}$/.test(value.replace(/\s/g, '')) ? "" : "Phone number must start with 0 and have 10 digits"),
                    }));
                  }}
                  error={errors.phoneNumber}
                  placeholder="0123456789"    
                />
                
                <Input
                  label="Date of Birth *"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, dateOfBirth: value }));
                    
                    let errorMessage = "";
                    if (!value) {
                      errorMessage = "Date of birth is required";
                    } else {
                      const date = new Date(value);
                      const today = new Date();
                      if (date > today) {
                        errorMessage = "Date of birth cannot be in the future";
                      } else {
                        // Calculate age
                        const age = today.getFullYear() - date.getFullYear();
                        const monthDiff = today.getMonth() - date.getMonth();
                        const dayDiff = today.getDate() - date.getDate();
                        
                        // Adjust age if birthday hasn't occurred this year
                        const actualAge = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? age - 1 : age;
                        
                        if (actualAge < 18) {
                          errorMessage = "Age must be at least 18 years old";
                        }
                      }
                    }
                    
                    setErrors(prev => ({
                      ...prev,
                      dateOfBirth: errorMessage,
                    }));
                  }}
                  error={errors.dateOfBirth}
                />
                
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                />
                
                <Input
                  label="CID *"
                  value={formData.cid}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, cid: value }));
                    setErrors(prev => ({
                      ...prev,
                      cid: !value.trim()
                        ? "CID is required"
                        : (/^\d{9,12}$/.test(value.trim()) ? "" : "CID must be 9-12 digits"),
                    }));
                  }}
                  error={errors.cid}
                  placeholder="Enter CID"
                />
                
              </div>
            </div>

           

            {/* Role and Status - Hidden in add mode as it defaults to Academic Staff */}
            {/* {mode === "add" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Role 
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mode === "add" && (
                  <Select
                    label="Role *"
                    value={formData.roleID}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ ...prev, roleID: value }));
                      setErrors(prev => ({ ...prev, roleID: value ? "" : "Role is required" }));
                    }}
                    options={staffRoles.map(role => ({
                      label: role.roleName,
                      value: role.id
                    }))}
                    error={errors.roleID}
                  />
                )}
              </div>
            </div>
            )} */}
          </div>
        </DialogBody>

        <DialogFooter className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={isLoading || !isFormValid}
              className="bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === "add" ? "Adding..." : "Saving..."}
                </div>
              ) : (
                mode === "add" ? "Add Staff" : "Save Changes"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <ConfirmationDialog
      isOpen={isConfirmOpen}
      onClose={() => {
        setIsConfirmOpen(false);
      }}
      onConfirm={() => {
        setIsConfirmOpen(false);
        void performSave();
      }}
      title="Confirm Update"
      message={mode === "add" ? "Do you want to create this staff account?" : "Do you want to update this staff?"}
      confirmText={mode === "add" ? "Yes, create" : "Yes, update"}
      cancelText="No, cancel"
      type="warning"
    />
    </>
  );
}
