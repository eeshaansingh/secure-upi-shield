import { useStore } from '@/hooks/useStore';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Shield, AlertTriangle, Activity, Eye, Clock, FileText, TrendingUp, Users, ShieldCheck, ShieldX, ChevronRight } from 'lucide-react';

export default function AdminDashboard() {
  const { transactions, logs, session } = useStore();

  const totalTxns = transactions.length;
  const fraudDetected = transactions.filter(t => t.isPhishing && (t.status === 'blocked' || t.status === 'rejected')).length;
  const fraudMissed = transactions.filter(t => t.isPhishing && t.status === 'accepted').length;
  const highRisk = transactions.filter(t => t.riskLevel === 'high').length;
  const accepted = transactions.filter(t => t.status === 'accepted').length;
  const blocked = transactions.filter(t => t.status === 'blocked').length;
  const rejected = transactions.filter(t => t.status === 'rejected').length;

  const stats = [
    { label: 'Total Transactions', value: totalTxns, icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Fraud Blocked', value: fraudDetected, icon: ShieldCheck, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Fraud Missed', value: fraudMissed, icon: ShieldX, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Awareness Score', value: `${session.awarenessScore}%`, icon: Eye, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Decisions Made', value: session.totalDecisions, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  const riskData = [
    { name: 'Low', value: transactions.filter(t => t.riskLevel === 'low').length, color: 'hsl(142, 72%, 45%)' },
    { name: 'Medium', value: transactions.filter(t => t.riskLevel === 'medium').length, color: 'hsl(38, 92%, 55%)' },
    { name: 'High', value: transactions.filter(t => t.riskLevel === 'high').length, color: 'hsl(0, 72%, 55%)' },
  ];

  const statusData = [
    { name: 'Blocked', count: blocked, fill: 'hsl(160, 84%, 44%)' },
    { name: 'Rejected', count: rejected, fill: 'hsl(38, 92%, 55%)' },
    { name: 'Accepted', count: accepted, fill: 'hsl(190, 90%, 50%)' },
  ];

  const typeData = [
    { name: 'Collect', total: transactions.filter(t => t.type === 'fake_collect').length, fraud: transactions.filter(t => t.type === 'fake_collect' && t.isPhishing).length },
    { name: 'QR Scam', total: transactions.filter(t => t.type === 'qr_scam').length, fraud: transactions.filter(t => t.type === 'qr_scam' && t.isPhishing).length },
    { name: 'Fake Pay', total: transactions.filter(t => t.type === 'fake_payment_received').length, fraud: transactions.filter(t => t.type === 'fake_payment_received' && t.isPhishing).length },
  ];

  // Recent transactions table
  const recentTxns = transactions.slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-1">Real-time security monitoring & fraud analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-mono">LIVE</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className="gradient-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
            <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Detection Rate Banner */}
      {totalTxns > 0 && (
        <div className="gradient-card border border-primary/30 rounded-xl p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl gradient-cyber flex items-center justify-center shrink-0">
            <TrendingUp className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">Fraud Detection Rate</div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${transactions.filter(t => t.isPhishing).length > 0 ? Math.round((fraudDetected / transactions.filter(t => t.isPhishing).length) * 100) : 0}%` }}
                />
              </div>
              <span className="text-lg font-bold text-primary">
                {transactions.filter(t => t.isPhishing).length > 0
                  ? Math.round((fraudDetected / transactions.filter(t => t.isPhishing).length) * 100)
                  : 0}%
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {fraudDetected} of {transactions.filter(t => t.isPhishing).length} phishing attempts caught
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      {totalTxns > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Risk Distribution */}
          <div className="gradient-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={riskData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={2} stroke="hsl(220, 18%, 10%)">
                  {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(210, 20%, 92%)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction Status */}
          <div className="gradient-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Transaction Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData.filter(d => d.count > 0)}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(210, 20%, 92%)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Attack Types */}
          <div className="gradient-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Attack Types</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215, 14%, 50%)' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={{ background: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 14%, 18%)', borderRadius: '8px', fontSize: '12px', color: 'hsl(210, 20%, 92%)' }} />
                <Bar dataKey="total" fill="hsl(190, 90%, 50%)" radius={[0, 4, 4, 0]} name="Total" />
                <Bar dataKey="fraud" fill="hsl(0, 72%, 55%)" radius={[0, 4, 4, 0]} name="Fraud" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Transactions Table */}
      <div className="gradient-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">{totalTxns} total</span>
        </div>
        {recentTxns.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-[10px] text-muted-foreground mt-1">Run a simulation to see data here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-3 text-muted-foreground font-medium">Sender</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Amount</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Risk</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Phishing</th>
                </tr>
              </thead>
              <tbody>
                {recentTxns.map(txn => (
                  <tr key={txn.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-foreground">{txn.senderName}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{txn.senderUpi}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{txn.type.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-right font-mono text-foreground">₹{txn.amount.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        txn.riskLevel === 'high' ? 'bg-destructive/20 text-destructive' :
                        txn.riskLevel === 'medium' ? 'bg-warning/20 text-warning' :
                        'bg-success/20 text-success'
                      }`}>
                        {txn.riskScore}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        txn.status === 'blocked' ? 'bg-primary/20 text-primary' :
                        txn.status === 'rejected' ? 'bg-warning/20 text-warning' :
                        txn.status === 'accepted' ? 'bg-success/20 text-success' :
                        'bg-secondary text-muted-foreground'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {txn.isPhishing ? (
                        <span className="text-[10px] px-2 py-0.5 bg-destructive/20 text-destructive rounded-full font-semibold">YES</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-success/20 text-success rounded-full font-semibold">NO</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Logs */}
      <div className="gradient-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Action Logs</h3>
          <span className="ml-auto text-[10px] text-muted-foreground">{logs.length} entries</span>
        </div>
        <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No activity yet. Start a simulation!</p>
          ) : logs.slice(0, 25).map(log => (
            <div key={log.id} className="flex items-start gap-3 p-3 hover:bg-secondary/20 transition-colors">
              <Clock className="h-3 w-3 text-muted-foreground mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{log.action.replace(/_/g, ' ')}</span>
                  {log.isFraudAttempt && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-destructive/20 text-destructive rounded-full font-semibold">FRAUD</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">{log.details}</div>
              </div>
              <div className="text-[9px] text-muted-foreground font-mono shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}