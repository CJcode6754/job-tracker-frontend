import { useState, useEffect } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';

export default function FilterBar() {
  const { fetchApplications } = useApplicationStore();
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [priority, setPriority] = useState('all');
  const [perPage, setPerPage]   = useState(50);

  // Debounce search and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications({ 
        search, 
        status: status === 'all' ? '' : status, 
        priority: priority === 'all' ? '' : priority, 
        per_page: perPage 
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, status, priority, perPage, fetchApplications]);

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-base-100/80 backdrop-blur-md border-b border-base-content/5">
      <div className="relative group flex-1 min-w-[240px] max-w-xs">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-base-content/20 group-focus-within:text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Filter applications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-base-200 border-none rounded-2xl py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 placeholder:text-base-content/20 transition-all shadow-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          className="select select-sm bg-base-200 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all h-9 shadow-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Status: All</option>
          {['wishlist', 'applied', 'phone_screen', 'interview', 'offer', 'rejected'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>

        <select
          className="select select-sm bg-base-200 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all h-9 shadow-sm"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="all">Priority: All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className="select select-sm bg-base-200 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all h-9 shadow-sm"
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
        >
          <option value={20}>Show 20</option>
          <option value={50}>Show 50</option>
          <option value={100}>Show 100</option>
        </select>
      </div>
    </div>
  );
}
