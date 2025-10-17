import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isLoading?: boolean;
};

export default function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete",
  isLoading = false 
}: Props) {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-red-600">{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-neutral-700">{message}</p>
        </DialogBody>
        <DialogFooter className="sticky bottom-0 bg-gray-50 z-10 border-t pt-6 shadow-sm">
          <Button 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleConfirm} 
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

