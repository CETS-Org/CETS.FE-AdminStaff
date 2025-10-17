import React from 'react';
import { BookOpen, GraduationCap, Target, Gift, CheckCircle, Clock, User } from 'lucide-react';
import Card from '@/components/ui/Card';
import type { CourseDetailData, CourseSkillDetail, CourseBenefitDetail, CourseRequirementDetail, CourseSyllabus } from '@/types/course.types';
import { CourseSyllabusSection } from './CourseSyllabusSection';

type Props = {
  courseDetail: CourseDetailData;
  skills: CourseSkillDetail[];
  benefits: CourseBenefitDetail[];
  requirements: CourseRequirementDetail[];
  syllabi: CourseSyllabus[];
};

export const CourseInfoSection: React.FC<Props> = ({
  courseDetail,
  skills,
  benefits,
  requirements,
  syllabi,
}) => {
  return (
    <>
      {/* Course Details */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Information</h2>

          {/* Course Header with Image */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Course Image */}
            <div className="md:w-1/3">
              {courseDetail.image ? (
                <img
                  src={courseDetail.image}
                  alt={courseDetail.name}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Course Basic Info */}
            <div className="md:w-2/3 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{courseDetail.name}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-accent2-200 ">
                    {courseDetail.courseCode}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-3 flex-wrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {courseDetail.category}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      courseDetail.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {courseDetail.status}
                  </span>
                </div>
              </div>

              {/* Rating */}
              {courseDetail.rating && courseDetail.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(courseDetail.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{courseDetail.rating.toFixed(1)}/5.0</span>
                </div>
              )}

              {/* Teachers */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {courseDetail.teachers.length > 1 ? 'Teachers:' : 'Teacher:'}
                  </span>
                </div>
                {courseDetail.teachers.length > 0 ? (
                  <div className="space-y-2">
                    {courseDetail.teachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                      >
                        {teacher.avatarUrl ? (
                          <img
                            src={teacher.avatarUrl}
                            alt={teacher.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{teacher.fullName}</p>
                          {teacher.yearsExperience && (
                            <p className="text-xs text-gray-500">
                              {teacher.yearsExperience} years experience
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No teachers assigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">{courseDetail.description}</p>
          </div>

          {/* Objectives */}
          {courseDetail.objectives && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Course Objectives
              </h3>
              {Array.isArray(courseDetail.objectives) ? (
                <ul className="space-y-2">
                  {courseDetail.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{courseDetail.objectives}</p>
              )}
            </div>
          )}

          {/* Basic Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Level</p>
              <p className="font-semibold text-gray-900">{courseDetail.level}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Format</p>
              <p className="font-semibold text-gray-900">{courseDetail.format}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="font-semibold text-gray-900">{courseDetail.duration}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Price</p>
              <p className="font-semibold text-gray-900">
                {courseDetail.price ? `${courseDetail.price.toLocaleString('vi-VN')} ₫` : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="font-semibold text-gray-900">{courseDetail.totalStudents || 0}</p>
            </div>
          </div>

          {/* Audit Information */}
          {(courseDetail.createdAt || courseDetail.updatedAt) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Audit Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseDetail.createdAt && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm text-gray-900">
                        {new Date(courseDetail.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {courseDetail.createdBy || 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}
                {courseDetail.updatedAt && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm text-gray-900">
                        {new Date(courseDetail.updatedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {courseDetail.updatedBy || 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Skills You'll Learn ({skills.length})
          </h3>
          {skills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {skills.map((skill, index) => (
                <div
                  key={skill.id || index}
                  className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-800">{skill.skillName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No skills added yet</p>
          )}
        </div>
      </Card>

      {/* Benefits */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Course Benefits ({benefits.length})
          </h3>
          {benefits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.id || index}
                  className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200"
                >
                  <Gift className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-800">{benefit.benefitName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No benefits added yet</p>
          )}
        </div>
      </Card>

      {/* Requirements */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-orange-600" />
            Prerequisites & Requirements ({requirements.length})
          </h3>
          {requirements.length > 0 ? (
            <ul className="space-y-1.5">
              {requirements.map((requirement, index) => (
                <li
                  key={requirement.id || index}
                  className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0 mt-1.5" />
                  <span className="text-sm text-gray-800">{requirement.requirementName}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No requirements added yet</p>
          )}
        </div>
      </Card>

      {/* Syllabus */}
      <CourseSyllabusSection syllabi={syllabi} />
    </>
  );
};

