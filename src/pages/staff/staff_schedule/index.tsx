import Navbar from "@/shared/navbar";
import Sidebar from "@/shared/sidebar";
import { useState } from "react";
import ScheduleList from "./components/schedule_list";
import Card from "@/components/ui/Card";
import { Calendar, Clock, Users, BookOpen } from "lucide-react";

export default function StaffSchedulePage() {
  const [isToggleMenu, setIsToggleMenu] = useState(false);

  return (
    <div>
    
      
      <main className="mt-16 p-6 mx-auto lg:pl-70">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Schedule Management</h1>
              <p className="text-gray-600">Manage and organize class schedules, sessions, and time slots</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Current Week</div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">7</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Classes</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rooms Used</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Schedule Content */}
        <ScheduleList />
      </main>
    </div>
  );
}


