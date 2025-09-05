import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import Button from "@/components/ui/Button";
import ChatPopup from "@/components/ui/ChatPopup";

interface ChatButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: "small" | "medium" | "large";
  className?: string;
}

export default function ChatButton({ 
  position = "bottom-right", 
  size = "medium",
  className = ""
}: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case "bottom-left":
        return "bottom-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      default:
        return "bottom-4 right-4";
    }
  };

  return (
    <>
      {/* Chat Button */}
      <div className={`fixed ${getPositionClasses()} z-40 ${className}`}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary-600 hover:bg-primary-700"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      {/* Chat Popup */}
      <ChatPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position={position}
        size={size}
      />
    </>
  );
}
