import { useState } from "react";
import { Mail, RotateCcw, MessageCircle, Clock, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import Button from "./Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";

interface AccountVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onResendEmail?: () => Promise<void>;
  onContactAdmin?: () => void;
}

export default function AccountVerificationDialog({
  isOpen,
  onClose,
  userEmail,
  onResendEmail,
  onContactAdmin
}: AccountVerificationDialogProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");

  const handleResendEmail = async () => {
    if (!onResendEmail) return;
    
    setIsResending(true);
    setResendError("");
    setResendSuccess(false);
    
    try {
      await onResendEmail();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000); // Hide success message after 5 seconds
    } catch (error) {
      setResendError(error instanceof Error ? error.message : "Failed to resend email");
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = userEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="md" className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-center gap-2 text-center text-xl">
            <Shield className="w-5 h-5 text-orange-500" />
            Account Verification Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4 px-2 pb-6">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-10 h-10 text-orange-500" />
          </div>
          
          {/* Main Message */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-neutral-900">
              Please Verify Your Account
            </h3>
            <p className="text-neutral-600 leading-relaxed">
              Your account needs to be verified before you can access the admin portal. 
              We've sent verification instructions to your email address.
            </p>
          </div>

          {/* Email Display */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">Email Address</span>
            </div>
            <p className="text-neutral-900 font-mono text-sm bg-white px-3 py-2 rounded border">
              {maskedEmail}
            </p>
          </div>

          {/* Status Messages */}
          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-sm text-green-800">
                Verification email sent successfully! Please check your inbox.
              </span>
            </div>
          )}
          
          {resendError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-800">{resendError}</span>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">What to do next:</span>
            </div>
            <div className="text-sm text-blue-700 space-y-1 text-left">
              <p>• Check your email inbox for verification instructions</p>
              <p>• Don't forget to check your spam/junk folder</p>
              <p>• Click the verification link in the email</p>
              <p>• Return to the login page to access your account</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {onResendEmail && (
              <Button
                variant="secondary"
                onClick={handleResendEmail}
                disabled={isResending}
                className="flex-1"
                iconLeft={<RotateCcw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />}
              >
                {isResending ? 'Sending...' : 'Resend Email'}
              </Button>
            )}
            
            {onContactAdmin && (
              <Button
                variant="secondary"
                onClick={onContactAdmin}
                className="flex-1"
                iconLeft={<MessageCircle className="w-4 h-4" />}
              >
                Contact Admin
              </Button>
            )}
          </div>

          {/* Close Button */}
          <Button
            variant="primary"
            onClick={onClose}
            className="w-full"
          >
            Back to Login
          </Button>

          {/* Additional Help */}
          <p className="text-xs text-neutral-500 leading-relaxed">
            If you continue to have issues, please contact your system administrator 
            or IT support team for assistance with account verification.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
