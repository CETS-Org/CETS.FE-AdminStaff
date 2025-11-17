import { useState } from 'react';

export const useCourseObjectives = () => {
  const [courseObjectives, setCourseObjectives] = useState<string[]>([]);

  const addCourseObjective = () => setCourseObjectives(prev => [...prev, ""]);
  
  const removeCourseObjective = (idx: number) => setCourseObjectives(prev => prev.filter((_, i) => i !== idx));
  
  const updateCourseObjective = (idx: number, val: string) => setCourseObjectives(prev => prev.map((o, i) => i === idx ? val : o));

  const loadObjectives = (objectives: string[]) => {
    setCourseObjectives(objectives);
  };

  const resetObjectives = () => {
    setCourseObjectives([]);
  };

  return {
    courseObjectives,
    addCourseObjective,
    removeCourseObjective,
    updateCourseObjective,
    loadObjectives,
    resetObjectives
  };
};

