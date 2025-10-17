import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import type { CourseSyllabus, SyllabusItem } from '@/types/course.types';

type Props = {
  syllabi: CourseSyllabus[];
};

export const CourseSyllabusSection: React.FC<Props> = ({ syllabi }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedItems(new Set());
    } else {
      const allItemIds = syllabi.flatMap(s => s.items.map(item => item.id));
      setExpandedItems(new Set(allItemIds));
    }
    setExpandAll(!expandAll);
  };

  // Calculate total sections and total slots
  const totalSections = syllabi.reduce((acc, s) => acc + s.items.length, 0);
  const totalSlots = syllabi.reduce(
    (acc, s) => acc + s.items.reduce((sum, item) => sum + item.totalSlots, 0),
    0
  );

  if (syllabi.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Course Syllabus</h3>
          <p className="text-gray-500 text-sm">No syllabus available yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Course Syllabus</h3>
            <p className="text-gray-600">
              {totalSections} section{totalSections !== 1 ? 's' : ''} • {totalSlots} slot{totalSlots !== 1 ? 's' : ''} total
            </p>
          </div>
          <button
            onClick={toggleExpandAll}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {expandAll ? 'Collapse all sections' : 'Expand all sections'}
          </button>
        </div>

        {/* Syllabus Items */}
        <div className="space-y-3">
          {syllabi.flatMap(syllabus => 
            syllabus.items.map((item) => {
              const isExpanded = expandedItems.has(item.id);

              return (
                <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Item Header */}
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            Session {item.sessionNumber}: {item.topicTitle}
                          </span>
                          {item.required && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Required
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm ml-4">
                      <Clock className="w-4 h-4" />
                      <span>{item.totalSlots} slot{item.totalSlots !== 1 ? 's' : ''}</span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                      {/* Learning Objectives */}
                      <div className="mb-3 pt-4">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">Learning Objectives</h4>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{item.objectives}</p>
                          </div>
                        </div>
                      </div>

                      {/* Content Summary */}
                      <div className="mb-3">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">Content Summary</h4>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{item.contentSummary}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};

