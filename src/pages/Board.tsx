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
      <div className="flex items-center justify-between px-5 py-2.5 bg-base-100 border-b border-base-200 shrink-0">
        <div>
          <p className="text-sm font-semibold">Applications</p>
          <p className="text-xs text-base-content/50 mt-0.5">Drag cards to update status</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Application
        </button>
      </div>

      <div className="shrink-0"><FilterBar /></div>
      <div className="flex-1 overflow-hidden"><KanbanBoard /></div>

      {/* Modal */}
      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-lg p-0 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-base-200 shrink-0">
              <h3 className="font-semibold text-sm">New Application</h3>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-xs btn-circle">✕</button>
            </div>
            <div className="overflow-y-auto flex-1">
              <ApplicationForm onClose={() => setShowForm(false)} />
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
}
