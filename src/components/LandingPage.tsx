import { Shield, Lock, Fingerprint, Zap, ChevronRight } from 'lucide-react';

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-border/10" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-2xl gradient-cyber flex items-center justify-center glow-primary">
            <Shield className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
            UPI <span className="text-gradient-cyber">Shield</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Phishing Attack Simulation & Adaptive Authentication
          </p>
        </div>

        {/* Features mini */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Lock, label: 'Secure Auth' },
            { icon: Fingerprint, label: 'Risk Detection' },
            { icon: Zap, label: 'Live Simulation' },
          ].map(f => (
            <div key={f.label} className="gradient-card border border-border rounded-xl p-3 text-center">
              <f.icon className="h-5 w-5 mx-auto mb-1.5 text-primary" />
              <div className="text-[11px] font-medium text-muted-foreground">{f.label}</div>
            </div>
          ))}
        </div>

        {/* Enter Button */}
        <button
          onClick={onEnter}
          className="gradient-cyber text-primary-foreground px-10 py-4 rounded-2xl font-bold text-lg glow-primary hover:opacity-90 transition-all hover:scale-105 inline-flex items-center gap-3 group"
        >
          Enter System
          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-[11px] text-muted-foreground">
          Educational Cybersecurity Project • No Real Transactions
        </p>
      </div>
    </div>
  );
}