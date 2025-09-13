import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { X, User, Mail, Phone, Calendar, MapPin, IdCard } from "lucide-react";
import type { Account } from "@/types/account.type";

interface AddEditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (staff: any) => void;
  staff?: Account | null;
  mode: "add" | "edit";
}

export default function AddEditStaffDialog({
  open,
  onOpenChange,
  onSave,
  staff,
  mode
}: AddEditStaffDialogProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    cid: "",
    roleNames: [] as string[],
    statusName: "Active"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
          roleNames: staff.roleNames || [],
          statusName: staff.statusName || "Active"
        });
      } else {
        // Reset form for add mode
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          dateOfBirth: "",
          address: "",
          cid: "",
          roleNames: [],
          statusName: "Active"
        });
      }
      setErrors({});
    }
  }, [open, mode, staff]);

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

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.cid.trim()) {
      newErrors.cid = "CID is required";
    }

    if (formData.roleNames.length === 0) {
      newErrors.roleNames = "At least one role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const staffData = {
        ...formData,
        accountId: mode === "edit" ? staff?.accountId : undefined,
        isVerified: mode === "edit" ? staff?.isVerified : false,
        createdAt: mode === "edit" ? staff?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false
      };
      
      onSave(staffData);
      onOpenChange(false);
    }
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        roleNames: [...prev.roleNames, role]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        roleNames: prev.roleNames.filter(r => r !== role)
      }));
    }
  };

  const roleOptions = [
    { label: "Academic Staff", value: "AcademicStaff" },
    { label: "Accountant Staff", value: "AccountantStaff" }
  ];

  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    { label: "Pending", value: "Pending" },
    { label: "Suspended", value: "Suspended" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
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

        <DialogBody>
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  error={errors.fullName}
                  placeholder="Enter full name"
                />
                
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  error={errors.email}
                  placeholder="Enter email address"
                />
                
                <Input
                  label="Phone Number *"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  error={errors.phoneNumber}
                  placeholder="Enter phone number"
                />
                
                <Input
                  label="Date of Birth *"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, cid: e.target.value }))}
                  error={errors.cid}
                  placeholder="Enter CID"
                />
              </div>
            </div>

            {/* Role and Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Role & Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Roles *
                  </label>
                  <div className="space-y-2">
                    {roleOptions.map((role) => (
                      <label key={role.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.roleNames.includes(role.value)}
                          onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{role.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.roleNames && (
                    <p className="mt-1 text-sm text-red-600">{errors.roleNames}</p>
                  )}
                </div>
                
                <Select
                  label="Status"
                  value={formData.statusName}
                  onChange={(e) => setFormData(prev => ({ ...prev, statusName: e.target.value }))}
                  options={statusOptions}
                />
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
          variant="secondary"
            onClick={handleSave}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            {mode === "add" ? "Add Staff" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
