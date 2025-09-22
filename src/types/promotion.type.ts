export interface Promotion {
  id: string;
  promotionTypeID: string;
  code: string;
  name: string;
  percentOff: number | null;
  amountOff: number | null;
  endDate: string | null;
  startDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdByNavigation?: {
    accountId: string;
    fullName: string;
    email: string;
  } | null;
  updatedByNavigation?: {
    accountId: string;
    fullName: string;
    email: string;
  } | null;
  promotionType?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

export interface CreatePromotionRequest {
  promotionTypeID: string;
  code: string;
  name: string;
  percentOff?: number | null;
  amountOff?: number | null;
  endDate?: string | null;
  startDate?: string | null;
  isActive: boolean;
}

export interface UpdatePromotionRequest {
  id: string;
  promotionTypeID?: string;
  code?: string;
  name?: string;
  percentOff?: number | null;
  amountOff?: number | null;
  endDate?: string | null;
  startDate?: string | null;
  isActive?: boolean;
}

export interface PromotionType {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface PromotionFilters {
  search?: string;
  isActive?: boolean | null;
  promotionTypeID?: string | null;
  startDateFrom?: string | null;
  startDateTo?: string | null;
  endDateFrom?: string | null;
  endDateTo?: string | null;
}
