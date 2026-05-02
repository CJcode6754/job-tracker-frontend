import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAiInsights } from '@/hooks/useAi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Navbar from '@/components/layout/Navbar';

interface DashboardStats {
  total: number;
  active: number;
  offers: number;
  by_status: { status: string; count: number }[];
  by_week: { week: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  wishlist:     '#94a3b8',
  applied:      '#60a5fa',
  phone_screen: '#a78bfa',
  interview:    '#f59e0b',
  offer:        '#22c55e',
  rejected:     '#ef4444',
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { insights, loading: aiLoading, fetchInsights } = useAiInsights();

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-3">
        <span className="loading loading-spinner loading-md text-primary" />
        <p className="text-sm text-base-content/50">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-5 py-5 sm:py-8 space-y-5">

        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-base-content/50 mt-0.5">Your job search at a glance</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total',  value: stats.total,  cls: 'text-base-content' },
            { label: 'Active', value: stats.active, cls: 'text-primary' },
            { label: 'Offers', value: stats.offers, cls: 'text-success' },
          ].map(({ label, value, cls }) => (
            <div key={label} className="card bg-base-100 border border-base-200 shadow-sm">
              <div className="card-body p-5">
                <p className="text-xs text-base-content/50 font-medium">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${cls}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body p-5">
            <h2 className="text-sm font-semibold mb-4">By Status</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.by_status} barSize={28}>
                <XAxis dataKey="status" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v.replace('_', ' ')} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid oklch(var(--b2))' }}
                />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {stats.by_status.map((entry: { status: string; count: number }) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">AI Insights</h2>
                <p className="text-xs text-base-content/50 mt-0.5">Powered by Gemini</p>
              </div>
              <button onClick={fetchInsights} disabled={aiLoading} className="btn btn-primary btn-sm">
                {aiLoading ? <span className="loading loading-spinner loading-xs" /> : null}
                {aiLoading ? 'Analyzing...' : insights ? 'Refresh' : 'Analyze'}
              </button>
            </div>

            {aiLoading && (
              <div className="space-y-2">
                {[100, 85, 70].map((w, i) => (
                  <div key={i} className="skeleton h-3 rounded-full" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}

            {insights && !aiLoading && (
              <p className="text-sm text-base-content/70 whitespace-pre-wrap leading-relaxed">{insights}</p>
            )}

            {!insights && !aiLoading && (
              <p className="text-sm text-base-content/40 text-center py-5">
                Click Analyze to get insights on your pipeline.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
