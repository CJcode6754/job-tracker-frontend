import { useState, useRef, useEffect } from 'react';
import KanbanBoard from '@/components/board/KanbanBoard';
import FilterBar from '@/components/board/FilterBar';
import ApplicationForm from '@/components/forms/ApplicationForm';
import Navbar from '@/components/layout/Navbar';
import { useExport } from '@/hooks/useExport';
import { useImport } from '@/hooks/useImport';
import { useApplicationStore } from '@/store/useApplicationStore';
import { toast } from 'sonner';

export default function Board() {
  const [showForm, setShowForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportToExcel, downloadTemplate } = useExport();
  const { importFromExcel } = useImport();
  const [showRejected, setShowRejected] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { applications, pagination, loading, fetchApplications, loadMore } = useApplicationStore();

  useEffect(() => {
    fetchApplications({
      show_rejected: showRejected ? 1 : 0,
      show_archived: showArchived ? 1 : 0
    });
  }, [showRejected, showArchived, fetchApplications]);

  const handleExport = () => {
    if (applications.length === 0) {
      toast.error('No applications to export.');
      return;
    }
    exportToExcel(applications);
    toast.success(`Exported ${applications.length} applications.`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await importFromExcel(file);
      await fetchApplications();
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-base-200/50">
      <Navbar />

      {/* Clean Header */}
      <div className="px-8 py-6 bg-base-100 border-b border-base-content/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Board</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] font-bold text-base-content/30 uppercase tracking-[0.2em]">
              {applications.length} {pagination && pagination.total > applications.length ? `/ ${pagination.total}` : ''} Applications
            </span>
            {pagination && pagination.current_page < pagination.last_page && (
              <button 
                onClick={() => loadMore()} 
                disabled={loading}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity"
              >
                {loading ? '...' : 'Load More'}
              </button>
            )}
            <div className="w-px h-3 bg-base-content/10 mx-1" />
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowRejected(!showRejected)}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${showRejected ? 'text-error' : 'text-base-content/30 hover:text-base-content/50'}`}
              >
                {showRejected ? 'Hide Rejected' : 'Show Rejected'}
              </button>
              <button 
                onClick={() => setShowArchived(!showArchived)}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${showArchived ? 'text-primary' : 'text-base-content/30 hover:text-base-content/50'}`}
              >
                {showArchived ? 'Hide Archive' : 'Show Archive'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center bg-base-200/50 rounded-xl p-1 border border-base-content/5">
            <button onClick={downloadTemplate} className="btn btn-ghost btn-xs text-[9px] font-black uppercase tracking-widest px-3">Template</button>
            <button onClick={() => fileInputRef.current?.click()} disabled={importing} className="btn btn-ghost btn-xs text-[9px] font-black uppercase tracking-widest px-3 border-x border-base-content/5">
              {importing ? '...' : 'Import'}
            </button>
            <button onClick={handleExport} className="btn btn-ghost btn-xs text-[9px] font-black uppercase tracking-widest px-3">Export</button>
          </div>

          <button 
            onClick={() => setShowForm(true)} 
            className="btn btn-primary btn-sm h-10 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New
          </button>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-base-100/50 border-b border-base-content/5 backdrop-blur-md">
          <FilterBar />
        </div>
        <div className="flex-1 overflow-hidden relative">
          <KanbanBoard showRejected={showRejected} showArchived={showArchived} />
        </div>
      </div>

      {/* Modal Overhaul */}
      {showForm && (
        <div className="modal modal-open backdrop-blur-sm bg-base-300/40">
          <div className="modal-box w-full max-w-2xl p-0 bg-base-100 rounded-3xl shadow-2xl border border-base-content/5 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-base-content/5 bg-base-200/50">
              <div>
                <h3 className="font-black text-xl tracking-tight">New Application</h3>
                <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mt-1">Add to your pipeline</p>
              </div>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm btn-circle opacity-40 hover:opacity-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ApplicationForm onClose={() => setShowForm(false)} />
          </div>
          <div className="modal-backdrop" onClick={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
}
