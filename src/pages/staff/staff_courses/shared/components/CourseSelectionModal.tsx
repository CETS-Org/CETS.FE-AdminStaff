import { useState } from "react";
import { X, BookOpen, Users, Clock, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Course = {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "active" | "inactive";
  enrolledStudents: number;
  maxStudents: number;
  instructor?: string;
  category?: string;
};

interface CourseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCourse: (courseId: string) => void;
  courses: Course[];
}

export default function CourseSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectCourse, 
  courses 
}: CourseSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-700 border-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "advanced": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-semibold">Select a Course</h2>
                <p className="text-blue-100 text-sm">Choose a course to create a new class for</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses by name, description, or category..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Course List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No courses found</h3>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search terms" : "No courses available"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:border-blue-300 cursor-pointer group"
                  onClick={() => onSelectCourse(course.id)}
                >
                  <div className="space-y-3">
                    {/* Course Header */}
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {course.name}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(course.level)}`}>
                          {course.level}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Course Details */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.enrolledStudents}/{course.maxStudents}</span>
                      </div>
                    </div>

                    {/* Instructor and Category */}
                    <div className="flex items-center justify-between text-sm">
                      {course.instructor && (
                        <span className="text-gray-600">
                          <span className="font-medium">Instructor:</span> {course.instructor}
                        </span>
                      )}
                      {course.category && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {course.category}
                        </span>
                      )}
                    </div>

                    {/* Select Button */}
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCourse(course.id);
                        }}
                      >
                        Create Class for this Course
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
            </p>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
