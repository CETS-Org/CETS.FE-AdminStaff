import type { LookupOption } from '../types/course-form.types';

// Currency formatter for Vietnamese Dong
export const formatVND = (amount?: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
}).format(Number(amount || 0));

// Get label from option value
export const getOptionLabel = (options: LookupOption[], value?: string) => {
  if (!value) return 'Not set';
  const found = options.find(o => String(o.value) === String(value));
  return found?.label || 'Not set';
};

// Get multiple labels from IDs
export const getLabelsFromIds = (options: LookupOption[], ids: string[]) =>
  options.filter(o => ids?.some(id => String(id) === String(o.value))).map(o => o.label);

// Day names constant
export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Convert API data to lookup options
export const toOptions = (items: any[]) => 
  (items || []).map((x: any) => ({ 
    label: x.name || x.Name, 
    value: x.lookUpId || x.LookUpId 
  }));

// Convert API data to category options
export const toCategoryOptions = (items: any[]) => 
  (items || []).map((c: any) => ({ 
    label: c.name || c.Name, 
    value: c.id || c.Id 
  }));

// Convert API data to skill/benefit/requirement options
export const toRelationshipOptions = (items: any[]) => 
  (items || []).map((item: any) => ({ 
    label: item.name || item.Name || item.description || item.Description || 'Unnamed', 
    value: item.lookUpId || item.LookUpId 
  }));

// Convert API data to timeslot options
export const toTimeslotOptions = (items: any[]) => 
  (items || []).map((t: any) => ({ 
    label: t.name || t.Name || t.timeSlotName || t.TimeSlotName || `${t.startTime || ''} - ${t.endTime || ''}`, 
    value: t.id || t.Id || t.lookUpId || t.LookUpId 
  }));

// Get sort order for course level (for ascending order)
// Returns a number representing the level's position in the progression
export const getCourseLevelSortOrder = (levelName: string): number => {
  const normalizedLevel = levelName?.toLowerCase().trim() || '';
  
  if (normalizedLevel.includes('beginner')) return 1;
  if (normalizedLevel.includes('elementary')) return 2;
  if (normalizedLevel.includes('pre-intermediate')) return 3;
  if (normalizedLevel.includes('intermediate') && !normalizedLevel.includes('pre')) return 4;
  if (normalizedLevel.includes('advanced')) return 5;
  if (normalizedLevel.includes('mastery')) return 6;
  
  // Default: put unknown levels at the end
  return 999;
};

// Course level to score mapping based on proficiency levels
// Beginner: 0-400, Elementary: 401-500, Pre-Intermediate: 501-600, 
// Intermediate: 601-700, Advanced: 701-800, Mastery: 800+
// Standard Score = Entry Score (minimum score of the level)
// Exit Score = minimum score of the next level
export const getScoresFromCourseLevel = (levelName: string): { standardScore: number; exitScore: number } => {
  const normalizedLevel = levelName?.toLowerCase().trim() || '';
  
  // Map various level name formats to score ranges
  if (normalizedLevel.includes('beginner')) {
    // Beginner: 0-400 -> standard: 0 (entry), exit: 401 (next level entry)
    return { standardScore: 0, exitScore: 401 };
  } else if (normalizedLevel.includes('elementary')) {
    // Elementary: 401-500 -> standard: 401 (entry), exit: 501 (next level entry)
    return { standardScore: 401, exitScore: 501 };
  } else if (normalizedLevel.includes('pre-intermediate')) {
    // Pre-Intermediate: 501-600 -> standard: 501 (entry), exit: 601 (next level entry)
    return { standardScore: 501, exitScore: 601 };
  } else if (normalizedLevel.includes('intermediate')) {
    // Intermediate: 601-700 -> standard: 601 (entry), exit: 701 (next level entry)
    return { standardScore: 601, exitScore: 701 };
  } else if (normalizedLevel.includes('advanced') ) {
    // Advanced: 701-800 -> standard: 701 (entry), exit: 801 (next level entry for Mastery)
    return { standardScore: 701, exitScore: 801 };
  } else if (normalizedLevel.includes('mastery')) {
    // Mastery: 800+ -> standard: 800 (entry), exit: 900 (next progression)
    return { standardScore: 800, exitScore: 900 };
  }
  
  // Default fallback: Beginner level (0-400)
  return { standardScore: 0, exitScore: 401 };
};

