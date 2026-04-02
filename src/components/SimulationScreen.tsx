import { useState } from 'react';
import { AlertTriangle, QrCode, MessageSquare, ArrowRight, Shield, X, Check } from 'lucide-react';
import { getRandomScenario, getAllScenarios } from '@/lib/mockData';
import { addTransaction, updateTransaction, logAction, recordDecision } from '@/lib/store';
import type { Transaction } from '@/lib/types';
import AuthScreen from './AuthScreen';
import ResultScreen from './ResultScreen';

const typeIcons = {
  fake_collect: AlertTriangle,
  qr_scam: QrCode,
  fake_payment_received: MessageSquare,
};
const typeLabels = {
  fake_collect: 'Collect Request',
  qr_scam: 'QR Code Payment',
  fake_payment_received: 'Payment Notification',
};

export default function SimulationScreen() {
  const [currentTxn, setCurrentTxn] = useState<Transaction | null>(null);
  const [phase, setPhase] = useState<'select' | 'request' | 'auth' | 'result'>('select');
  const [resultType, setResultType] = useState<'success' | 'blocked' | 'rejected'>('success');

  function startScenario() {
    const txn = getRandomScenario();
    addTransaction(txn);
    setCurrentTxn(txn);
    setPhase('request');
  }

  function handleAccept() {
    if (!currentTxn) return;
    logAction('user_accepted', `User accepted ${currentTxn.type}`, currentTxn.id, currentTxn.isPhishing);
    updateTransaction(currentTxn.id, { userAction: 'accept' });
    // Move to auth phase
    setPhase('auth');
  }

  function handleReject() {
    if (!currentTxn) return;
    updateTransaction(currentTxn.id, { userAction: 'reject', status: 'rejected' });
    logAction('user_rejected', `User rejected ${currentTxn.type}`, currentTxn.id, false);
    recordDecision(currentTxn.isPhishing); // correct if it WAS phishing
    setResultType('rejected');
    setPhase('result');
  }

  function handleAuthComplete(passed: boolean) {
    if (!currentTxn) return;
    if (passed) {
      updateTransaction(currentTxn.id, { status: currentTxn.isPhishing ? 'blocked' : 'accepted' });
      recordDecision(!currentTxn.isPhishing); // correct if it was NOT phishing
      setResultType(currentTxn.isPhishing ? 'blocked' : 'success');
    } else {
      updateTransaction(currentTxn.id, { status: 'blocked' });
      logAction('auth_failed', 'Authentication failed - transaction blocked', currentTxn.id, true);
      setResultType('blocked');
    }
    setPhase('result');
  }

  function reset() {
    setCurrentTxn(null);
    setPhase('select');
  }

  if (phase === 'auth' && currentTxn) {
    return <AuthScreen transaction={currentTxn} onComplete={handleAuthComplete} onCancel={() => { handleReject(); }} />;
  }

  if (phase === 'result' && currentTxn) {
    return <ResultScreen transaction={currentTxn} resultType={resultType} onContinue={reset} />;
  }

  if (phase === 'request' && currentTxn) {
    const Icon = typeIcons[currentTxn.type];
    return (
      <div className="container mx-auto px-4 py-8 max-w-md space-y-4">
        {/* Risk Badge */}
        <div className={`text-center py-2 rounded-lg text-xs font-semibold ${
          currentTxn.riskLevel === 'high' ? 'bg-destructive/20 text-destructive' :
          currentTxn.riskLevel === 'medium' ? 'bg-warning/20 text-warning' :
          'bg-success/20 text-success'
        }`}>
          Risk Score: {currentTxn.riskScore}/100 — {currentTxn.riskLevel.toUpperCase()} RISK
        </div>

        {/* UPI Request Card */}
        <div className="gradient-card border border-border rounded-2xl overflow-hidden">
          <div className="bg-primary/10 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{currentTxn.senderName}</div>
              <div className="text-xs text-muted-foreground font-mono">{currentTxn.senderUpi}</div>
            </div>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">
              {typeLabels[currentTxn.type]}
            </span>
          </div>

          <div className="p-5 space-y-4 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground">₹{currentTxn.amount.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">Requested amount</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3 text-left">
              <div className="text-xs text-muted-foreground mb-1">Message:</div>
              <div className="text-sm text-foreground">{currentTxn.note}</div>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              TXN ID: {currentTxn.id}
            </div>
          </div>

          <div className="p-4 border-t border-border flex gap-3">
            <button
              onClick={handleReject}
              className="flex-1 py-3 rounded-xl border border-destructive/30 text-destructive font-semibold text-sm hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
            >
              <X className="h-4 w-4" /> Reject
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 py-3 rounded-xl gradient-cyber text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" /> Accept <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Risk Warning for medium/high */}
        {currentTxn.riskLevel !== 'low' && (
          <div className={`rounded-xl p-4 border ${
            currentTxn.riskLevel === 'high' ? 'border-destructive/30 bg-destructive/10' : 'border-warning/30 bg-warning/10'
          }`}>
            <div className="flex items-start gap-2">
              <Shield className={`h-4 w-4 mt-0.5 ${currentTxn.riskLevel === 'high' ? 'text-destructive' : 'text-warning'}`} />
              <div>
                <div className={`text-xs font-semibold ${currentTxn.riskLevel === 'high' ? 'text-destructive' : 'text-warning'}`}>
                  {currentTxn.riskLevel === 'high' ? '⚠️ High Risk Detected' : '⚡ Caution Advised'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {currentTxn.riskLevel === 'high'
                    ? 'This transaction has suspicious patterns. OTP verification required.'
                    : 'Verify the sender before proceeding. Enhanced authentication required.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Select phase
  return (
    <div className="container mx-auto px-4 py-8 max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Phishing Scenarios</h2>
        <p className="text-xs text-muted-foreground">Tap below to experience a random attack simulation</p>
      </div>

      <button
        onClick={startScenario}
        className="w-full gradient-cyber text-primary-foreground py-4 rounded-xl font-semibold text-sm glow-primary hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <AlertTriangle className="h-5 w-5" /> Generate Random Attack
      </button>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attack Types</h3>
        {(['fake_collect', 'qr_scam', 'fake_payment_received'] as const).map(type => {
          const Icon = typeIcons[type];
          return (
            <div key={type} className="gradient-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-destructive/15 flex items-center justify-center">
                <Icon className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{typeLabels[type]}</div>
                <div className="text-[10px] text-muted-foreground">
                  {type === 'fake_collect' && 'Fake collect requests disguised as refunds'}
                  {type === 'qr_scam' && 'QR codes that debit instead of credit'}
                  {type === 'fake_payment_received' && 'Fake payment success notifications'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
