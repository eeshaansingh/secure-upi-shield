import { CheckCircle, XCircle, ShieldCheck, Lightbulb, RotateCcw } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import type { Transaction } from '@/lib/types';

interface Props {
  transaction: Transaction;
  resultType: 'success' | 'blocked' | 'rejected';
  onContinue: () => void;
}

export default function ResultScreen({ transaction, resultType, onContinue }: Props) {
  const { session } = useStore();

  const config = {
    success: { icon: CheckCircle, title: 'Transaction Completed', color: 'text-success', bg: 'bg-success/10 border-success/30', desc: 'The transaction was processed. This was a legitimate request.' },
    blocked: { icon: ShieldCheck, title: 'Fraud Blocked!', color: 'text-primary', bg: 'bg-primary/10 border-primary/30', desc: 'The system detected and blocked this phishing attempt.' },
    rejected: { icon: XCircle, title: 'Transaction Rejected', color: 'text-warning', bg: 'bg-warning/10 border-warning/30', desc: 'You chose to reject this transaction.' },
  }[resultType];

  const Icon = config.icon;
  const wasCorrectDecision = (resultType === 'rejected' && transaction.isPhishing) ||
    (resultType === 'success' && !transaction.isPhishing) ||
    (resultType === 'blocked' && transaction.isPhishing);

  return (
    <div className="container mx-auto px-4 py-8 max-w-md space-y-5">
      {/* Result Card */}
      <div className={`rounded-2xl p-6 text-center space-y-4 border ${config.bg}`}>
        <Icon className={`h-14 w-14 mx-auto ${config.color}`} />
        <h3 className={`text-xl font-bold ${config.color}`}>{config.title}</h3>
        <p className="text-sm text-muted-foreground">{config.desc}</p>
      </div>

      {/* Decision Feedback */}
      <div className={`rounded-xl p-4 border ${wasCorrectDecision ? 'border-success/30 bg-success/10' : 'border-destructive/30 bg-destructive/10'}`}>
        <div className={`text-sm font-semibold ${wasCorrectDecision ? 'text-success' : 'text-destructive'}`}>
          {wasCorrectDecision ? '✅ Good Decision!' : '❌ Be Careful!'}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {wasCorrectDecision
            ? 'You made the right call. Keep staying vigilant!'
            : transaction.isPhishing
              ? 'This was a phishing attempt. You should have rejected it.'
              : 'This was a legitimate transaction. It was safe to accept.'}
        </div>
      </div>

      {/* Security Tip */}
      {transaction.securityTip && (
        <div className="gradient-card border border-border rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-warning">Security Tip</div>
              <div className="text-xs text-muted-foreground mt-1">{transaction.securityTip}</div>
            </div>
          </div>
        </div>
      )}

      {/* Awareness Score */}
      <div className="gradient-card border border-border rounded-xl p-4 text-center">
        <div className="text-xs text-muted-foreground mb-1">Your Awareness Score</div>
        <div className="text-3xl font-bold text-primary">{session.awarenessScore}%</div>
        <div className="text-[10px] text-muted-foreground">{session.correctDecisions}/{session.totalDecisions} correct decisions</div>
        <div className="w-full bg-secondary rounded-full h-2 mt-3">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${session.awarenessScore}%` }} />
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-xl gradient-cyber text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
      >
        <RotateCcw className="h-4 w-4" /> Try Another Scenario
      </button>
    </div>
  );
}
