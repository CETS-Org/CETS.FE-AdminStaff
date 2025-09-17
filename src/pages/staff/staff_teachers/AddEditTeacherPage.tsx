import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ChevronRight, Plus, Trash2, GraduationCap, ArrowLeft, Upload, User, Camera, Save } from "lucide-react";
import { createTeacher, getTeacherById,getListCredentialType  } from "@/api/teacher.api";
import type { AddTeacherProfile, CredentialTypeResponse } from "@/types/teacher.type";

interface CredentialFormData {
  id: string;
  credentialTypeId: string;
  pictureUrl: string | null;
  name: string | null;
  level: string | null;
}


interface TeacherFormData {
  email: string;
  phoneNumber: string;
  fullName: string;
  dateOfBirth: string;
  cid: string;
  address: string | null;
  avatarUrl: string | null;
  yearsExperience: number;
  bio: string | null;
  credentials: CredentialFormData[];
}


export default function AddEditTeacherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<TeacherFormData>({
    email: "",
    phoneNumber: "",
    fullName: "",
    dateOfBirth: "",
    cid: "",
    address: "",
    avatarUrl: "",
    yearsExperience: 0,
    bio: "",
    credentials: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [credentialTypes, setCredentialTypes] = useState<CredentialTypeResponse[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch credential types when component mounts
  useEffect(() => {
    const fetchCredentialTypes = async () => {
      try {
        const types = await getListCredentialType();
        setCredentialTypes(types);
      } catch (error) {
        console.error('Error fetching credential types:', error);
      }
    };

    fetchCredentialTypes();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      // Load teacher data for editing
      loadTeacherData(id);
    } else {
      // Set default values for new teacher
      setFormData({
        email: "",
        phoneNumber: "",
        fullName: "",
        dateOfBirth: "",
        cid: "",
        address: "",
        avatarUrl: "",
        yearsExperience: 0,
        bio: "",
        credentials: []
      });
    }
  }, [id, isEdit]);

  const loadTeacherData = async (teacherId: string) => {
    setIsLoading(true);
    try {
      const teacher = await getTeacherById(teacherId);
      
      setFormData({
        email: teacher.email || "",
        phoneNumber: teacher.phoneNumber || "",
        fullName: teacher.fullName || "",
        dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.split('T')[0] : "",
        cid: teacher.cid || "",
        address: teacher.address || "",
        avatarUrl: teacher.avatarUrl || "",
        yearsExperience: teacher.teacherInfo?.yearsExperience || 0,
        bio: teacher.teacherInfo?.bio || "",
        credentials: teacher.teacherInfo?.teacherCredentials?.map(cred => ({
          id: cred.credentialId,
          credentialTypeId: cred.credentialTypeId,
          pictureUrl: cred.pictureUrl,
          name: cred.name,
          level: cred.level
        })) || []
      });
      
      if (teacher.avatarUrl) {
        setAvatarPreview(teacher.avatarUrl);
      }
    } catch (error) {
      console.error("Error loading teacher data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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

    if (formData.yearsExperience < 0) {
      newErrors.yearsExperience = "Years of experience must be a positive number";
    }

    // Validate credentials
    formData.credentials.forEach((cred, index) => {
      if (!cred.credentialTypeId) {
        newErrors[`credential_${index}_type`] = "Credential type is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TeacherFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addCredential = () => {
    const newCredential: CredentialFormData = {
      id: Date.now().toString(),
      credentialTypeId: "",
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
  };

  const removeCredential = (id: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: prev.credentials.filter(cred => cred.id !== id)
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const teacherData: AddTeacherProfile = {
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        cid: formData.cid,
        address: formData.address,
        avatarUrl: formData.avatarUrl,
        yearsExperience: formData.yearsExperience,
        bio: formData.bio,
        credentials: formData.credentials.filter(cred => cred.credentialTypeId).map(cred => ({
          credentialTypeId: cred.credentialTypeId,
          pictureUrl: cred.pictureUrl,
          name: cred.name,
          level: cred.level
        }))
      };
      
      await createTeacher(teacherData);
      
      // Navigate back to teachers list
      navigate("/teachers");
    } catch (error) {
      console.error("Error saving teacher:", error);
      // You can add more specific error handling here
      setErrors({ submit: "Failed to save teacher. Please try again." });
    } finally {
      setIsLoading(false);
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
    navigate("/teachers");
  };

  if (isLoading && isEdit) {
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

  return (
    <div className="p-6 w-full mt-16 lg:pl-0">
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">Dashboard</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/teachers" className="hover:text-gray-900">Teachers</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">
              {isEdit ? "Edit Teacher" : "Add New Teacher"}
            </span>
          </div>
          <Button
            onClick={handleCancel}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Teachers
            </div>          
          </Button>
        </div>
      </div>

      <div className=" mx-auto">
        <Card title={isEdit ? "Edit Teacher Information" : "Add New Teacher"}>
          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Profile Photo</h3>
              <div className="flex items-center gap-6">
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
                    ) : formData.avatarUrl ? (
                      <img 
                        src={formData.avatarUrl} 
                        alt="Current avatar" 
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
                    {errors.avatar && (
                      <p className="text-sm text-red-600 mt-2">{errors.avatar}</p>
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
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name *"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  error={errors.fullName}
                />
                <Input
                  label="Email *"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Phone Number *"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  error={errors.phoneNumber}
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
                  label="CID *"
                  placeholder="Enter CID"
                  value={formData.cid}
                  onChange={(e) => handleInputChange('cid', e.target.value)}
                  error={errors.cid}
                />
                <Input
                  label="Address"
                  placeholder="Enter address"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Years of Experience *"
                  type="number"
                  placeholder="Enter years of experience"
                  value={formData.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', parseInt(e.target.value) || 0)}
                  error={errors.yearsExperience}
                />
                <Input
                  label="Bio"
                  placeholder="Enter bio"
                  value={formData.bio || ""}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
              </div>
            </div>

            {/* Credentials */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Credentials</h3>
                <Button
                  onClick={addCredential}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Credential
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.credentials.map((cred, index) => {
                  const credentialType = credentialTypes.find(type => type.id === cred.credentialTypeId);
                  const isCertificate = credentialType?.name === 'Certificate';
                  const bgColor = isCertificate ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
                  const iconBg = isCertificate ? 'bg-blue-100' : 'bg-green-100';
                  const iconColor = isCertificate ? 'text-blue-600' : 'text-green-600';
                  const IconComponent = isCertificate ? GraduationCap : GraduationCap; // You can use different icons
                  
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
                      <Input
                        label="Name"
                        placeholder="e.g., IELTS Certificate"
                        value={cred.name || ""}
                        onChange={(e) => updateCredential(cred.id, 'name', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Level"
                        placeholder="e.g., Advanced"
                        value={cred.level || ""}
                        onChange={(e) => updateCredential(cred.id, 'level', e.target.value)}
                      />
                      <Input
                        label="Picture URL"
                        placeholder="e.g., https://example.com/certificate.jpg"
                        value={cred.pictureUrl || ""}
                        onChange={(e) => updateCredential(cred.id, 'pictureUrl', e.target.value)}
                      />
                    </div>
                  </div>
                  );
                })}
                
                {formData.credentials.length === 0 && (
                  <div className="text-center py-16 text-gray-500 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No credentials added yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Add your professional certificates and qualifications</p>
                    <Button
                      onClick={addCredential}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Credential
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4 pt-8 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-6">
              <div className="text-sm text-gray-500">
                {isEdit ? "Last updated: Today" : "All fields marked with * are required"}
                {errors.submit && (
                  <div className="text-red-600 mt-2">{errors.submit}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  disabled={isLoading}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="min-w-[140px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEdit ? "Updating..." : "Adding..."}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2"><Save className="w-4 h-4" /> {isEdit ? "Update Teacher" : "Add Teacher"}</p> 
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
