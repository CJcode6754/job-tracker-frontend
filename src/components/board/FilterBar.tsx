import { useState, useCallback } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';

export default function FilterBar() {
  const { fetchApplications } = useApplicationStore();
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [priority, setPriority] = useState('all');
  const [perPage, setPerPage]   = useState(50);

  const applyFilters = useCallback(
    (s: string, st: string, p: string, pp: number) => {
      const timer = setTimeout(() => {
        fetchApplications({ search: s, status: st, priority: p, per_page: pp });
      }, 400);
      return () => clearTimeout(timer);
    },
    [fetchApplications]
  );

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-base-100 border-b border-base-200">
      <label className="input input-sm flex items-center gap-2 w-64">
        <svg className="w-3.5 h-3.5 opacity-50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); applyFilters(e.target.value, status, priority, perPage); }}
          className="grow min-w-0"
        />
      </label>

      <select
        className="select select-sm w-40"
        value={status}
        onChange={(e) => { setStatus(e.target.value); applyFilters(search, e.target.value, priority, perPage); }}
      >
        <option value="all">All statuses</option>
        {['wishlist', 'applied', 'phone_screen', 'interview', 'offer', 'rejected'].map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
        ))}
      </select>

      <select
        className="select select-sm w-40"
        value={priority}
        onChange={(e) => { setPriority(e.target.value); applyFilters(search, status, e.target.value, perPage); }}
      >
        <option value="all">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        className="select select-sm w-40"
        value={perPage}
        onChange={(e) => { 
          const val = Number(e.target.value);
          setPerPage(val); 
          applyFilters(search, status, priority, val); 
        }}
      >
        <option value={20}>20 per page</option>
        <option value={50}>50 per page</option>
        <option value={100}>100 per page</option>
        <option value={200}>200 per page</option>
      </select>
    </div>
  );
}
