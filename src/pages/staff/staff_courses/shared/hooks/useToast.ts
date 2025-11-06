import { useState } from 'react';

export const useToast = () => {
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showSuccessMessage = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  const showErrorMessage = (message: string) => {
    setToastMessage(message);
    setShowErrorToast(true);
    setTimeout(() => setShowErrorToast(false), 5000);
  };

  return {
    showSuccessToast,
    showErrorToast,
    toastMessage,
    showSuccessMessage,
    showErrorMessage
  };
};

