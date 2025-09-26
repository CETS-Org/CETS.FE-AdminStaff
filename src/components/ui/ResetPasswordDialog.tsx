// src/components/ui/ResetPasswordDialog.tsx

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { Mail, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetPassword: (email: string) => Promise<void>;
  title?: string;
  description?: string;
  defaultEmail?: string;
};

export default function ResetPasswordDialog({ 
  open, 
  onOpenChange, 
  onResetPassword, 
  title = "Reset Password",
  description = "Enter the email address to send password reset instructions.",
  defaultEmail = ""
}: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset state when dialog opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmail("");
      setError(null);
      setSuccess(false);
      setLoading(false);
    } else {
      // Set default email when dialog opens
      setEmail(defaultEmail);
    }
    onOpenChange(isOpen);
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await onResetPassword(email.trim());
      setSuccess(true);
      
      // Auto close after 2 seconds on success
      setTimeout(() => {
        handleOpenChange(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to send reset instructions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary-600" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4">
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Reset Instructions Sent!
                </h3>
                <p className="text-green-700">
                  Password reset instructions have been sent to <strong>{email}</strong>
                </p>
                <p className="text-sm text-green-600 mt-2">
                  This dialog will close automatically in a moment.
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-4">
                  {description}
                </p>

                <div className="space-y-2">
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null); // Clear error when user types
                      }}
                      placeholder="Enter email address"
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The user will receive an email with instructions to create a new password. 
                    They will need to check their email and follow the provided link.
                  </p>
                </div>
              </>
            )}
          </DialogBody>
          
          {!success && (
            <DialogFooter>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading || !email.trim()}
                iconLeft={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              >
                {loading ? "Sending..." : "Send Reset Instructions"}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
