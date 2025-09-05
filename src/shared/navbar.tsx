// import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

export default function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setIsLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    // Clear any authentication tokens/data here
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Close dialog and navigate to login
    setIsLogoutDialogOpen(false);
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setIsLogoutDialogOpen(false);
  };

  return (
    <>
    {/* <nav className="w-full h-16 bg-primary-800 shadow-xl flex items-center justify-between px-6 top-0 fixed z-10"> */}
     <nav className="lg:pl-70 w-full h-16 right-0 bg-sky-200 shadow-md flex items-center justify-between px-6 top-0 fixed z-20 ">
      {/* Logo */}
      <div className=" flex items-center gap-2">
         <button onClick={toggleSidebar} className="lg:hidden">
          <Menu className="text-slate-600" />
        </button>
        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
        <span className="text-lg font-bold text-primary-900">MyWebsite</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Notification Icon */}
        <button className="relative">
          <Bell className="h-5 w-5 text-neutral-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
            <span className="text-sm font-medium text-primary-900">Ngọc Hân</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
              <AvatarFallback>NH</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogoutClick}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>

    {/* Logout Confirmation Dialog */}
    <ConfirmationDialog
      isOpen={isLogoutDialogOpen}
      onClose={handleLogoutCancel}
      onConfirm={handleLogoutConfirm}
      title="Confirm Logout"
      message="Are you sure you want to logout? You will be redirected to the login page."
      confirmText="Logout"
      cancelText="Cancel"
      type="warning"
    />
    </>
  );
}
