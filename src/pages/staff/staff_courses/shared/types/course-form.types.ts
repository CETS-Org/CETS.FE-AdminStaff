export type CourseScheduleUI = {
  id?: string; // For existing schedules
  timeSlotID: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
};

export type SyllabusItemUI = {
  id?: string; // For existing items
  sessionNumber: number;
  topicTitle: string;
  totalSlots?: number;
  required: boolean;
  objectives: string[];
  contentSummary?: string;
  preReadingUrl?: string;
};

export type SyllabusUI = {
  id?: string; // For existing syllabi
  title: string;
  description: string;
  items: SyllabusItemUI[];
};

export type RelationshipData = { 
  relationshipId: string; 
  lookupId: string 
};

export type LookupOption = { 
  label: string; 
  value: string 
};

export type CourseFormMode = 'create' | 'edit';

