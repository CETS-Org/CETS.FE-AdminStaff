// Types for Placement Test Questions (similar to Assignment Questions)
export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_in_the_blank"
  | "short_answer"
  | "matching"
  | "essay"
  | "speaking";

export interface Question {
  id: string;
  type: QuestionType;
  order: number;
  question: string;
  points: number;
  options?: QuestionOption[];
  correctAnswer?: any;
  explanation?: string;
  audioTimestamp?: string;
  reference?: string;
  shuffleOptions?: boolean;
  blanks?: FillInTheBlank[];
  matching?: MatchingData;
  maxLength?: number;
  keywords?: string[];
  requiresManualGrading?: boolean;
  // Speaking-specific fields
  maxDuration?: number; // Maximum recording duration in seconds
  instructions?: string; // Additional instructions for student
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface FillInTheBlank {
  id: string;
  position: number;
  correctAnswers: string[];
  caseSensitive: boolean;
}

export interface MatchingData {
  leftColumn: MatchingItem[];
  rightColumn: MatchingItem[];
  correctMatches: MatchingPair[];
  shuffleRightColumn: boolean;
}

export interface MatchingItem {
  id: string;
  text: string;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface PlacementQuestionData {
  version: string;
  questions: Question[];
  settings?: {
    // Timing & grading
    timeLimitMinutes?: number;
    isAutoGradable?: boolean;
    totalPoints?: number;

    // Answer visibility
    showAnswersAfterSubmission?: boolean;
    showAnswersAfterDueDate?: boolean;

    // Speaking-specific
    allowMultipleRecordings?: boolean;
    maxRecordings?: number;
  };
  media?: {
    audioUrl?: string;
    videoUrl?: string;
    images?: Array<{ url: string; questionId: string }>;
  };
  readingPassage?: string;
}

