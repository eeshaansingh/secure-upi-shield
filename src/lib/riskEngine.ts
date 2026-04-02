// === Risk Analysis Engine ===
// Assigns risk scores (0-100) based on multiple factors

import { type PhishingType, type RiskLevel, type AuthMethod } from './types';

interface RiskFactors {
  amount: number;
  isNewReceiver: boolean;
  hour: number; // 0-23
  isFirstInteraction: boolean;
  phishingType: PhishingType;
  hasUrgentLanguage: boolean;
}

/**
 * Calculate risk score from 0-100 based on transaction factors.
 * Each factor contributes a weighted portion to the total.
 */
export function calculateRiskScore(factors: RiskFactors): number {
  let score = 0;

  // Amount-based risk (0-25 points)
  if (factors.amount > 10000) score += 25;
  else if (factors.amount > 5000) score += 18;
  else if (factors.amount > 1000) score += 10;
  else score += 3;

  // New/unknown receiver (0-20 points)
  if (factors.isNewReceiver) score += 20;

  // Time-based risk: late night transactions are suspicious (0-15 points)
  if (factors.hour >= 23 || factors.hour <= 5) score += 15;
  else if (factors.hour >= 21 || factors.hour <= 6) score += 8;

  // First-time interaction (0-15 points)
  if (factors.isFirstInteraction) score += 15;

  // Phishing pattern detection (0-20 points)
  switch (factors.phishingType) {
    case 'fake_collect': score += 18; break;
    case 'qr_scam': score += 20; break;
    case 'fake_payment_received': score += 15; break;
  }

  // Urgent/suspicious language (0-5 points)
  if (factors.hasUrgentLanguage) score += 5;

  return Math.min(100, score);
}

/** Map risk score to risk level category */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 65) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

/**
 * Adaptive authentication: determine auth method based on risk level.
 * Low → PIN only, Medium → PIN + Warning, High → OTP + Confirmation
 */
export function getAuthMethod(riskLevel: RiskLevel): AuthMethod {
  switch (riskLevel) {
    case 'low': return 'pin_only';
    case 'medium': return 'pin_warning';
    case 'high': return 'otp_confirm';
  }
}
