import { useState, useCallback } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function FilterBar() {
  const { fetchApplications } = useApplicationStore();
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [priority, setPriority] = useState('all');

  const applyFilters = useCallback(
    debounce((s: string, st: string, p: string) => {
      fetchApplications({ search: s, status: st, priority: p });
    }, 400),
    []
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters(value, status, priority);
  };

  return (
    <div className="flex gap-3 p-4 bg-white border-b">
      <input
        type="text"
        placeholder="Search company or role..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm flex-1"
      />
      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value); applyFilters(search, e.target.value, priority); }}
        className="border rounded-lg px-3 py-2 text-sm"
      >
        <option value="all">All Statuses</option>
        {['wishlist','applied','phone_screen','interview','offer','rejected'].map(s =>
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        )}
      </select>
      <select
        value={priority}
        onChange={(e) => { setPriority(e.target.value); applyFilters(search, status, e.target.value); }}
        className="border rounded-lg px-3 py-2 text-sm"
      >
        <option value="all">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
}