import { useState, useRef } from 'react';
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
  const { applications, fetchApplications } = useApplicationStore();

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
    <div className="flex flex-col h-screen overflow-hidden bg-base-200">
      <Navbar />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-base-100 border-b border-base-200 shrink-0">
        <div>
          <p className="text-sm font-semibold">Applications</p>
          <p className="text-xs text-base-content/50 mt-0.5 hidden sm:block">Drag cards to update status</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Template */}
          <button onClick={downloadTemplate} className="btn btn-ghost btn-sm gap-1.5" title="Download import template">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Template</span>
          </button>

          {/* Import */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="btn btn-ghost btn-sm gap-1.5"
            title="Import CSV"
          >
            {importing
              ? <span className="loading loading-spinner loading-xs" />
              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            }
            <span className="hidden sm:inline">{importing ? 'Importing...' : 'Import'}</span>
          </button>

          {/* Export */}
          <button onClick={handleExport} className="btn btn-ghost btn-sm gap-1.5" title="Export CSV">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Export</span>
          </button>

          <div className="w-px h-4 bg-base-200" />

          {/* Add */}
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="shrink-0"><FilterBar /></div>
      <div className="flex-1 overflow-hidden"><KanbanBoard /></div>

      {/* Modal */}
      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-lg p-0 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-base-200 sticky top-0 bg-base-100 z-10">
              <h3 className="font-semibold text-sm">New Application</h3>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-xs btn-circle">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
