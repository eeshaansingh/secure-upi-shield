import { Shield, AlertTriangle, Activity } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Shield },
    { id: 'simulation', label: 'Simulate', icon: AlertTriangle },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
  ];

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg gradient-cyber flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">UPI Shield</h1>
            <p className="text-[10px] text-muted-foreground">Phishing Simulation</p>
          </div>
        </div>
        <nav className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'gradient-cyber text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5 inline mr-1" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
