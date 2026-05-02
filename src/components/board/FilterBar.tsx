import { useState, useCallback } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';

export default function FilterBar() {
  const { fetchApplications } = useApplicationStore();
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [priority, setPriority] = useState('all');

  const applyFilters = useCallback(
    (s: string, st: string, p: string) => {
      const timer = setTimeout(() => {
        fetchApplications({ search: s, status: st, priority: p });
      }, 400);
      return () => clearTimeout(timer);
    },
    [fetchApplications]
  );

  return (
    <div className="flex items-center gap-2 px-5 py-2 bg-base-100 border-b border-base-200">
      <label className="input input-sm flex items-center gap-2 flex-1 max-w-xs">
        <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search company or role..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); applyFilters(e.target.value, status, priority); }}
          className="grow"
        />
      </label>

      <select
        className="select select-sm"
        value={status}
        onChange={(e) => { setStatus(e.target.value); applyFilters(search, e.target.value, priority); }}
      >
        <option value="all">All statuses</option>
        {['wishlist', 'applied', 'phone_screen', 'interview', 'offer', 'rejected'].map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
        ))}
      </select>

      <select
        className="select select-sm"
        value={priority}
        onChange={(e) => { setPriority(e.target.value); applyFilters(search, status, e.target.value); }}
      >
        <option value="all">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
}
