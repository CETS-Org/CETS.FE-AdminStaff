// Alert Dialog wrapper using existing Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "./Dialog";

export {
  Dialog as AlertDialog,
  DialogContent as AlertDialogContent,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
  DialogDescription as AlertDialogDescription,
  DialogBody as AlertDialogBody,
  DialogFooter as AlertDialogFooter,
};

// Additional AlertDialog specific components
export const AlertDialogCancel = ({ children, onClick, disabled, ...props }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    {...props}
  >
    {children}
  </button>
);

export const AlertDialogAction = ({ children, onClick, disabled, className = "", ...props }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

