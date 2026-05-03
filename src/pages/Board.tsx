import { useState } from 'react';
import KanbanBoard from '@/components/board/KanbanBoard';
import FilterBar from '@/components/board/FilterBar';
import ApplicationForm from '@/components/forms/ApplicationForm';
import Navbar from '@/components/layout/Navbar';

export default function Board() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-base-200">
      <Navbar />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-base-100 border-b border-base-200 shrink-0">
        <div>
          <p className="text-sm font-semibold">Applications</p>
          <p className="text-xs text-base-content/50 mt-0.5 hidden sm:block">Drag cards to update status</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Application</span>
          <span className="sm:hidden">Add</span>
        </button>
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
