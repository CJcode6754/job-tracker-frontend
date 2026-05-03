import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAiInsights } from '@/hooks/useAi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import Navbar from '@/components/layout/Navbar';

interface DashboardStats {
  total: number;
  active: number;
  offers: number;
  by_status: { status: string; count: number }[];
  by_week: { week: string; count: number }[];
  interviews?: {
    total_rounds: number;
    avg_rating: number | null;
    by_type: Record<string, number>;
    active_count: number;
  };
}

const ROUND_TYPE_COLORS: Record<string, string> = {
  technical:    '#60a5fa',
  hr:           '#22c55e',
  system_design:'#a78bfa',
  take_home:    '#f59e0b',
};

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

        {/* Interview Rounds Stats */}
        {(stats.interviews?.active_count ?? 0) > 0 && (
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body p-5">
              <h2 className="text-sm font-semibold mb-4">Interview Activity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Left — stat numbers */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'In Interview', value: stats.interviews?.active_count, cls: 'text-warning' },
                      { label: 'Total Rounds', value: stats.interviews?.total_rounds, cls: 'text-base-content' },
                      { label: 'Avg Rating',   value: stats.interviews?.avg_rating ? `${stats.interviews.avg_rating}★` : '—', cls: 'text-warning' },
                    ].map(({ label, value, cls }) => (
                      <div key={label} className="bg-base-200 rounded-xl p-3">
                        <p className="text-xs text-base-content/50 leading-tight">{label}</p>
                        <p className={`text-xl font-bold mt-1 ${cls}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Round type breakdown as horizontal bars */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">By Type</p>
                    {Object.entries(stats.interviews?.by_type ?? {}).map(([type, count]) => {
                      const total = stats.interviews?.total_rounds ?? 1;
                      const pct   = Math.round((count / total) * 100);
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs capitalize text-base-content/70">{type.replace(/_/g, ' ')}</span>
                            <span className="text-xs font-medium">{count} <span className="text-base-content/40">({pct}%)</span></span>
                          </div>
                          <div className="h-1.5 bg-base-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: ROUND_TYPE_COLORS[type] ?? '#6366f1' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right — Pie chart */}
                {Object.keys(stats.interviews?.by_type ?? {}).length > 0 && (
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={Object.entries(stats.interviews?.by_type ?? {}).map(([type, count]) => ({
                            name: type.replace(/_/g, ' '),
                            value: count,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {Object.keys(stats.interviews?.by_type ?? {}).map((type) => (
                            <Cell key={type} fill={ROUND_TYPE_COLORS[type] ?? '#6366f1'} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid oklch(var(--b2))' }}
                          formatter={(value, name) => [value, (name as string).replace(/_/g, ' ')]}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => <span style={{ fontSize: 11, textTransform: 'capitalize' }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
              <button onClick={fetchInsights} disabled={aiLoading} className="btn btn-primary btn-sm gap-1.5">
                {aiLoading
                  ? <><span className="loading loading-spinner loading-xs" /> Analyzing...</>
                  : <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {insights ? 'Refresh' : 'Analyze'}
                    </>
                }
              </button>
            </div>

            {/* Loading skeleton */}
            {aiLoading && (
              <div className="space-y-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="skeleton h-4 w-1/3 rounded-full" />
                    <div className="skeleton h-3 w-full rounded-full" />
                    <div className="skeleton h-3 w-5/6 rounded-full" />
                    <div className="skeleton h-3 w-4/6 rounded-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Insights cards */}
            {insights && !aiLoading && (
              <div className="space-y-3">
                {insights
                  .split(/\n(?=\p{Emoji})/u)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((block, i) => {
                    const cleaned = block.replace(/^#{1,6}\s*/gm, '');
                    const firstNewline = cleaned.indexOf('\n');
                    const title = firstNewline > -1 ? cleaned.slice(0, firstNewline).trim() : cleaned;
                    const body  = firstNewline > -1 ? cleaned.slice(firstNewline).trim() : '';
                    return (
                      <div key={i} className="bg-base-200/60 border border-base-200 rounded-xl px-4 py-3">
                        <p className="text-sm font-semibold text-base-content">{title}</p>
                        {body && <p className="text-sm text-base-content/70 mt-1 leading-relaxed">{body}</p>}
                      </div>
                    );
                  })
                }
              </div>
            )}

            {!insights && !aiLoading && (
              <p className="text-sm text-base-content/40 text-center py-6">Click Analyze to get AI-powered insights on your pipeline.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
