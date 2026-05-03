import { useDraggable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { JobApplication } from '@/types';
import CoverLetterGenerator from '@/components/ai/CoverLetterGenerator';

const PRIORITY_DOT: Record<string, string> = {
  high:   'bg-error',
  medium: 'bg-warning',
  low:    'bg-success',
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
    <div className="space-y-2">
      {/* Top row: priority dot + company */}
      <div className="flex items-start gap-2">
        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[application.priority] ?? 'bg-base-content/30'}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight truncate">{application.company}</p>
          <p className="text-xs text-base-content/50 truncate mt-0.5">{application.role}</p>
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-1.5 border-t border-base-200/70">
        <div className="flex items-center gap-2 min-w-0">
          {application.work_type && (
            <span className="text-xs text-base-content/40 capitalize">{application.work_type}</span>
          )}
          {salary && (
            <span className="text-xs text-success font-medium truncate">{salary}</span>
          )}
          {rounds > 0 && (
            <span className="text-xs text-base-content/40">{rounds} round{rounds > 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Cover letter button */}
        <button
          onClick={onCoverLetter}
          className="btn btn-ghost btn-xs btn-circle text-base-content/30 hover:text-primary hover:bg-primary/10"
          title="Generate cover letter"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
      <div className="bg-base-100 shadow-2xl border-2 border-primary rounded-xl w-56 p-3 rotate-2 scale-105 cursor-grabbing">
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
        className={`bg-base-100 border border-base-200 rounded-xl p-3 cursor-grab select-none touch-none transition-all ${
          isDragging
            ? 'opacity-30 scale-95'
            : 'hover:border-base-300 hover:shadow-sm active:scale-[0.98]'
        }`}
      >
        <CardContent application={application} onCoverLetter={handleCoverLetter} />
      </div>

      {showCoverLetter && (
        <div className="modal modal-open" onClick={() => setShowCoverLetter(false)}>
          <div className="modal-box w-full max-w-lg p-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-base-200">
              <div>
                <h3 className="font-semibold text-sm">Cover Letter</h3>
                <p className="text-xs text-base-content/50 mt-0.5">{application.company} — {application.role}</p>
              </div>
              <button onClick={() => setShowCoverLetter(false)} className="btn btn-ghost btn-xs btn-circle">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
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
