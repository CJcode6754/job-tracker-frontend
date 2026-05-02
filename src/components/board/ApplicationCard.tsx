import { useDraggable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { JobApplication } from '@/types';
import CoverLetterGenerator from '@/components/ai/CoverLetterGenerator';

const PRIORITY_BADGE: Record<string, string> = {
  high:   'badge-error',
  medium: 'badge-warning',
  low:    'badge-success',
};

interface Props {
  application: JobApplication;
  isOverlay?: boolean;
}

function CardContent({ application, onCoverLetter }: { application: JobApplication; onCoverLetter: (e: React.MouseEvent) => void }) {
  const rounds = application.interview_rounds_count ?? application.interview_rounds?.length ?? 0;

  const salary = application.salary_min
    ? `${application.salary_currency ?? '$'}${(application.salary_min / 1000).toFixed(0)}k${application.salary_max ? `–${(application.salary_max / 1000).toFixed(0)}k` : '+'}`
    : null;

  const WORK_ICONS: Record<string, string> = { remote: '🌐', onsite: '🏢', hybrid: '🔀' };

  return (
    <>
      <p className="text-sm font-semibold leading-tight">{application.company}</p>
      <p className="text-xs text-base-content/50 mt-0.5 truncate">{application.role}</p>

      {/* Tags row: work type, employment type, location */}
      {(application.work_type || application.employment_type || application.location) && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {application.work_type && (
            <span className="badge badge-xs badge-ghost gap-0.5">
              {WORK_ICONS[application.work_type]} {application.work_type}
            </span>
          )}
          {application.employment_type && (
            <span className="badge badge-xs badge-ghost">
              {application.employment_type.replace(/_/g, ' ')}
            </span>
          )}
          {application.location && (
            <span className="badge badge-xs badge-ghost truncate max-w-[100px]">
              📍 {application.location}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center justify-between mt-2.5">
        <span className={`badge badge-sm ${PRIORITY_BADGE[application.priority] ?? 'badge-ghost'}`}>
          {application.priority}
        </span>
        <div className="flex items-center gap-2">
          {salary && (
            <span className="text-xs text-success font-medium">{salary}</span>
          )}
          {application.applied_date && (
            <span className="text-xs text-base-content/40">{application.applied_date}</span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-base-200">
        {rounds > 0 ? (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-base-content/40">{rounds} interview{rounds > 1 ? 's' : ''}</span>
          </div>
        ) : <span />}
        <button
          onClick={onCoverLetter}
          className="btn btn-ghost btn-xs gap-1 text-base-content/40 hover:text-primary hover:bg-primary/10"
          title="Generate cover letter"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Cover letter
        </button>
      </div>
    </>
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
      <div className="card bg-base-100 shadow-xl border border-primary w-60 p-3 rotate-2 scale-105 cursor-grabbing">
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
        onClick={() => { if (!isDragging) navigate(`/applications/${application.id}`); }}
        className={`card bg-base-100 border border-base-200 p-3 cursor-grab select-none touch-none transition-all ${
          isDragging ? 'opacity-40 border-primary' : 'hover:shadow-md hover:-translate-y-0.5'
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
              <button onClick={() => setShowCoverLetter(false)} className="btn btn-ghost btn-xs btn-circle">✕</button>
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
