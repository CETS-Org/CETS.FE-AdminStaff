import { CheckCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import styles from './RoomToast.module.css';

interface RoomToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function RoomToast({ show, message, onClose, duration = 3000 }: RoomToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return createPortal(
    <div className={styles.toastContainer}>
      <div className={styles.toastContent}>
        <CheckCircle className={styles.icon} />
        <span>{message}</span>
      </div>
    </div>,
    document.body
  );
}
