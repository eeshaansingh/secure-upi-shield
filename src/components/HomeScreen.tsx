import { Shield, AlertTriangle, Zap, Eye } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

export default function HomeScreen({ onStartSimulation }: { onStartSimulation: () => void }) {
  const { session, transactions } = useStore();

  const stats = [
    { label: 'Awareness Score', value: session.totalDecisions > 0 ? `${session.awarenessScore}%` : '—', icon: Eye, color: 'text-primary' },
    { label: 'Attacks Simulated', value: transactions.length, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Threats Blocked', value: transactions.filter(t => t.status === 'rejected' && t.isPhishing).length, icon: Shield, color: 'text-success' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium">
          <Shield className="h-3.5 w-3.5" /> Educational Cybersecurity Demo
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          UPI Phishing Attack<br />
          <span className="text-gradient-cyber">Simulation System</span>
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Experience real-world UPI fraud scenarios in a safe environment. Learn to identify phishing attacks and understand adaptive authentication.
        </p>
        <button
          onClick={onStartSimulation}
          className="gradient-cyber text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm glow-primary hover:opacity-90 transition-opacity inline-flex items-center gap-2"
        >
          <Zap className="h-4 w-4" /> Start Simulation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="gradient-card border border-border rounded-xl p-4 text-center">
            <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Flow Diagram */}
      <div className="gradient-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">How It Works</h3>
        <div className="flex items-center justify-between text-center gap-2">
          {[
            { step: '1', label: 'Attack', desc: 'Phishing scenario', color: 'bg-destructive' },
            { step: '2', label: 'Detect', desc: 'Risk scoring', color: 'bg-warning' },
            { step: '3', label: 'Auth', desc: 'Adaptive verify', color: 'bg-primary' },
            { step: '4', label: 'Prevent', desc: 'Block fraud', color: 'bg-success' },
          ].map((item, i) => (
            <div key={item.step} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className={`h-8 w-8 rounded-full ${item.color} flex items-center justify-center text-xs font-bold text-foreground`}>
                  {item.step}
                </div>
                <div className="text-xs font-medium text-foreground mt-1">{item.label}</div>
                <div className="text-[9px] text-muted-foreground">{item.desc}</div>
              </div>
              {i < 3 && <div className="w-4 h-px bg-border hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
