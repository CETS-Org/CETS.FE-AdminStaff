import { useState } from 'react';

export const useRoomToast = () => {
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showSuccessMessage = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return {
    showSuccessToast,
    toastMessage,
    showSuccessMessage,
    setShowSuccessToast
  };
};
