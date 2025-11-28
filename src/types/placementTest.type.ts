export interface PlacementQuestion {
  id: string;
  skillType: string;
  skillTypeID: string;
  questionType: string;
  questionTypeID: string;
  title: string;
  questionUrl?: string | null;
  difficulty: number; // 1: đơn, 2: ngắn, 3: dài
  createdAt: string;
  updatedAt?: string | null;
}

export interface QuestionType {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface PlacementTest {
  id: string;
  title: string;
  durationMinutes: number;
  storeUrl?: string | null;
  questions: PlacementQuestion[];
  createdAt: string;
  updatedAt?: string | null;
  isDeleted: boolean;
}

export interface CreatePlacementQuestionRequest {
  title: string;
  questionUrl?: string | null;
  skillTypeID: string;
  questionTypeID: string;
  difficulty: number;
  questionJson?: string;
}

export interface UpdatePlacementQuestionRequest {
  id: string;
  title?: string;
  questionUrl?: string | null;
  skillTypeID?: string;
  questionTypeID?: string;
  difficulty?: number;
  questionJson?: string;
}

export interface CreatePlacementTestWithQuestionsRequest {
  title: string;
  durationMinutes: number;
  questionIds: string[];
}

export interface UpdatePlacementTestRequest {
  title?: string;
  durationMinutes?: number;
  questionIds?: string[];
}

