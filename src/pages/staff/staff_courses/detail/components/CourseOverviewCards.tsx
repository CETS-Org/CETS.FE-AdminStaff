import React from 'react';
import { GraduationCap, CalendarCheck2, Clock, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import type { CourseDetailData, Class as ClassInfo } from '@/types/course.types';
import type { ClassSession } from '@/types/timetable.type';

type Props = {
  courseDetail: CourseDetailData;
  classes: ClassInfo[];
  classSessions: ClassSession[];
};

export const CourseOverviewCards: React.FC<Props> = ({ courseDetail, classes, classSessions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
       <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-orange-700">Active Classes</p>
            <p className="text-lg font-bold text-orange-900">
              {classes.filter((c) => c.status === 'active').length}
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Teachers</p>
            <p className="text-2xl font-bold text-blue-900">{courseDetail.teachers.length}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <CalendarCheck2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-700">Active Students</p>
            <p className="text-2xl font-bold text-green-900">
              {classes.reduce((total, c) => total + c.currentStudents, 0)}
            </p>
          </div>
        </div>
      </Card>
     
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-purple-700">Sessions</p>
            <p className="text-2xl font-bold text-purple-900">{classSessions.length}</p>
          </div>
        </div>
      </Card>

      
    </div>
  );
};

