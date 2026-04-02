import { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowLeft } from 'lucide-react';
import { generateOTP, checkRateLimit, hashPin } from '@/lib/securityUtils';
import { logAction } from '@/lib/store';
import type { Transaction } from '@/lib/types';

interface Props {
  transaction: Transaction;
  onComplete: (passed: boolean) => void;
  onCancel: () => void;
}

export default function AuthScreen({ transaction, onComplete, onCancel }: Props) {
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [step, setStep] = useState<'warning' | 'pin' | 'otp' | 'confirm'>('warning');
  const [error, setError] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);

  // Determine starting step based on auth method
  useEffect(() => {
    if (transaction.authMethod === 'pin_only') setStep('pin');
    else if (transaction.authMethod === 'pin_warning') setStep('warning');
    else setStep('warning');
  }, [transaction.authMethod]);

  // Generate OTP for high-risk
  useEffect(() => {
    if (transaction.authMethod === 'otp_confirm') {
      const newOtp = generateOTP();
      setGeneratedOtp(newOtp);
      logAction('otp_generated', `OTP generated: ${newOtp} (simulated)`, transaction.id, false);
    }
  }, [transaction]);

  function handlePinSubmit() {
    if (!checkRateLimit(`pin_${transaction.id}`, 3, 60000)) {
      setRateLimited(true);
      setError('Too many attempts. Locked for 60 seconds.');
      logAction('rate_limited', 'PIN attempts rate limited', transaction.id, true);
      return;
    }
    if (pin.length !== 4 && pin.length !== 6) {
      setError('Enter 4 or 6 digit PIN');
      return;
    }
    const hashed = hashPin(pin);
    logAction('pin_entered', `PIN submitted (hash: ${hashed})`, transaction.id, false);

    if (transaction.authMethod === 'otp_confirm') {
      setStep('otp');
      setError('');
    } else {
      setStep('confirm');
    }
  }

  function handleOtpSubmit() {
    if (otp !== generatedOtp) {
      setError('Invalid OTP. Check the simulated OTP shown above.');
      logAction('otp_failed', 'Invalid OTP entered', transaction.id, true);
      return;
    }
    logAction('otp_verified', 'OTP verified successfully', transaction.id, false);
    setStep('confirm');
    setError('');
  }

  function handleConfirm() {
    onComplete(true);
  }

  // Warning screen
  if (step === 'warning') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md space-y-6">
        <button onClick={onCancel} className="text-muted-foreground text-xs flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Cancel
        </button>
        <div className={`rounded-2xl p-6 text-center space-y-4 border ${
          transaction.riskLevel === 'high' ? 'border-destructive/40 bg-destructive/10' : 'border-warning/40 bg-warning/10'
        }`}>
          <ShieldAlert className={`h-12 w-12 mx-auto ${transaction.riskLevel === 'high' ? 'text-destructive' : 'text-warning'}`} />
          <h3 className={`text-lg font-bold ${transaction.riskLevel === 'high' ? 'text-destructive' : 'text-warning'}`}>
            {transaction.riskLevel === 'high' ? '🚨 High Risk Transaction' : '⚠️ Security Warning'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {transaction.riskLevel === 'high'
              ? `This transaction scored ${transaction.riskScore}/100 on risk analysis. Suspicious patterns detected. Additional verification required.`
              : `This transaction has elevated risk (${transaction.riskScore}/100). Please verify the sender before proceeding.`}
          </p>
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setStep('pin')}
              className="w-full py-3 rounded-xl gradient-cyber text-primary-foreground font-semibold text-sm"
            >
              Proceed with Verification
            </button>
            <button onClick={onCancel} className="w-full py-3 rounded-xl border border-border text-muted-foreground text-sm hover:bg-secondary">
              Cancel Transaction
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PIN input
  if (step === 'pin') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md space-y-6">
        <button onClick={onCancel} className="text-muted-foreground text-xs flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Cancel
        </button>
        <div className="gradient-card border border-border rounded-2xl p-6 text-center space-y-5">
          <Lock className="h-10 w-10 mx-auto text-primary" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Enter UPI PIN</h3>
            <p className="text-xs text-muted-foreground mt-1">Paying ₹{transaction.amount.toLocaleString()} to {transaction.senderName}</p>
          </div>
          <div className="relative">
            <input
              ref={pinRef}
              type="password"
              maxLength={6}
              value={pin}
              onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
              className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••"
              disabled={rateLimited}
              autoFocus
            />
            <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            onClick={handlePinSubmit}
            disabled={pin.length < 4 || rateLimited}
            className="w-full py-3 rounded-xl gradient-cyber text-primary-foreground font-semibold text-sm disabled:opacity-50"
          >
            Verify PIN
          </button>
          <p className="text-[10px] text-muted-foreground">
            🔒 PIN is hashed before processing. Never stored in plain text.
          </p>
        </div>
      </div>
    );
  }

  // OTP screen
  if (step === 'otp') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md space-y-6">
        <button onClick={onCancel} className="text-muted-foreground text-xs flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Cancel
        </button>
        <div className="gradient-card border border-border rounded-2xl p-6 text-center space-y-5">
          <ShieldAlert className="h-10 w-10 mx-auto text-accent" />
          <div>
            <h3 className="text-lg font-bold text-foreground">OTP Verification</h3>
            <p className="text-xs text-muted-foreground mt-1">Additional verification for high-risk transaction</p>
          </div>
          {/* Simulated OTP display */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
            <div className="text-[10px] text-accent mb-1">📱 Simulated SMS OTP:</div>
            <div className="text-xl font-mono font-bold text-accent tracking-widest">{generatedOtp}</div>
          </div>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
            className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="••••••"
            autoFocus
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            onClick={handleOtpSubmit}
            disabled={otp.length !== 6}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm disabled:opacity-50"
          >
            Verify OTP
          </button>
        </div>
      </div>
    );
  }

  // Confirm screen
  return (
    <div className="container mx-auto px-4 py-8 max-w-md space-y-6">
      <div className="gradient-card border border-border rounded-2xl p-6 text-center space-y-4">
        <Lock className="h-10 w-10 mx-auto text-success" />
        <h3 className="text-lg font-bold text-foreground">Confirm Transaction</h3>
        <div className="bg-secondary rounded-lg p-4 space-y-2 text-left text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">To:</span><span className="text-foreground font-medium">{transaction.senderName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span><span className="text-foreground font-bold">₹{transaction.amount.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Risk:</span><span className={`font-medium ${
            transaction.riskLevel === 'high' ? 'text-destructive' : transaction.riskLevel === 'medium' ? 'text-warning' : 'text-success'
          }`}>{transaction.riskLevel.toUpperCase()}</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground text-sm">Cancel</button>
          <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl gradient-cyber text-primary-foreground font-semibold text-sm">Confirm</button>
        </div>
      </div>
    </div>
  );
}
