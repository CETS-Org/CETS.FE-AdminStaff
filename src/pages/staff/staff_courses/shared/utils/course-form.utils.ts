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

