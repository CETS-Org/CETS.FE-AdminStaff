// import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Bell, User, LogOut, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar({ toggleSidebar }: { toggleSidebar: () => void }) {

  return (
    // <nav className="w-full h-16 bg-primary-800 shadow-xl flex items-center justify-between px-6 top-0 fixed z-10">
     <nav className="lg:w-5/6 w-full h-16 right-0 bg-primary-800 shadow-xl flex items-center justify-between px-6 top-0 fixed z-10">
      {/* Logo */}
      <div className=" flex items-center gap-2">
         <button onClick={toggleSidebar} className="lg:hidden">
          <Menu className="text-slate-600" />
        </button>
        <img src="/logo.png" alt="Logo" className="h-8 w-8" />
        <span className="text-lg font-bold">MyWebsite</span>
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
            <span className="text-sm font-medium">Ngọc Hân</span>
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
            <DropdownMenuItem>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
