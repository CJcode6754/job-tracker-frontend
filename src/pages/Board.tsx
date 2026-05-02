import { useState } from 'react';
import KanbanBoard from '@/components/board/KanbanBoard';
import FilterBar from '@/components/board/FilterBar';
import ApplicationForm from '@/components/forms/ApplicationForm';
import Navbar from '@/components/layout/Navbar';

export default function Board() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white shrink-0">
        <h1 className="text-lg font-bold text-gray-800">Board</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg"
        >
          + Add Application
        </button>
      </div>

      <div className="shrink-0">
        <FilterBar />
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-lg font-semibold mb-4">New Application</h2>
            <ApplicationForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
