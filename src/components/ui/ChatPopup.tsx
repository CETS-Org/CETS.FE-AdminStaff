import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Phone, Video, MoreVertical, Search, Plus, Smile, Paperclip, Mic, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Card from "@/components/ui/Card";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  isRead: boolean;
  type: "text" | "image" | "file";
}

interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  type: "individual" | "group";
}

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: "small" | "medium" | "large";
}

const mockChats: Chat[] = [
  {
    id: "1",
    name: "John Smith",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    lastMessage: "Hey, how's the project going?",
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000),
    unreadCount: 2,
    isOnline: true,
    type: "individual"
  },
  {
    id: "2", 
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    lastMessage: "Can we schedule a meeting for tomorrow?",
    lastMessageTime: new Date(Date.now() - 15 * 60 * 1000),
    unreadCount: 0,
    isOnline: false,
    type: "individual"
  },
  {
    id: "3",
    name: "Development Team",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=40&h=40&fit=crop&crop=face",
    lastMessage: "Mike: The new feature is ready for testing",
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
    unreadCount: 5,
    isOnline: true,
    type: "group"
  }
];

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey, how's the project going?",
    senderId: "user1",
    senderName: "John Smith",
    senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
    type: "text"
  },
  {
    id: "2",
    content: "It's going well! We're making good progress on the new features.",
    senderId: "currentUser",
    senderName: "You",
    timestamp: new Date(Date.now() - 4 * 60 * 1000),
    isRead: true,
    type: "text"
  },
  {
    id: "3",
    content: "That's great to hear! When do you think we can have a demo?",
    senderId: "user1",
    senderName: "John Smith",
    senderAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
    isRead: false,
    type: "text"
  }
];

export default function ChatPopup({ 
  isOpen, 
  onClose, 
  position = "bottom-right",
  size = "medium" 
}: ChatPopupProps) {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showChatList, setShowChatList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-80 h-96";
      case "large":
        return "w-96 h-[500px]";
      default:
        return "w-88 h-[450px]";
    }
  };

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

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return "1d+";
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatList(false);
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setSelectedChat(null);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mockMessages]);

  if (!isOpen) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50 ${getSizeClasses()}`}>
      <Card className="h-full flex flex-col shadow-2xl border-0 min-h-0 relative">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">
                {showChatList ? "Messages" : selectedChat?.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {!showChatList && (
                <button
                  onClick={handleBackToList}
                  className="text-primary-600 bg-accent-100 p-1 rounded-full hover:text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <button
               
                onClick={onClose}
                className="text-primary-600 bg-accent-100 p-1 rounded-full hover:text-white hover:bg-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {showChatList ? (
            /* Chat List */
            <div className="h-full flex flex-col">
              {/* Search */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleChatSelect(chat)}
                  >
                                      <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={chat.avatar} alt={chat.name} />
                        <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {chat.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 truncate text-sm">{chat.name}</h4>
                          <span className="text-xs text-gray-500">{formatTime(chat.lastMessageTime)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 truncate">{chat.lastMessage}</p>
                          {chat.unreadCount > 0 && (
                            <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1 min-w-[16px] text-center">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New Chat Button */}
              <div className="p-3 border-t border-gray-200">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Chat
                </Button>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedChat?.avatar} alt={selectedChat?.name} />
                        <AvatarFallback>{selectedChat?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {selectedChat?.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{selectedChat?.name}</h4>
                      <p className="text-xs text-gray-600">
                        {selectedChat?.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="secondary" size="sm" className="p-2">
                      <Phone className="w-3 h-3" />
                    </Button>
                    <Button variant="secondary" size="sm" className="p-2">
                      <Video className="w-3 h-3" />
                    </Button>
                    <Button variant="secondary" size="sm" className="p-2">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 pb-16">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === "currentUser" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.senderId === "currentUser" ? "flex-row-reverse" : ""}`}>
                      {message.senderId !== "currentUser" && (
                        <Avatar className="w-6 h-6 mt-1">
                          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                          <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`px-3 py-2 rounded-lg text-sm ${
                        message.senderId === "currentUser"
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}>
                        <p>{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === "currentUser" ? "text-primary-100" : "text-gray-500"
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input - Fixed at bottom */}
              <div className="absolute bottom-0 left-0 right-0 px-2  border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="pr-20 text-sm resize-none"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="p-1 h-6 w-6 hover:bg-gray-100"
                      >
                        <Smile className="w-3 h-3 text-gray-500" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="p-1 h-6 w-6 hover:bg-gray-100"
                      >
                        <Paperclip className="w-3 h-3 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim()}
                      size="sm"
                      className="px-3 h-8 bg-primary-600 hover:bg-primary-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
