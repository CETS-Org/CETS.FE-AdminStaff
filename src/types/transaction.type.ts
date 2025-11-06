// Transaction types
export interface Transaction {
  id: string;
  paymentID: string;
  eventId: string;
  gatewayID: string;
  eventType: string;
  receivedAt: string;
  payload: string;
  createdAt: string;
  createdByName: string;
  paymentAmount: number;
  courseName: string;
  gatewayName: string;
}

export interface PayloadData {
  paymentId: string;
  invoiceId: string;
  studentId: string;
  reservationItemId: string;
  amount: number;
  paymentDate: string;
  status: string;
}

export interface TransactionFilter {
  eventType?: string;
  gatewayName?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

