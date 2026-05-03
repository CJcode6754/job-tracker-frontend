import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { useAiInsights } from '@/hooks/useAi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
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
  technical:    'var(--color-primary)',
  hr:           'var(--color-secondary)',
  system_design:'var(--color-success)',
  take_home:    'var(--color-error)',
};

const STATUS_COLORS: Record<string, string> = {
  wishlist:     'var(--color-neutral)',
  applied:      'var(--color-primary)',
  phone_screen: 'var(--color-secondary)',
  interview:    'var(--color-warning)',
  offer:        'var(--color-success)',
  rejected:     'var(--color-error)',
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { insights, loading: aiLoading, fetchInsights } = useAiInsights();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return (
    <div className="min-h-screen bg-base-300 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-3">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-sm font-bold tracking-widest uppercase opacity-20">Initializing Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-base-200/50 overflow-hidden">
      <Navbar />
      
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight">Performance</h1>
          <p className="text-base-content/50 mt-2 font-medium">Real-time insights into your application pipeline.</p>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Main Stats Card */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Applications', value: stats.total, color: 'primary', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
              { label: 'Active Pipeline', value: stats.active, color: 'secondary', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { label: 'Job Offers', value: stats.offers, color: 'success', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            ].map((s) => (
              <div key={s.label} className="group relative bg-base-100 rounded-3xl p-6 border border-base-content/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-10 h-10 rounded-2xl bg-${s.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <svg className={`w-5 h-5 text-${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-base-content/40">{s.label}</p>
                <p className="text-4xl font-black mt-2">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Interview Activity Mini-Card */}
          <div className="bg-neutral text-neutral-content rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full translate-x-10 -translate-y-10" />
            <div className="relative z-10">
              <h2 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6">Current Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Interview</span>
                  <span className="text-2xl font-black text-warning">{stats.interviews?.active_count ?? 0}</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-warning h-full w-[40%]" />
                </div>
                <p className="text-[10px] opacity-40">Average Rating: <span className="font-bold opacity-100">{stats.interviews?.avg_rating ?? '—'}</span></p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/board')} 
              className="btn btn-primary btn-sm rounded-xl mt-6 relative z-10"
            >
              View Schedule
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Charts Section */}
          <div className="space-y-8">
            {/* By Status Chart */}
            <div className="bg-base-100 rounded-3xl p-8 border border-base-content/5 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black tracking-tight">Status Distribution</h2>
                <div className="badge badge-outline badge-sm opacity-40 font-bold tracking-widest">REAL-TIME</div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.by_status} barSize={32} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <XAxis 
                      dataKey="status" 
                      tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor', opacity: 0.4 }} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(v) => v.replace('_', ' ').toUpperCase()} 
                    />
                    <YAxis allowDecimals={false} hide />
                    <Tooltip
                      cursor={{ fill: 'var(--color-base-content)', opacity: 0.05 }}
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: 'var(--color-base-100)',
                        color: 'var(--color-base-content)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      itemStyle={{ color: 'var(--color-base-content)' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 8, 8]}>
                      {stats.by_status.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? 'var(--color-primary)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* By Week/Activity (Placeholder or secondary chart) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="bg-base-100 rounded-3xl p-6 border border-base-content/5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4 text-center">Round Types</h3>
                  <div className="h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(stats.interviews?.by_type ?? {}).map(([type, count]) => ({
                            name: type.replace(/_/g, ' ').toUpperCase(),
                            value: count,
                          }))}
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {Object.keys(stats.interviews?.by_type ?? {}).map((type) => (
                            <Cell key={type} fill={ROUND_TYPE_COLORS[type] ?? 'var(--color-primary)'} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            backgroundColor: 'var(--color-base-100)',
                            color: 'var(--color-base-content)',
                            fontSize: '10px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="bg-base-100 rounded-3xl p-6 border border-base-content/5 shadow-sm flex flex-col justify-center">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">Success Index</p>
                  <p className="text-5xl font-black text-primary">84<span className="text-xl opacity-30">%</span></p>
                  <p className="text-[10px] font-medium opacity-40 mt-2">↑ 12% from last month</p>
               </div>
            </div>
          </div>

          {/* AI Side Panel */}
          <div className="bg-base-100 rounded-3xl p-8 border border-base-content/5 shadow-sm flex flex-col h-[650px] lg:sticky lg:top-8">
             <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-lg font-black tracking-tight">AI Insights</h2>
                <p className="text-xs font-bold tracking-widest text-primary mt-1 uppercase">Advanced Analysis</p>
              </div>
              <button 
                onClick={fetchInsights} 
                disabled={aiLoading} 
                className={`btn btn-circle ${aiLoading ? 'btn-ghost' : 'btn-primary'} shadow-lg shadow-primary/20`}
              >
                {aiLoading 
                  ? <span className="loading loading-spinner loading-sm" /> 
                  : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                }
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
               {aiLoading ? (
                  <div className="space-y-6">
                    {[1,2,3].map(i => (
                      <div key={i} className="space-y-3">
                        <div className="skeleton h-4 w-24 rounded-full opacity-50" />
                        <div className="skeleton h-3 w-full rounded-full opacity-30" />
                        <div className="skeleton h-3 w-5/6 rounded-full opacity-30" />
                      </div>
                    ))}
                  </div>
               ) : insights ? (
                 insights
                  .split(/\n(?=\p{Emoji})/u)
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((block, i) => {
                    const cleaned = block.replace(/^#{1,6}\s*/gm, '');
                    const firstNewline = cleaned.indexOf('\n');
                    const title = firstNewline > -1 ? cleaned.slice(0, firstNewline).trim() : cleaned;
                    const body  = firstNewline > -1 ? cleaned.slice(firstNewline).trim() : '';
                    return (
                      <div key={i} className="group p-5 rounded-2xl bg-base-200/50 hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all cursor-default">
                        <h3 className="text-sm font-black text-base-content group-hover:text-primary transition-colors">{title}</h3>
                        {body && <p className="text-xs text-base-content/60 mt-2 leading-relaxed font-medium">{body}</p>}
                      </div>
                    );
                  })
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20">
                    <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-sm font-bold uppercase tracking-widest">No Analysis Ready</p>
                 </div>
               )}
            </div>

            <div className="mt-8 p-4 bg-base-200 rounded-2xl border border-base-content/5">
               <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest text-center">
                 Gemini Analysis Engine
               </p>
            </div>
        </div>
      </div>
    </div>
  </div>
</div>
);
}
