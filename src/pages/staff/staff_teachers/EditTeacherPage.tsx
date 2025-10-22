import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { 
  Plus, Trash2, GraduationCap, ArrowLeft, Upload, User, Camera, Save, 
  CheckCircle, AlertCircle, Loader2 
} from "lucide-react";
import { getTeacherById, updateTeacher, getListCredentialType, getListCredentialByTeacherId } from "@/api/teacher.api";
import type { Teacher, UpdateTeacherProfile, CredentialTypeResponse } from "@/types/teacher.type";
import DeleteConfirmDialog from "@/shared/delete_confirm_dialog";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

interface CredentialFormData {
  id: string;
  credentialTypeId: string;
  pictureUrl: string | null;
  name: string | null;
  level: string | null;
}

interface TeacherFormData {
  teacherCode: string | null;
  fullName: string;
  dateOfBirth: string;
  cid: string | null;
  address: string | null;
  avatarUrl: string | null;
  email: string;
  phoneNumber: string | null;
  yearsExperience: number;
  bio: string | null;
  credentials: CredentialFormData[];
}

export default function EditTeacherPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<TeacherFormData>({
    teacherCode: "",
    fullName: "",
    dateOfBirth: "",
    cid: "",
    address: "",
    avatarUrl: "",
    email: "",
    phoneNumber: "",
    yearsExperience: 0,
    bio: "",
    credentials: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [credentialTypes, setCredentialTypes] = useState<CredentialTypeResponse[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [deleteCredentialDialog, setDeleteCredentialDialog] = useState<{ open: boolean; credentialId: string | null; credentialName: string | null }>({ 
    open: false, 
    credentialId: null, 
    credentialName: null 
  });
  const [existingCredentialIds, setExistingCredentialIds] = useState<Set<string>>(new Set());
  const [isConfirmUpdateOpen, setIsConfirmUpdateOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch credential types and teacher data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsInitialLoading(true);
        
        // Fetch credential types
        const types = await getListCredentialType();
        setCredentialTypes(types);
        
        // Fetch teacher data if ID exists
        if (id) {
          const teacherData = await getTeacherById(id);
          setTeacher(teacherData);
          
          // Fetch existing credentials separately
          const credentials = await getListCredentialByTeacherId(id);
          console.log("Fetched existing credentials:", credentials);
          setExistingCredentialIds(new Set(credentials.map((c) => c.credentialId)));
          
          setFormData({
            teacherCode: teacherData.teacherInfo?.teacherCode || "",
            fullName: teacherData.fullName || "",
            dateOfBirth: teacherData.dateOfBirth ? teacherData.dateOfBirth.split('T')[0] : "",
            cid: teacherData.cid || "",
            address: teacherData.address || "",
            avatarUrl: teacherData.avatarUrl || "",
            email: teacherData.email || "",
            phoneNumber: teacherData.phoneNumber || "",
            yearsExperience: teacherData.teacherInfo?.yearsExperience || 0,
            bio: teacherData.teacherInfo?.bio || "",
            credentials: credentials.map(cred => ({
              id: cred.credentialId,
              credentialTypeId: cred.credentialTypeId,
              pictureUrl: cred.pictureUrl,
              name: cred.name,
              level: cred.level
            }))
          });
          
          if (teacherData.avatarUrl) {
            setAvatarPreview(teacherData.avatarUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors({ submit: "Failed to load teacher data. Please try again." });
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      // Validate date is not in the future
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      } else {
        // Validate age is at least 18
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        
        // Calculate exact age considering month and day
        const exactAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
        
        if (exactAge < 18) {
          newErrors.dateOfBirth = "Teacher must be at least 18 years old";
        }
      }
    }

    // Validate email
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email";
      }
    }

    // Validate phone (optional)
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phoneRegex = /^[+]?\d{7,15}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      }
    }

    if (formData.yearsExperience < 0) {
      newErrors.yearsExperience = "Years of experience must be a positive number";
    } else if (formData.yearsExperience > 50) {
      newErrors.yearsExperience = "Years of experience seems unrealistic (max 50)";
    }

    // Validate CID if provided
    if (formData.cid && formData.cid.trim()) {
      const cidRegex = /^[0-9]{9,12}$/;
      if (!cidRegex.test(formData.cid.trim())) {
        newErrors.cid = "CID must be 9-12 digits";
      }
    }

    // Validate address if provided
    if (formData.address && formData.address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    // Validate credentials
    formData.credentials.forEach((cred, index) => {
      if (!cred.credentialTypeId) {
        newErrors[`credential_${index}_type`] = "Credential type is required";
      }
      if (!cred.name || !cred.name.trim()) {
        newErrors[`credential_${index}_name`] = "Credential name is required";
      } else if (cred.name.trim().length < 2) {
        newErrors[`credential_${index}_name`] = "Credential name must be at least 2 characters";
      }
      if (!cred.level || !cred.level.trim()) {
        newErrors[`credential_${index}_level`] = "Credential level is required";
      } else if (cred.level.trim().length < 2) {
        newErrors[`credential_${index}_level`] = "Credential level must be at least 2 characters";
      }
      if (cred.pictureUrl && cred.pictureUrl.trim()) {
        const urlRegex = /^https?:\/\//i;
        if (!urlRegex.test(cred.pictureUrl.trim())) {
          newErrors[`credential_${index}_pictureUrl`] = "Picture URL must start with http or https";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    // Calculate exact age considering month and day
    return monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
  };

  const handleInputChange = (field: keyof TeacherFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear existing error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Real-time validation for date of birth
    if (field === 'dateOfBirth' && typeof value === 'string') {
      const newErrors: Record<string, string> = {};
      
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        
        // Check if date is in the future
        if (birthDate > today) {
          newErrors.dateOfBirth = "Date of birth cannot be in the future";
        } else {
          // Check age requirement
          const age = calculateAge(value);
          if (age < 18) {
            newErrors.dateOfBirth = "Teacher must be at least 18 years old";
          }
        }
      }
      
      // Update errors for date of birth
      if (Object.keys(newErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...newErrors }));
      }
    }
  };

  const addCredential = () => {
    // Find certificate type ID to set as default
    const certificateType = credentialTypes.find(type => type.name === 'Certificate');
    const defaultCredentialTypeId = certificateType?.id || "";
    
    const newCredential: CredentialFormData = {
      id: Date.now().toString(),
      credentialTypeId: defaultCredentialTypeId,
      pictureUrl: null,
      name: "",
      level: ""
    };
    setFormData(prev => ({
      ...prev,
      credentials: [...prev.credentials, newCredential]
    }));
  };

  const updateCredential = (id: string, field: keyof CredentialFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: prev.credentials.map(cred =>
        cred.id === id ? { ...cred, [field]: value } : cred
      )
    }));
    
    // Clear error for this credential field when user starts typing
    const credentialIndex = formData.credentials.findIndex(cred => cred.id === id);
    if (credentialIndex !== -1) {
      const errorKey = `credential_${credentialIndex}_${field}`;
      if (errors[errorKey]) {
        setErrors(prev => ({ ...prev, [errorKey]: "" }));
      }
    }
  };

  const removeCredential = (id: string) => {
    const credential = formData.credentials.find(cred => cred.id === id);
    const credentialType = credentialTypes.find(type => type.id === credential?.credentialTypeId);
    const credentialName = credential?.name || credentialType?.name || 'this credential';
    
    setDeleteCredentialDialog({
      open: true,
      credentialId: id,
      credentialName: credentialName
    });
  };

  const confirmDeleteCredential = () => {
    if (deleteCredentialDialog.credentialId) {
      setFormData(prev => ({
        ...prev,
        credentials: prev.credentials.filter(cred => cred.id !== deleteCredentialDialog.credentialId)
      }));
      setDeleteCredentialDialog({ open: false, credentialId: null, credentialName: null });
    }
  };

  const performUpdate = async () => {
    if (!validateForm() || !teacher) {
      return;
    }

    setIsLoading(true);
    try {
      // Prepare teacher update data
      const updateData: UpdateTeacherProfile = {
        teacherCode: formData.teacherCode?.trim() || null,
        yearsExperience: formData.yearsExperience,
        fullName: formData.fullName.trim(),
        dateOfBirth: formData.dateOfBirth,
        cid: formData.cid?.trim() || null,
        address: formData.address?.trim() || null,
        avatarUrl: formData.avatarUrl?.trim() || null,
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber?.trim() || null,
        bio: formData.bio?.trim() || null,
        credentials:
          formData.credentials && formData.credentials.length > 0
            ? formData.credentials.map((cred) => ({
                ...(existingCredentialIds.has(cred.id) ? { credentialId: cred.id } : {}),
                credentialTypeId: cred.credentialTypeId,
                pictureUrl: cred.pictureUrl,
                name: cred.name,
                level: cred.level,
              }))
            : null,
      };
      
      // Update teacher profile using API
      const updatedTeacher = await updateTeacher(teacher.accountId, updateData);
      console.log("Teacher updated successfully:", updatedTeacher);
      
      // Handle credential updates with mock data
      await handleCredentialUpdates();
      
      // Show success message and navigate back
      console.log("Teacher and credentials updated successfully!");
      // You can replace this with a toast notification library like react-hot-toast
      // toast.success("Teacher updated successfully!");
      navigate(`/admin/teachers/${teacher.accountId}`, { state: { updateStatus: "success" } });
    } catch (error) {
      console.error("Error updating teacher:", error);
      setErrors({ submit: "Failed to update teacher. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    // Open confirm dialog first
    setIsConfirmUpdateOpen(true);
  };

  const handleCredentialUpdates = async () => {
    if (!teacher) return;

    try {
      // Get existing credentials from API
      const existingCredentials = await getListCredentialByTeacherId(teacher.accountId);
      
      // Mock credential update logic
      console.log("Existing credentials:", existingCredentials);
      console.log("New credentials to save:", formData.credentials);
      
      // Simulate credential operations
      const credentialsToAdd = formData.credentials.filter(cred => 
        !existingCredentials.some(existing => existing.credentialId === cred.id)
      );
      
      const credentialsToUpdate = formData.credentials.filter(cred => 
        existingCredentials.some(existing => existing.credentialId === cred.id)
      );
      
      const credentialsToDelete = existingCredentials.filter(existing => 
        !formData.credentials.some(cred => cred.id === existing.credentialId)
      );
      
      console.log("Credentials to add:", credentialsToAdd);
      console.log("Credentials to update:", credentialsToUpdate);
      console.log("Credentials to delete:", credentialsToDelete);
      
      // Mock API calls for credential operations
      if (credentialsToAdd.length > 0) {
        console.log("Mock: Adding new credentials...");
        // In real implementation, you would call addTeacherCredential API here
        // await Promise.all(credentialsToAdd.map(cred => addTeacherCredential(teacher.accountId, cred)));
      }
      
      if (credentialsToUpdate.length > 0) {
        console.log("Mock: Updating existing credentials...");
        // In real implementation, you would call updateTeacherCredential API here
        // await Promise.all(credentialsToUpdate.map(cred => updateTeacherCredential(cred.id, cred)));
      }
      
      if (credentialsToDelete.length > 0) {
        console.log("Mock: Deleting credentials...");
        // In real implementation, you would call deleteTeacherCredential API here
        // await Promise.all(credentialsToDelete.map(cred => deleteTeacherCredential(cred.credentialId)));
      }
      
      console.log("Mock credential operations completed successfully");
      
    } catch (error) {
      console.error("Error handling credential updates:", error);
      // Don't throw error here to prevent blocking teacher update
      console.log("Continuing with teacher update despite credential error");
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: "Please select an image file" }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: "File size must be less than 5MB" }));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatarUrl: result }));
        setErrors(prev => ({ ...prev, avatar: "" }));
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

  const handleCancel = () => {
    navigate("/admin/teachers");
  };

  if (isInitialLoading) {
    return (
      <div className="p-6 mx-auto w-full mt-16 lg:pl-70">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading teacher data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="p-6 mx-auto w-full mt-16 lg:pl-70">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Teacher not found</p>
            <Button onClick={handleCancel} className="mt-4">
              Back to Teachers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Teachers", to: "/admin/teachers" },
    { label: "Edit Teacher" }
  ];

  return (
    <div className="mt-16 p-4 md:p-8 lg:pl-0 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Page Header */}
      <PageHeader
        title="Edit Teacher"
        description="Update teacher information and credentials"
        icon={<User className="w-5 h-5 text-white" />}
        controls={[
          {
            type: 'button',
            label: 'Back to Teachers',
            variant: 'secondary',
            icon: <ArrowLeft className="w-4 h-4" />,
            onClick: handleCancel
          }
        ]}
      />

      {/* Main Form */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form Content */}
        <div className="xl:col-span-2 space-y-8">
          {/* Avatar Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-2xl border-4 border-dashed border-gray-200 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer hover:border-primary-300 hover:bg-gradient-to-br hover:from-primary-50 hover:to-primary-100 transition-all duration-300 group"
                  onClick={handleAvatarClick}
                >
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : formData.avatarUrl ? (
                    <img 
                      src={formData.avatarUrl} 
                      alt="Current avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400 group-hover:text-primary-400 transition-colors" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Upload Professional Photo</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose a high-quality, professional headshot. This will be visible to students and staff.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleAvatarClick}
                      variant="secondary"
                      size="sm"
                      iconLeft={<Upload className="w-4 h-4" />} 
                    >
                      Choose Photo
                    </Button>
                    {avatarPreview && (
                      <Button
                        onClick={removeAvatar}
                        variant="secondary"
                        size="sm"
                        iconLeft={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF • Max 5MB</p>
                  {/* Avatar URL input */}
                  <div className="mt-4">
                    <Input
                      label="Avatar URL"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.avatarUrl || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({ ...prev, avatarUrl: value }));
                        // simple URL validation (optional field)
                        if (value && !/^https?:\/\//i.test(value)) {
                          setErrors(prev => ({ ...prev, avatar: "Avatar URL must start with http or https" }));
                        } else {
                          setErrors(prev => ({ ...prev, avatar: "" }));
                          if (value) setAvatarPreview(value);
                        }
                      }}
                    />
                  </div>
                  {errors.avatar && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      {errors.avatar}
                    </div>
                  )}
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name *"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  error={errors.fullName}
                />
                <Input
                  label="Date of Birth *"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  error={errors.dateOfBirth}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Citizen ID (CID)"
                  placeholder="Enter citizen ID number"
                  value={formData.cid || ""}
                  onChange={(e) => handleInputChange('cid', e.target.value)}
                  error={errors.cid}
                />
                <Input
                  label="Home Address"
                  placeholder="Enter home address"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={errors.address}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email *"
                  type="email"
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                />
                <Input
                  label="Phone Number"
                  placeholder="e.g., +84123456789"
                  value={formData.phoneNumber || ""}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  error={errors.phoneNumber}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Teacher Code"
                    placeholder="Auto-generated by system"
                    value={formData.teacherCode || "Not assigned"}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This code is automatically generated and cannot be modified
                  </p>
                </div>
                <Input
                  label="Years of Experience *"
                  type="number"
                  placeholder="5"
                  value={formData.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                  error={errors.yearsExperience}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Professional Bio
                </label>
                <textarea
                  placeholder="Brief description of teaching experience, specializations, and achievements..."
                  value={formData.bio || ""}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Credentials & Qualifications</h3>
              </div>
              <Button
                onClick={addCredential}
                variant="secondary"
                iconLeft={<Plus className="w-4 h-4" />}
              >
                Add Credential
              </Button>
            </div>
            
            {/* Display existing credentials */}
            {/* {existingCredentials.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-4">Current Credentials</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {existingCredentials.map((cred) => {
                    const credentialType = credentialTypes.find(type => type.id === cred.credentialTypeId);
                    const isCertificate = credentialType?.name === 'Certificate';
                    const bgColor = isCertificate ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
                    const iconBg = isCertificate ? 'bg-blue-100' : 'bg-green-100';
                    const iconColor = isCertificate ? 'text-blue-600' : 'text-green-600';
                    
                    return (
                      <div key={cred.credentialId} className={`p-4 border rounded-lg ${bgColor} shadow-sm`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <GraduationCap className={`w-4 h-4 ${iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900 truncate">
                                {credentialType?.name || 'Unknown Type'}
                              </h5>
                              <span className="text-xs text-gray-500">
                                {new Date(cred.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {cred.name && (
                              <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">Name:</span> {cred.name}
                              </p>
                            )}
                            {cred.level && (
                              <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">Level:</span> {cred.level}
                              </p>
                            )}
                            {cred.pictureUrl && (
                              <div className="mt-2">
                                <img 
                                  src={cred.pictureUrl} 
                                  alt={cred.name || 'Credential'} 
                                  className="w-full h-32 object-cover rounded border"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )} */}

            <div className="space-y-4">
                {formData.credentials.map((cred, index) => {
                  const credentialType = credentialTypes.find(type => type.id === cred.credentialTypeId);
                  const isCertificate = credentialType?.name === 'Certificate';
                  const bgColor = isCertificate ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
                  const iconBg = isCertificate ? 'bg-blue-100' : 'bg-green-100';
                  const iconColor = isCertificate ? 'text-blue-600' : 'text-green-600';
                  const IconComponent = GraduationCap;
                  
                  return (
                    <div key={cred.id} className={`p-6 border rounded-lg space-y-4 ${bgColor} shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 ${iconColor}`} />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">
                              {credentialType?.name || 'Credential'} {index + 1}
                            </span>
                            <p className="text-sm text-gray-500">
                              {credentialType?.name || 'Professional credential'}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeCredential(cred.id)}
                          variant="secondary"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Select
                          label="Credential Type *"
                          value={cred.credentialTypeId}
                          onChange={(e) => updateCredential(cred.id, 'credentialTypeId', e.target.value)}
                          options={credentialTypes.map(type => ({ label: type.name, value: type.id }))}
                        />
                        {errors[`credential_${index}_type`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`credential_${index}_type`]}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          label="Name *"
                          placeholder="e.g., IELTS Certificate"
                          value={cred.name || ""}
                          onChange={(e) => updateCredential(cred.id, 'name', e.target.value)}
                          error={errors[`credential_${index}_name`]}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Input
                          label="Level *"
                          placeholder="e.g., Advanced"
                          value={cred.level || ""}
                          onChange={(e) => updateCredential(cred.id, 'level', e.target.value)}
                          error={errors[`credential_${index}_level`]}
                        />
                      </div>
                      <div>
                        <Input
                          label="Picture URL"
                          placeholder="e.g., https://example.com/certificate.jpg"
                          value={cred.pictureUrl || ""}
                          onChange={(e) => updateCredential(cred.id, 'pictureUrl', e.target.value)}
                          error={errors[`credential_${index}_pictureUrl`]}
                        />
                      </div>
                    </div>
                  </div>
                  );
                })}
                
              {formData.credentials.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-dashed border-amber-200">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No credentials added yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Add professional certificates, degrees, and qualifications</p>
                  <Button
                    onClick={addCredential}
                    variant="secondary"
                    iconLeft={<Plus className="w-4 h-4" />}
                  >
                    Add First Credential
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Profile Photo</span>
                <div className="flex items-center gap-2">
                  {formData.avatarUrl || avatarPreview ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Added</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Optional</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Basic Info</span>
                <div className="flex items-center gap-2">
                  {formData.fullName && formData.dateOfBirth ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Complete</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-500">Required</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Professional Info</span>
                <div className="flex items-center gap-2">
                  {formData.yearsExperience >= 0 ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Complete</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-red-500">Required</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Credentials</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{formData.credentials.length} added</span>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  {errors.submit}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            All fields marked with * are required
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCancel}
              variant="secondary"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="min-w-[160px] bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Update Teacher
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Credential Confirmation Dialog */}
      {/* <ConfirmationDialog
        isOpen={deleteCredentialDialog.open}
        onClose={() => setDeleteCredentialDialog({ open: false, credentialId: null, credentialName: null })}
        onConfirm={confirmDeleteCredential}
        title="Delete Credential"
        message={`Are you sure you want to delete "${deleteCredentialDialog.credentialName}"? This action cannot be undone.`}

        type="danger"
      /> */}
<DeleteConfirmDialog
  open={deleteCredentialDialog.open}
  onOpenChange={(open: boolean) =>
    setDeleteCredentialDialog({
      open,
      credentialId: null,
      credentialName: null,
    })
  }
  onConfirm={confirmDeleteCredential}
  title="Delete Credential"
  message={
    deleteCredentialDialog.credentialName
      ? `Are you sure you want to delete "${deleteCredentialDialog.credentialName}"? This action cannot be undone.`
      : "Are you sure you want to delete this credential? This action cannot be undone."
  }
/>

      {/* Confirm Update Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmUpdateOpen}
        onClose={() => setIsConfirmUpdateOpen(false)}
        onConfirm={() => {
          setIsConfirmUpdateOpen(false);
          void performUpdate();
        }}
        title="Confirm Update"
        message="Are you sure you want to update this teacher's information?"
        confirmText="Yes, update"
        cancelText="No, cancel"
        type="warning"
      />
    </div>
  );
}
