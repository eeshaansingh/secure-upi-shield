import { useStore } from '@/hooks/useStore';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Shield, AlertTriangle, Activity, Eye, Clock, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const { transactions, logs, session } = useStore();

  const totalTxns = transactions.length;
  const fraudDetected = transactions.filter(t => t.isPhishing && (t.status === 'blocked' || t.status === 'rejected')).length;
  const highRisk = transactions.filter(t => t.riskLevel === 'high').length;
  const accepted = transactions.filter(t => t.status === 'accepted').length;

  const stats = [
    { label: 'Total Transactions', value: totalTxns, icon: Activity, color: 'text-primary' },
    { label: 'Fraud Blocked', value: fraudDetected, icon: Shield, color: 'text-success' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Awareness', value: `${session.awarenessScore}%`, icon: Eye, color: 'text-accent' },
  ];

  const riskData = [
    { name: 'Low', value: transactions.filter(t => t.riskLevel === 'low').length, color: 'hsl(142, 72%, 45%)' },
    { name: 'Medium', value: transactions.filter(t => t.riskLevel === 'medium').length, color: 'hsl(38, 92%, 55%)' },
    { name: 'High', value: transactions.filter(t => t.riskLevel === 'high').length, color: 'hsl(0, 72%, 55%)' },
  ];

  const statusData = [
    { name: 'Blocked', count: transactions.filter(t => t.status === 'blocked').length },
    { name: 'Rejected', count: transactions.filter(t => t.status === 'rejected').length },
    { name: 'Accepted', count: accepted },
    { name: 'Pending', count: transactions.filter(t => t.status === 'pending').length },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-xs text-muted-foreground">Security monitoring & analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="gradient-card border border-border rounded-xl p-4">
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {totalTxns > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Risk Distribution */}
          <div className="gradient-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={riskData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Breakdown */}
          <div className="gradient-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Transaction Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statusData.filter(d => d.count > 0)}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215 14% 50%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215 14% 50%)' }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(160, 84%, 44%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Action Logs */}
      <div className="gradient-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Action Logs</h3>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No activity yet. Start a simulation!</p>
          ) : logs.slice(0, 20).map(log => (
            <div key={log.id} className="flex items-start gap-2 py-2 border-b border-border last:border-0">
              <Clock className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{log.action.replace(/_/g, ' ')}</span>
                  {log.isFraudAttempt && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-destructive/20 text-destructive rounded-full">FRAUD</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">{log.details}</div>
                <div className="text-[9px] text-muted-foreground font-mono">{new Date(log.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
