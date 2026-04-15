import { useState } from 'react';
import { AlertTriangle, QrCode, MessageSquare, ArrowRight, Shield, X, Check, Banknote, UserX, UserCheck, Settings2 } from 'lucide-react';
import { getScenarioWithConfig } from '@/lib/mockData';
import { addTransaction, updateTransaction, logAction, recordDecision } from '@/lib/store';
import type { Transaction, PhishingType } from '@/lib/types';
import AuthScreen from './AuthScreen';
import ResultScreen from './ResultScreen';

const typeIcons: Record<PhishingType, typeof AlertTriangle> = {
  fake_collect: AlertTriangle,
  qr_scam: QrCode,
  fake_payment_received: MessageSquare,
};
const typeLabels: Record<PhishingType, string> = {
  fake_collect: 'Collect Request',
  qr_scam: 'QR Code Payment',
  fake_payment_received: 'Payment Notification',
};

type AmountSize = 'small' | 'large' | 'random';
type FraudChoice = 'fraud' | 'legit' | 'random';

export default function SimulationScreen() {
  const [currentTxn, setCurrentTxn] = useState<Transaction | null>(null);
  const [phase, setPhase] = useState<'config' | 'request' | 'auth' | 'result'>('config');
  const [resultType, setResultType] = useState<'success' | 'blocked' | 'rejected'>('success');

  // Config state
  const [amountSize, setAmountSize] = useState<AmountSize>('random');
  const [fraudChoice, setFraudChoice] = useState<FraudChoice>('random');
  const [attackType, setAttackType] = useState<PhishingType | 'random'>('random');

  function startScenario() {
    const txn = getScenarioWithConfig({
      amountSize: amountSize === 'random' ? undefined : amountSize,
      isFraud: fraudChoice === 'random' ? undefined : fraudChoice === 'fraud',
      type: attackType === 'random' ? undefined : attackType,
    });
    addTransaction(txn);
    setCurrentTxn(txn);
    setPhase('request');
  }

  function handleAccept() {
    if (!currentTxn) return;
    logAction('user_accepted', `User accepted ${currentTxn.type}`, currentTxn.id, currentTxn.isPhishing);
    updateTransaction(currentTxn.id, { userAction: 'accept' });
    setPhase('auth');
  }

  function handleReject() {
    if (!currentTxn) return;
    updateTransaction(currentTxn.id, { userAction: 'reject', status: 'rejected' });
    logAction('user_rejected', `User rejected ${currentTxn.type}`, currentTxn.id, false);
    recordDecision(currentTxn.isPhishing);
    setResultType('rejected');
    setPhase('result');
  }

  function handleAuthComplete(passed: boolean) {
    if (!currentTxn) return;
    if (passed) {
      updateTransaction(currentTxn.id, { status: currentTxn.isPhishing ? 'blocked' : 'accepted' });
      recordDecision(!currentTxn.isPhishing);
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
    setPhase('config');
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
        <div className={`text-center py-2 rounded-lg text-xs font-semibold ${
          currentTxn.riskLevel === 'high' ? 'bg-destructive/20 text-destructive' :
          currentTxn.riskLevel === 'medium' ? 'bg-warning/20 text-warning' :
          'bg-success/20 text-success'
        }`}>
          Risk Score: {currentTxn.riskScore}/100 — {currentTxn.riskLevel.toUpperCase()} RISK
        </div>

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

  // Config phase
  return (
    <div className="container mx-auto px-4 py-8 max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium">
          <Settings2 className="h-3.5 w-3.5" /> Configure Simulation
        </div>
        <h2 className="text-xl font-bold text-foreground">Set Up Your Scenario</h2>
        <p className="text-xs text-muted-foreground">Choose the parameters for your phishing simulation</p>
      </div>

      {/* Amount Size */}
      <div className="gradient-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Transaction Amount</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'small' as const, label: 'Small', desc: '₹100–₹999' },
            { value: 'large' as const, label: 'Large', desc: '₹5,000+' },
            { value: 'random' as const, label: 'Random', desc: 'Any amount' },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setAmountSize(opt.value)}
              className={`p-3 rounded-lg border text-center transition-all ${
                amountSize === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <div className="text-xs font-semibold">{opt.label}</div>
              <div className="text-[10px] mt-0.5 opacity-70">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Fraud or Legit */}
      <div className="gradient-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-warning" />
          <span className="text-sm font-semibold text-foreground">Account Type</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'fraud' as const, label: 'Fraudulent', icon: UserX, desc: 'Phishing attempt', color: 'text-destructive' },
            { value: 'legit' as const, label: 'Legitimate', icon: UserCheck, desc: 'Safe sender', color: 'text-success' },
            { value: 'random' as const, label: 'Random', icon: Shield, desc: 'Surprise me', color: 'text-primary' },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setFraudChoice(opt.value)}
              className={`p-3 rounded-lg border text-center transition-all ${
                fraudChoice === opt.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <opt.icon className={`h-4 w-4 mx-auto mb-1 ${fraudChoice === opt.value ? opt.color : ''}`} />
              <div className="text-xs font-semibold">{opt.label}</div>
              <div className="text-[10px] mt-0.5 opacity-70">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Attack Type */}
      <div className="gradient-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-semibold text-foreground">Attack Type</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'fake_collect' as const, label: 'Collect Request', icon: AlertTriangle },
            { value: 'qr_scam' as const, label: 'QR Scam', icon: QrCode },
            { value: 'fake_payment_received' as const, label: 'Fake Payment', icon: MessageSquare },
            { value: 'random' as const, label: 'Random', icon: Shield },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setAttackType(opt.value)}
              className={`p-3 rounded-lg border text-left transition-all flex items-center gap-2 ${
                attackType === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              <opt.icon className="h-4 w-4 shrink-0" />
              <div className="text-xs font-semibold">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={startScenario}
        className="w-full gradient-cyber text-primary-foreground py-4 rounded-xl font-semibold text-sm glow-primary hover:opacity-90 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        <Zap className="h-5 w-5" /> Launch Simulation
      </button>
    </div>
  );
}