import { useDraggable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { JobApplication } from '@/types';
import CoverLetterGenerator from '@/components/ai/CoverLetterGenerator';

const PRIORITY_DOT: Record<string, string> = {
  high:   'bg-error shadow-sm shadow-error/40',
  medium: 'bg-warning shadow-sm shadow-warning/40',
  low:    'bg-success shadow-sm shadow-success/40',
};

interface Props {
  application: JobApplication;
  isOverlay?: boolean;
}

function CardContent({ application, onCoverLetter }: {
  application: JobApplication;
  onCoverLetter: (e: React.MouseEvent) => void;
}) {
  const rounds = application.interview_rounds_count ?? application.interview_rounds?.length ?? 0;
  const salary = application.salary_min
    ? `${application.salary_currency ?? '$'}${(application.salary_min / 1000).toFixed(0)}k${application.salary_max ? `–${(application.salary_max / 1000).toFixed(0)}k` : '+'}`
    : null;

  return (
    <div className="space-y-3">
      {/* Top row: priority dot + company */}
      <div className="flex items-start gap-2.5">
        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[application.priority] ?? 'bg-base-content/20'}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black leading-tight truncate tracking-tight">{application.company}</p>
          <p className="text-[11px] font-bold text-base-content/40 truncate mt-1 uppercase tracking-wider">{application.role}</p>
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-3 border-t border-base-content/5">
        <div className="flex items-center gap-3 min-w-0">
          {salary && (
            <span className="text-[10px] text-success font-black truncate">{salary}</span>
          )}
          {rounds > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <svg className="w-2.5 h-2.5 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">{rounds} {rounds > 1 ? 'Rounds' : 'Round'}</span>
            </div>
          )}
        </div>

        {/* Cover letter button */}
        <button
          onClick={onCoverLetter}
          className="btn btn-ghost btn-xs btn-circle text-base-content/20 hover:text-primary hover:bg-primary/10 transition-colors"
          title="Generate cover letter"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ApplicationCard({ application, isOverlay = false }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: application.id });
  const navigate = useNavigate();
  const [showCoverLetter, setShowCoverLetter] = useState(false);

  const handleCoverLetter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCoverLetter(true);
  };

  if (isOverlay) {
    return (
      <div className="bg-base-100 shadow-2xl border-2 border-primary rounded-2xl w-64 p-4 rotate-3 scale-105 cursor-grabbing z-50">
        <CardContent application={application} onCoverLetter={() => {}} />
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => { if (!isDragging) navigate(`/applications/${application.hash_id}`); }}
        className={`bg-base-100 border border-base-content/5 rounded-2xl p-4 cursor-grab select-none touch-none transition-all duration-200 ${
          isDragging
            ? 'opacity-30 scale-95'
            : 'hover:border-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'
        }`}
      >
        <CardContent application={application} onCoverLetter={handleCoverLetter} />
      </div>

      {showCoverLetter && (
        <div className="modal modal-open backdrop-blur-sm bg-base-300/40" onClick={() => setShowCoverLetter(false)}>
          <div className="modal-box w-full max-w-lg p-0 bg-base-100 rounded-3xl shadow-2xl border border-base-content/5 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-base-content/5 bg-base-200/50">
              <div>
                <h3 className="font-black text-sm tracking-tight uppercase">AI Cover Letter</h3>
                <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mt-1">{application.company} • {application.role}</p>
              </div>
              <button onClick={() => setShowCoverLetter(false)} className="btn btn-ghost btn-sm btn-circle opacity-40 hover:opacity-100">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CoverLetterGenerator
                company={application.company}
                role={application.role}
                notes={application.notes}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
