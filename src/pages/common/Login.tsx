import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, FormInput } from "@/components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import AccountVerificationDialog from "../../components/ui/AccountVerificationDialog";
import { Eye, EyeOff, CheckCircle, AlertCircle, BookOpen, Shield, Calculator } from "lucide-react";
import { api } from "@/api";
import { resendVerificationEmail } from "@/api/account.api";
import "../../styles/login-animations.css";
import GenericNavbar from "../../shared/GenericNavbar";
import { createGuestNavbarConfig } from "../../shared/navbarConfigs";

// Role options for AdminStaff
const adminRoles = [
  {
    value: "admin",
    label: "Admin",
    description: "System administration and oversight",
    icon: Shield,
    color: "red"
  },
  {
    value: "academicStaff", 
    label: "Academic Staff",
    description: "Academic management and support",
    icon: BookOpen,
    color: "blue"
  }
];

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  role: z
    .string()
    .min(1, "Please select a role"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// API response types
interface LoginResponse {
  message: string;
  token: string;
  account: {
    id: string;
    email: string;
    fullName: string;
    roleNames: string[];
    isVerified?: boolean;
    studentInfo?: any;
    teacherInfo?: any;
    staffInfo?: {
      dateOfBirth: string;
      cid: string | null;
      address: string | null;
      avatarUrl: string | null;
      accountStatusID: string;
      createdAt: string;
      updatedAt: string | null;
      updatedBy: string | null;
      isDeleted: boolean;
      statusName: string;
    };
  };
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState("admin");
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [unverifiedUserEmail, setUnverifiedUserEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: selectedRole,
    },
  });

  // Load remember me preference and handle URL errors
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    const savedEmail = localStorage.getItem('rememberedEmail');
    
    if (savedRememberMe && savedEmail) {
      setRememberMe(true);
      methods.setValue('email', savedEmail);
    }

    // Handle error from URL state
    if (location.state?.error) {
      setErrorMessage(location.state.error);
    }

  }, [location.state, methods]);

  // Update form when role changes
  useEffect(() => {
    methods.setValue('role', selectedRole);
  }, [selectedRole, methods]);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    methods.setValue('role', role);
  };

  const callLoginAPI = async (data: LoginFormData): Promise<LoginResponse> => {
    const { email, password, role } = data;
    const credentials = { email, password };
    
    console.log("Request payload:", credentials); // Debug log

    try {
      let response;
      
      // Call appropriate API method based on role
      switch (role) {
        case "academicStaff":
          response = await api.loginAcademicStaff(credentials);
          break;
        case "accountantStaff":
          response = await api.loginAccountantStaff(credentials);
          break;
        case "admin":
          response = await api.loginAdmin(credentials);
          break;
        default:
          throw new Error("Invalid role selected");
      }

      console.log("Response status:", response.status); // Debug log
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          throw new Error("Wrong email or password");
        }
        const errorMessage = error.response.data?.message || `HTTP error! status: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error("Network error. Please check your connection.");
      } else {
        // Something else happened
        throw error;
      }
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      console.log("Login data:", data);
      
      const response = await callLoginAPI(data);
      
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }
      
      // Check if account is verified
      const isVerified = response.account.isVerified ?? true;
      if (!isVerified) {
        setUnverifiedUserEmail(response.account.email || "");
        setShowVerificationDialog(true);
        return;
      }
      
      // Store token and user info in localStorage
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("userInfo", JSON.stringify(response.account));
      
      // Navigate based on role
      const userRole = response.account.roleNames?.[0];
      
      if (userRole === "AcademicStaff") {
        navigate("/staff/classes");
      } else if (userRole === "AccountantStaff") {
        navigate("/staff/classes");
      } else if (userRole === "Admin") {
        navigate("/admin/analytics");
      } else {
        // Default fallback for unknown roles
        console.warn("Unknown role:", userRole, "redirecting to staff home");
        navigate("/staff/home");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      
      
      setErrorMessage(error instanceof Error ? error.message : "Login failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const currentRole = adminRoles.find(role => role.value === selectedRole);

  // Verification dialog functions
  const handleResendVerificationEmail = async () => {
    try {
      await resendVerificationEmail(unverifiedUserEmail);
      console.log("Verification email resent successfully to:", unverifiedUserEmail);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      throw error;
    }
  };

  const handleContactAdmin = () => {
    // Open email client or contact form
    window.location.href = `mailto:admin@cets.com?subject=Account Verification Issue&body=I'm having trouble verifying my account: ${unverifiedUserEmail}`;
  };

  const handleCloseVerificationDialog = () => {
    setShowVerificationDialog(false);
    setUnverifiedUserEmail("");
  };

  return (
    <div className="login-container min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      {/* Guest Navbar */}
      <GenericNavbar config={createGuestNavbarConfig()} fullWidth={true} />
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-accent-100 to-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-reverse"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-gradient-to-r from-secondary-100 to-accent-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-300 rounded-full animate-particle-1"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-accent-400 rounded-full animate-particle-2"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-secondary-300 rounded-full animate-particle-3"></div>
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-primary-400 rounded-full animate-particle-4"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-accent-300 rounded-full animate-particle-5"></div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-md space-y-4 animate-fade-in-up">
          <Card className="login-card shadow-2xl border-0 backdrop-blur-sm bg-white/95 transform transition-all duration-300 mt-2 hover:shadow-3xl sm:p-8 p-6">
            {/* Header */}
            <div className="text-center mb-6 animate-slide-in-left">
              <div className="login-header-icon mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform transition-transform duration-300 hover:scale-110 animate-float">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="login-title text-3xl sm:text-3xl font-bold text-neutral-900 mb-2">Admin Portal</h1>
              <p className="text-neutral-600 mb-4">
                Welcome back! Please sign in as {currentRole?.label.toLowerCase()}
              </p>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                currentRole?.color === 'red' 
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : currentRole?.color === 'blue'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : currentRole?.color === 'green'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-primary-50 text-primary-700 border-primary-200'
              }`}>
                {currentRole && <currentRole.icon className="w-4 h-4" />}
                {currentRole?.label} Login
              </div>
            </div>

            {/* Role Selection Tabs */}
            <div className="space-y-2 animate-slide-in-right animation-delay-200 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700 text-center block">Choose Your Role</label>
                <div className="grid grid-cols-1 gap-2">
                  {adminRoles.map((role) => {
                    const IconComponent = role.icon;
                    const isSelected = selectedRole === role.value;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleRoleChange(role.value)}
                        className={`
                          role-tab relative px-4 py-2.5 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2
                          ${isSelected 
                            ? `role-tab-selected ${
                                role.color === 'red' 
                                  ? 'role-tab-admin-selected border-red-500 bg-red-50 text-red-700 shadow-md ring-2 ring-red-200' 
                                  : role.color === 'blue'
                                    ? 'role-tab-academic-selected border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-200'
                                    : 'role-tab-accountant-selected border-green-500 bg-green-50 text-green-700 shadow-md ring-2 ring-green-200'
                              }`
                            : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:shadow-sm'
                          }
                        `}
                        aria-pressed={isSelected}
                        aria-label={`Select ${role.label} role`}
                      >
                        {/* Selection indicator */}
                        {isSelected && (
                          <div className={`role-checkmark absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                            role.color === 'red' ? 'bg-red-500' : role.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                          } animate-pulse-gentle`}>
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-2 rounded-md transition-all duration-300 ${
                            isSelected 
                              ? role.color === 'red' ? 'bg-red-100' : role.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
                              : 'bg-neutral-100'
                          }`}>
                            <IconComponent className={`w-5 h-5 transition-all duration-300 ${
                              isSelected 
                                ? `role-icon-pulse ${
                                    role.color === 'red' ? 'text-red-600' : role.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                                  }`
                                : 'text-neutral-500'
                            }`} />
                          </div>
                          <div className="text-left flex-1">
                            <p className={`font-medium text-sm transition-colors duration-300 ${
                              isSelected ? 'text-current' : 'text-neutral-700'
                            }`}>
                              {role.label}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>



            {/* Form */}
            <Form methods={methods} onSubmit={onSubmit} className="login-form-spacing space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <FormInput
                  name="email"
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                <FormInput
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgotPassword"
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
                className={`w-full transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50 ${
                  currentRole?.color === 'red' 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                    : currentRole?.color === 'blue'
                      ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                      : currentRole?.color === 'green'
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                        : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                }`}
                iconLeft={currentRole && <currentRole.icon className="w-4 h-4" />}
              >
                {isLoading 
                  ? "Signing in..." 
                    : `Sign in as ${currentRole?.label}`
                }
              </Button>

            </Form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
              <p className="text-sm text-neutral-600">
                Account access is managed by system administrators.
              </p>
              <p className="text-xs text-neutral-500">
                Need help? {" "}
                <Link
                  to="/contact"
                  className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </Card>

          {/* Additional Security Info */}
          <div className="mt-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Admin Portal</span>
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-primary-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Account Verification Dialog */}
      <AccountVerificationDialog
        isOpen={showVerificationDialog}
        onClose={handleCloseVerificationDialog}
        userEmail={unverifiedUserEmail}
        onResendEmail={handleResendVerificationEmail}
        onContactAdmin={handleContactAdmin}
      />
    </div>
  );
}
