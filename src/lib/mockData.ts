// === Mock Data Generator for Phishing Scenarios ===

import { type Transaction, type PhishingType } from './types';
import { calculateRiskScore, getRiskLevel, getAuthMethod } from './riskEngine';
import { generateTransactionId } from './securityUtils';

interface ScenarioTemplate {
  type: PhishingType;
  senderName: string;
  senderUpi: string;
  amount: number;
  note: string;
  isPhishing: boolean;
  securityTip: string;
}

const fraudScenarios: ScenarioTemplate[] = [
  {
    type: 'fake_collect',
    senderName: 'Amazon Refund',
    senderUpi: 'amaz0n.refund@fakebank',
    amount: 4999,
    note: 'URGENT: Your refund of ₹4,999 is pending. Accept to receive.',
    isPhishing: true,
    securityTip: '🔍 Refunds are credited directly. You never need to "accept" a refund via collect request.',
  },
  {
    type: 'qr_scam',
    senderName: 'Online Seller - Raj',
    senderUpi: 'rajseller99@paytm',
    amount: 12500,
    note: 'Scan this QR to RECEIVE ₹12,500 for your product',
    isPhishing: true,
    securityTip: '⚠️ QR codes are for PAYING, not receiving. Never scan a QR to receive money.',
  },
  {
    type: 'fake_payment_received',
    senderName: 'PhonePe Support',
    senderUpi: 'support@phonepe-help',
    amount: 2000,
    note: '₹2,000 credited to your account! Click to verify.',
    isPhishing: true,
    securityTip: '🛡️ Real payment notifications come from your bank. Fake "received" messages trick you into sharing details.',
  },
  {
    type: 'fake_collect',
    senderName: 'IRCTC Official',
    senderUpi: 'irctc.refund2024@ybl',
    amount: 8750,
    note: 'IRCTC Ticket Refund - Accept immediately before expiry!',
    isPhishing: true,
    securityTip: '🚫 IRCTC refunds go directly to your bank account. Urgency is a common phishing tactic.',
  },
  {
    type: 'qr_scam',
    senderName: 'Buyer - Priya',
    senderUpi: 'priya.buy@gpay',
    amount: 25000,
    note: 'Scanning QR to pay you for laptop. Please enter PIN to receive.',
    isPhishing: true,
    securityTip: '🔐 You NEVER need to enter your PIN to receive money. This is a classic QR scam.',
  },
  {
    type: 'fake_payment_received',
    senderName: 'Paytm Cashback',
    senderUpi: 'cashback@paytm-offers',
    amount: 1500,
    note: 'Congratulations! ₹1,500 cashback credited. Verify now!',
    isPhishing: true,
    securityTip: '🚨 Cashback is credited automatically. Never click links to "verify" cashback.',
  },
];

const legitScenarios: ScenarioTemplate[] = [
  {
    type: 'fake_collect',
    senderName: 'Ravi Kumar',
    senderUpi: 'ravi.kumar@okaxis',
    amount: 500,
    note: 'Paying you back for dinner last night',
    isPhishing: false,
    securityTip: '✅ This appears to be a legitimate payment from a known contact. Always verify the sender.',
  },
  {
    type: 'fake_collect',
    senderName: 'Sneha Patel',
    senderUpi: 'sneha.p@oksbi',
    amount: 250,
    note: 'My share for the movie tickets',
    isPhishing: false,
    securityTip: '✅ Small personal payments from known contacts are usually safe. Still verify the UPI ID.',
  },
  {
    type: 'fake_collect',
    senderName: 'Amit Shah',
    senderUpi: 'amit.shah92@okicici',
    amount: 1200,
    note: 'Rent contribution for this month',
    isPhishing: false,
    securityTip: '✅ Regular payments from known contacts are typically legitimate.',
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface ScenarioConfig {
  amountSize?: 'small' | 'large';
  isFraud?: boolean;
  type?: PhishingType;
}

export function getScenarioWithConfig(config: ScenarioConfig): Transaction {
  // Determine fraud or legit
  const isFraud = config.isFraud ?? Math.random() > 0.35;
  const pool = isFraud ? fraudScenarios : legitScenarios;

  // Filter by type if specified
  let filtered = config.type ? pool.filter(s => s.type === config.type) : pool;
  if (filtered.length === 0) filtered = pool;

  let scenario = { ...pick(filtered) };

  // Override amount based on size preference
  if (config.amountSize === 'small') {
    scenario.amount = Math.floor(Math.random() * 900) + 100; // 100-999
  } else if (config.amountSize === 'large') {
    scenario.amount = Math.floor(Math.random() * 45000) + 5000; // 5000-50000
  }

  const hour = new Date().getHours();
  const riskScore = calculateRiskScore({
    amount: scenario.amount,
    isNewReceiver: scenario.isPhishing,
    hour,
    isFirstInteraction: scenario.isPhishing,
    phishingType: scenario.type,
    hasUrgentLanguage: scenario.note.includes('URGENT') || scenario.note.includes('immediately'),
  });
  const riskLevel = getRiskLevel(riskScore);

  return {
    id: generateTransactionId(),
    ...scenario,
    timestamp: Date.now(),
    riskScore,
    riskLevel,
    authMethod: getAuthMethod(riskLevel),
    status: 'pending',
  };
}

// Keep backward compat
export function getRandomScenario(): Transaction {
  return getScenarioWithConfig({});
}

export function getAllScenarios(): Transaction[] {
  return [...fraudScenarios, ...legitScenarios].map((scenario) => {
    const riskScore = calculateRiskScore({
      amount: scenario.amount,
      isNewReceiver: scenario.isPhishing,
      hour: new Date().getHours(),
      isFirstInteraction: scenario.isPhishing,
      phishingType: scenario.type,
      hasUrgentLanguage: scenario.note.includes('URGENT') || scenario.note.includes('immediately'),
    });
    const riskLevel = getRiskLevel(riskScore);
    return {
      id: generateTransactionId(),
      ...scenario,
      timestamp: Date.now() - Math.random() * 3600000,
      riskScore,
      riskLevel,
      authMethod: getAuthMethod(riskLevel),
      status: 'pending' as const,
    };
  });
}
