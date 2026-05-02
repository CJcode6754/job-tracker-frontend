import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAiInsights } from '@/hooks/useAi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '@/components/layout/Navbar';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const { insights, loading: aiLoading, fetchInsights } = useAiInsights();

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6 space-y-6">

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Applications', value: stats.total },
          { label: 'Active',             value: stats.active },
          { label: 'Offers',             value: stats.offers },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border p-5 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Applications by Status</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={stats.by_status}>
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🤖 AI Pipeline Insights */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">🤖 AI Pipeline Insights</h2>
          <button
            onClick={fetchInsights}
            disabled={aiLoading}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            {aiLoading ? 'Analyzing...' : insights ? 'Refresh' : 'Analyze My Pipeline'}
          </button>
        </div>

        {aiLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        )}

        {insights && !aiLoading && (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{insights}</p>
        )}

        {!insights && !aiLoading && (
          <p className="text-sm text-gray-400">
            Click "Analyze My Pipeline" to get AI-powered insights about your job search.
          </p>
        )}
      </div>
      </div>
    </div>
  );
}