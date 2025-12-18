import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import { 
  Edit, User, UserX, Calendar, Clock, Mail, Phone, MapPin, IdCard, 
  Activity, Save, X, Camera
} from "lucide-react";
import { formatDate, getStatusColor, getStatusDisplay } from "@/helper/helper.service";
import { getStaffById, updateStaffProfile, uploadAvatar } from "@/api/staff.api";
import { checkEmailExist, checkPhoneExist, checkCIDExist } from "@/api/account.api";
import { getUserInfo, setUserInfo } from "@/lib/utils";
import type { Account } from "@/types/account.type";
import type { UpdateStaffProfile } from "@/types/staff.type";

export default function AdminProfilePage() {
  const userInfo = getUserInfo();
  const id = userInfo?.id || null;
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateStaffProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emailCheckTimerRef = useRef<number | null>(null);
  const phoneCheckTimerRef = useRef<number | null>(null);
  const cidCheckTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const preloaded = (location.state as any)?.preloadedAccount;
    const fromSuccess = (location.state as any)?.updateStatus === "success";

    if (preloaded) {
      setAccount(preloaded);
      setLoading(false);
    }

    if (fromSuccess) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      navigate(location.pathname, { replace: true, state: {} });
      if (id) {
        void (async () => {
          try {
            const fresh = await getStaffById(id);
            setAccount(fresh);
          } catch (err) {
            console.error("Background refresh account failed:", err);
          }
        })();
      }
      return () => clearTimeout(timer);
    }

    const fetchAccount = async () => {
      if (!id) {
        setError("Account ID is required");
        setLoading(false);
        return;
      }

      try {
        if (!preloaded) setLoading(true);
        setError(null);
        const accountData = await getStaffById(id);
        setAccount(accountData);
      } catch (err) {
        console.error("Error fetching account:", err);
        setError(`Failed to load account data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        if (!preloaded) setLoading(false);
      }
    };

    if (!fromSuccess) {
      fetchAccount();
    }
  }, [id]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimerRef.current) window.clearTimeout(emailCheckTimerRef.current);
      if (phoneCheckTimerRef.current) window.clearTimeout(phoneCheckTimerRef.current);
      if (cidCheckTimerRef.current) window.clearTimeout(cidCheckTimerRef.current);
    };
  }, []);

  const handleEdit = () => {
    if (!account || !id) return;
    
    const initialEditData: UpdateStaffProfile = {
      fullName: account.fullName || null,
      email: account.email || "",
      phoneNumber: account.phoneNumber || null,
      cid: account.cid || null, // CID is now stored as plain text
      address: account.address || null,
      dateOfBirth: account.dateOfBirth || null,
      avatarUrl: account.avatarUrl || null,
    };
    
    setEditData(initialEditData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(null);
    setErrors({});
    setAvatarPreview(null);
    setAvatarFile(null);
    // Clear timers
    if (emailCheckTimerRef.current) {
      window.clearTimeout(emailCheckTimerRef.current);
      emailCheckTimerRef.current = null;
    }
    if (phoneCheckTimerRef.current) {
      window.clearTimeout(phoneCheckTimerRef.current);
      phoneCheckTimerRef.current = null;
    }
    if (cidCheckTimerRef.current) {
      window.clearTimeout(cidCheckTimerRef.current);
      cidCheckTimerRef.current = null;
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage("Please select an image file");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const validateFullName = (fullName: string | null): string => {
    if (!fullName || fullName.trim() === "") return "Full name is required";
    const trimmed = fullName.trim();
    if (trimmed.length < 2) return "Full name must be at least 2 characters";
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email || email.trim() === "") return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone: string | null): string => {
    if (!phone || phone.trim() === "") return "Phone number is required";
    const phoneRegex = /^0\d{9,10}$/;
    if (!phoneRegex.test(phone)) return "Phone number must start with 0 and have 10 or 11 digits";
    return "";
  };

  const validateDateOfBirth = (dateOfBirth: string | null): string => {
    if (!dateOfBirth || dateOfBirth.trim() === "") return "Date of birth is required";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    if (birthDate > today) return "Date of birth cannot be in the future";
    
    // Check if user is at least 18 years old
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge = age - 1;
    }
    
    if (actualAge < 18) {
      return "You must be at least 18 years old";
    }
    
    return "";
  };

  const validateCID = (cid: string | null): string => {
    if (!cid || cid.trim() === "") return "CID is required";
    const cidRegex = /^\d{12}$/;
    if (!cidRegex.test(cid)) return "CID must be exactly 12 digits";
    return "";
  };

  const handleFieldChange = (field: keyof UpdateStaffProfile, value: string | null) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
    
    let error = "";
    switch (field) {
      case "fullName":
        error = validateFullName(value);
        break;
      case "email": {
        const emailValue = (value || "").trim().toLowerCase();
        error = validateEmail(emailValue);
        // Check uniqueness if email changed and passes basic validation
        const originalEmail = (account?.email || "").trim().toLowerCase();
        if (!error && account && emailValue !== originalEmail) {
          // Clear previous timer
          if (emailCheckTimerRef.current) window.clearTimeout(emailCheckTimerRef.current);
          // Debounce the API call
          const timer = window.setTimeout(async () => {
            try {
              const emailExists = await checkEmailExist(emailValue);
              // checkEmailExist returns true if email EXISTS in database (including 404), false if email is UNIQUE
              if (emailExists) {
                setErrors((prev) => ({ ...prev, email: "Email already exists" }));
              } else {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.email;
                  return newErrors;
                });
              }
            } catch (err: any) {
              console.error("Error checking email uniqueness:", err);
              // If 404, email EXISTS
              if (err?.response?.status === 404) {
                setErrors((prev) => ({ ...prev, email: "Email already exists" }));
              }
            }
          }, 500);
          emailCheckTimerRef.current = timer as unknown as number;
        } else if (!error && account && emailValue === originalEmail) {
          // Email unchanged, clear any uniqueness error
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
        break;
      }
      case "phoneNumber": {
        const phoneValue = (value || "").trim();
        error = validatePhone(phoneValue);
        // Check uniqueness if phone changed and passes basic validation
        const originalPhone = (account?.phoneNumber || "").trim();
        if (!error && account && phoneValue !== originalPhone) {
          // Clear previous timer
          if (phoneCheckTimerRef.current) window.clearTimeout(phoneCheckTimerRef.current);
          // Debounce the API call
          const timer = window.setTimeout(async () => {
            try {
              const phoneExists = await checkPhoneExist(phoneValue);
              // checkPhoneExist returns true if phone EXISTS in database (including 404), false if phone is UNIQUE
              if (phoneExists) {
                setErrors((prev) => ({ ...prev, phoneNumber: "Phone number already exists" }));
              } else {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.phoneNumber;
                  return newErrors;
                });
              }
            } catch (err: any) {
              console.error("Error checking phone uniqueness:", err);
              // If 404, phone EXISTS
              if (err?.response?.status === 404) {
                setErrors((prev) => ({ ...prev, phoneNumber: "Phone number already exists" }));
              }
            }
          }, 500);
          phoneCheckTimerRef.current = timer as unknown as number;
        } else if (!error && account && phoneValue === originalPhone) {
          // Phone unchanged, clear any uniqueness error
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.phoneNumber;
            return newErrors;
          });
        }
        break;
      }
      case "dateOfBirth":
        error = validateDateOfBirth(value);
        break;
      case "cid": {
        const cidValue = (value || "").replace(/\D/g, '');
        error = validateCID(cidValue);
        // Check uniqueness if CID changed and passes basic validation
        const originalCID = (account?.cid || "").replace(/\D/g, '');
        if (!error && account && cidValue !== originalCID) {
          // Clear previous timer
          if (cidCheckTimerRef.current) window.clearTimeout(cidCheckTimerRef.current);
          // Debounce the API call
          const timer = window.setTimeout(async () => {
            try {
              const cidExists = await checkCIDExist(cidValue);
              // checkCIDExist returns true if CID EXISTS in database (including 404), false if CID is UNIQUE
              if (cidExists) {
                setErrors((prev) => ({ ...prev, cid: "CID already exists" }));
              } else {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.cid;
                  return newErrors;
                });
              }
            } catch (err: any) {
              console.error("Error checking CID uniqueness:", err);
              // If 404, CID EXISTS
              if (err?.response?.status === 404) {
                setErrors((prev) => ({ ...prev, cid: "CID already exists" }));
              }
            }
          }, 500);
          cidCheckTimerRef.current = timer as unknown as number;
        } else if (!error && account && cidValue === originalCID) {
          // CID unchanged, clear any uniqueness error
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.cid;
            return newErrors;
          });
        }
        break;
      }
      default:
        break;
    }
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else if (!error && (field !== "email" && field !== "phoneNumber")) {
        // For email and phone, uniqueness check is handled separately
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const validateAllFields = (): boolean => {
    if (!editData) return false;
    
    const newErrors: Record<string, string> = {};
    
    const fullNameError = validateFullName(editData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;
    
    const emailError = validateEmail(editData.email || "");
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validatePhone(editData.phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;
    
    const dobError = validateDateOfBirth(editData.dateOfBirth);
    if (dobError) newErrors.dateOfBirth = dobError;
    
    const cidError = validateCID(editData.cid);
    if (cidError) newErrors.cid = cidError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!id || !editData || !account) return;

    if (!validateAllFields()) {
      return;
    }

    // Final uniqueness checks if email or phone changed
    try {
      const emailValue = (editData.email || "").trim().toLowerCase();
      const originalEmail = (account.email || "").trim().toLowerCase();
      if (emailValue && emailValue !== originalEmail) {
        try {
          const emailExists = await checkEmailExist(emailValue);
          // checkEmailExist returns true if email EXISTS in database (including 404), false if email is UNIQUE
          if (emailExists) {
            setErrors((prev) => ({ ...prev, email: "Email already exists" }));
            return;
          }
        } catch (err: any) {
          // If 404, email EXISTS
          if (err?.response?.status === 404) {
            setErrors((prev) => ({ ...prev, email: "Email already exists" }));
            return;
          }
          console.error("Error checking email uniqueness:", err);
        }
      }
      const phoneValue = (editData.phoneNumber || "").trim();
      const originalPhone = (account.phoneNumber || "").trim();
      if (phoneValue && phoneValue !== originalPhone) {
        try {
          const phoneExists = await checkPhoneExist(phoneValue);
          // checkPhoneExist returns true if phone EXISTS in database (including 404), false if phone is UNIQUE
          if (phoneExists) {
            setErrors((prev) => ({ ...prev, phoneNumber: "Phone number already exists" }));
            return;
          }
        } catch (err: any) {
          // If 404, phone EXISTS
          if (err?.response?.status === 404) {
            setErrors((prev) => ({ ...prev, phoneNumber: "Phone number already exists" }));
            return;
          }
          console.error("Error checking phone uniqueness:", err);
        }
      }
    } catch (error) {
      console.error("Error checking uniqueness:", error);
      // Continue with save, server will enforce uniqueness
    }

    setSaving(true);
    try {
      // Upload avatar if avatarFile exists
      if (avatarFile) {
        const avatarUrlPublic = await uploadAvatar(avatarFile);
        editData.avatarUrl = avatarUrlPublic || null;
      }

      await updateStaffProfile(id, editData);
      
      const updatedAccount = await getStaffById(id);
      setAccount(updatedAccount);
      setIsEditing(false);
      setEditData(null);
      setErrors({});
      setAvatarPreview(null);
      setAvatarFile(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);

      setUserInfo({
        avatarUrl: updatedAccount.avatarUrl
          ? `${updatedAccount.avatarUrl}${updatedAccount.avatarUrl.includes('?') ? '&' : '?'}v=${Date.now()}`
          : undefined,
        fullName: updatedAccount.fullName,
        email: updatedAccount.email,
      } as any);
    } catch (error) {
      console.error("Error updating account:", error);
      setErrorMessage("Failed to update account information. Please try again.");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 mx-auto mt-16 lg:pl-70">
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="p-6 mx-auto mt-16 lg:pl-70">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Account</h3>
          <p className="text-gray-500 mb-4">{error || "Account not found"}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:p-6 mt-14">
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-green-200 bg-green-50 text-green-800 shadow-lg min-w-[280px]">
            <div className="w-6 h-6 mt-0.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Update Successful</p>
              <p className="text-sm">Profile updated successfully.</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-2 text-green-700 hover:text-green-900"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {showErrorToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 shadow-lg min-w-[280px]">
            <div className="w-6 h-6 mt-0.5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <UserX className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Error</p>
              <p className="text-sm">{errorMessage || "An error occurred. Please try again."}</p>
            </div>
            <button
              onClick={() => setShowErrorToast(false)}
              className="ml-2 text-red-700 hover:text-red-900"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex items-center justify-between mt-3">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  variant="secondary" 
                  size="sm" 
                  disabled={saving || Object.values(errors).some(err => err !== "")}
                >
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-1" />
                    {saving ? "Saving..." : "Save"}
                  </div>
                </Button>
                <Button onClick={handleCancel} variant="danger" size="sm" disabled={saving}>
                  <div className="flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </div>
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} variant="secondary" size="sm">
                <div className="flex items-center">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit Profile
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <div className="text-center py-4">
              <div className="relative w-50 h-50 mx-auto mb-3 group">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md hover:shadow-lg transition-all duration-300">
                  {avatarPreview || account.avatarUrl ? (
                    <img 
                      src={avatarPreview || account.avatarUrl || ""} 
                      alt={account.fullName}
                      className="w-full h-full object-cover transition-transform duration-300"
                    />
                  ) : (
                    <User className="w-10 h-10 text-indigo-600 transition-colors" />
                  )}
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                      ref={fileInputRef}
                      disabled={saving}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-md border-2 border-white"
                      title="Change avatar"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </label>
                  </>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{account.fullName}</h2>
              <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusColor(account.accountStatusID ?? "")}`}>
                  <Activity className="w-3 h-3 mr-1" />
                  {getStatusDisplay(account.accountStatusID ?? "")}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Full Name {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="w-full">
                      <Input
                        type="text"
                        value={editData?.fullName || ""}
                        onChange={(e) => handleFieldChange("fullName", e.target.value || null)}
                        className={`text-sm ${errors.fullName ? "border-red-500" : ""}`}
                        placeholder="Enter full name"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{account.fullName || "N/A"}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Email {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="w-full">
                      <Input
                        type="email"
                        value={editData?.email || ""}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        className={`text-sm ${errors.email ? "border-red-500" : ""}`}
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium truncate hover:text-blue-600 transition-colors cursor-pointer" 
                       onClick={() => window.open(`mailto:${account.email}`)}
                       title={account.email || undefined}>
                      {account.email || "N/A"}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Phone {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="w-full">
                      <Input
                        type="tel"
                        value={editData?.phoneNumber || ""}
                        onChange={(e) => handleFieldChange("phoneNumber", e.target.value || null)}
                        className={`text-sm ${errors.phoneNumber ? "border-red-500" : ""}`}
                        placeholder="Enter phone number (e.g., 0123456789)"
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium hover:text-green-600 transition-colors cursor-pointer" 
                       onClick={() => account.phoneNumber && window.open(`tel:${account.phoneNumber}`)}>
                      {account.phoneNumber || "N/A"}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Date of Birth {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="w-full">
                      <Input
                        type="date"
                        value={editData?.dateOfBirth ? editData.dateOfBirth.split('T')[0] : ""}
                        onChange={(e) => handleFieldChange("dateOfBirth", e.target.value || null)}
                        className={`text-sm ${errors.dateOfBirth ? "border-red-500" : ""}`}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      />
                      {errors.dateOfBirth && (
                        <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{formatDate(account.dateOfBirth) || "N/A"}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Account Created</label>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(account.createdAt) || "N/A"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editData?.address || ""}
                      onChange={(e) => handleFieldChange("address", e.target.value || null)}
                      className="text-sm"
                      placeholder="Enter address (optional)"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 font-medium">{account.address || "N/A"}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IdCard className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    CID {isEditing && <span className="text-red-500">*</span>}
                  </label>
                  {isEditing ? (
                    <div className="w-full">
                      <Input
                        type="text"
                        value={editData?.cid || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          handleFieldChange("cid", value || null);
                        }}
                        className={`text-sm font-mono ${errors.cid ? "border-red-500" : ""}`}
                        placeholder="Enter 12-digit CID"
                        maxLength={12}
                      />
                      {errors.cid && (
                        <p className="mt-1 text-xs text-red-600">{errors.cid}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900 font-medium font-mono">{account.cid || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>
            {isEditing && (
              <p className="text-xs text-gray-500 mt-2" style={{color: "#ff0000"}}>
                <span className="text-red-700">*</span> is required fields
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

