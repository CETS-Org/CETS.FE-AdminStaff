import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Form, FormInput } from "@/components/ui/Form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { ArrowLeft, Mail, Send, AlertCircle, CheckCircle, Shield, KeyRound } from "lucide-react";
import { forgotPassword } from "@/api/account.api";
import "../../styles/login-animations.css";
import GenericNavbar from "../../shared/GenericNavbar";
import { createGuestNavbarConfig } from "../../shared/navbarConfigs";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const methods = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      // Call the forgot password API
      const response = await forgotPassword(data.email);
      
      // Show success message
      setSuccessMessage("Verification code sent! Check your email and follow the instructions to reset your password.");
      
      // Navigate to OTP verification with email and token after a short delay
      setTimeout(() => {
        navigate("/OtpVerification", { 
          state: { 
            email: data.email,
            token: response.token || response 
          } 
        });
      }, 2000);
      
    } catch (error: any) {
      console.error("Forgot password error:", error);
      
      // Handle different error types with better messaging
      let message = "Failed to send reset email. Please try again later.";
      
      if (error.response?.status === 404) {
        message = "No account found with this email address. Please check your email or contact support.";
      } else if (error.response?.status === 400) {
        message = "Invalid email format. Please enter a valid email address.";
      } else if (error.response?.status === 429) {
        message = "Too many requests. Please wait a few minutes before trying again.";
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
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
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h1 className="login-title text-3xl sm:text-3xl font-bold text-neutral-900 mb-2">Reset Password</h1>
              <p className="text-neutral-600 mb-4">
                Enter your email address and we'll send you a verification code
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium border border-primary-200">
                <Shield className="w-4 h-4" />
                Password Recovery
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in-up">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-green-800 text-sm font-medium">Email Sent Successfully!</p>
                  <p className="text-green-700 text-xs mt-1">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <Form methods={methods} onSubmit={onSubmit} className="login-form-spacing space-y-4 animate-slide-in-right animation-delay-200">
              {/* Email Field */}
              <div className="space-y-2">
                <FormInput
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading || !!successMessage}
                className="w-full transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
                iconLeft={<Send className="w-4 h-4" />}
              >
                {isLoading ? "Sending..." : successMessage ? "Email Sent" : "Send Verification Code"}
              </Button>
            </Form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-neutral-100 text-center space-y-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </Card>

          {/* Additional Security Info */}
          <div className="mt-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Reset</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>Email Verified</span>
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              We'll send you a secure verification code to reset your password safely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
