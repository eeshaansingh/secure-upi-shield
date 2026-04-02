// === Core Types for UPI Phishing Simulation ===

export type PhishingType = 'fake_collect' | 'qr_scam' | 'fake_payment_received';
export type RiskLevel = 'low' | 'medium' | 'high';
export type AuthMethod = 'pin_only' | 'pin_warning' | 'otp_confirm';
export type TransactionStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Transaction {
  id: string;
  type: PhishingType;
  senderName: string;
  senderUpi: string;
  amount: number;
  note: string;
  timestamp: number;
  riskScore: number;
  riskLevel: RiskLevel;
  authMethod: AuthMethod;
  status: TransactionStatus;
  isPhishing: boolean;
  userAction?: 'accept' | 'reject';
  securityTip?: string;
}

export interface UserSession {
  authenticated: boolean;
  lastActivity: number;
  failedAttempts: number;
  awarenessScore: number;
  totalDecisions: number;
  correctDecisions: number;
}

export interface ActionLog {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  transactionId?: string;
  isFraudAttempt: boolean;
}
