// === Application State Store ===
// Simple reactive store using React context pattern

import { type Transaction, type ActionLog, type UserSession } from './types';
import { generateTransactionId } from './securityUtils';

// In-memory stores (simulating backend database)
let transactions: Transaction[] = [];
let actionLogs: ActionLog[] = [];
let session: UserSession = {
  authenticated: false,
  lastActivity: Date.now(),
  failedAttempts: 0,
  awarenessScore: 0,
  totalDecisions: 0,
  correctDecisions: 0,
};

// Listeners for reactivity
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach(fn => fn());
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getTransactions() { return [...transactions]; }
export function getActionLogs() { return [...actionLogs]; }
export function getSession() { return { ...session }; }

export function addTransaction(txn: Transaction) {
  transactions = [txn, ...transactions];
  logAction('transaction_created', `New ${txn.type} transaction: ₹${txn.amount}`, txn.id, txn.isPhishing);
  notify();
}

export function updateTransaction(id: string, updates: Partial<Transaction>) {
  transactions = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
  notify();
}

export function logAction(action: string, details: string, transactionId?: string, isFraudAttempt = false) {
  actionLogs = [{
    id: generateTransactionId(),
    timestamp: Date.now(),
    action,
    details,
    transactionId,
    isFraudAttempt,
  }, ...actionLogs];
  notify();
}

export function updateSession(updates: Partial<UserSession>) {
  session = { ...session, ...updates, lastActivity: Date.now() };
  notify();
}

export function recordDecision(wasCorrect: boolean) {
  session.totalDecisions++;
  if (wasCorrect) session.correctDecisions++;
  session.awarenessScore = Math.round((session.correctDecisions / session.totalDecisions) * 100);
  notify();
}
