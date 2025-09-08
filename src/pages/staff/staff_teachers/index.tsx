import TeacherList from "./components/teacher_list";
import Card from "@/components/ui/Card";
import { Users, GraduationCap, Clock, Award } from "lucide-react";

export default function TeacherManagement() {
   

    return (
  
                <main className=" mt-16 p-6 mx-auto lg:pl-0 lg:w-full  bg-gray-50 w-[90%]">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
                                <p className="text-gray-600 mt-2">Manage and organize your teaching staff</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                                        <p className="text-2xl font-bold text-gray-900">24</p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                                        <p className="text-2xl font-bold text-gray-900">18</p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg Experience</p>
                                        <p className="text-2xl font-bold text-gray-900">4.2 yrs</p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Award className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Certified</p>
                                        <p className="text-2xl font-bold text-gray-900">22</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <TeacherList />
                  
                </main>
           
       
    );
}