import { useDraggable } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';
import type { JobApplication } from '@/types';

const PRIORITY_BADGE: Record<string, string> = {
  high:   'badge-error',
  medium: 'badge-warning',
  low:    'badge-success',
};

interface Props {
  application: JobApplication;
  isOverlay?: boolean;
}

function CardContent({ application }: { application: JobApplication }) {
  const rounds = application.interview_rounds_count ?? application.interview_rounds?.length ?? 0;

  return (
    <>
      <p className="text-sm font-semibold leading-tight">{application.company}</p>
      <p className="text-xs text-base-content/50 mt-0.5 truncate">{application.role}</p>
      <div className="flex items-center justify-between mt-2.5">
        <span className={`badge badge-sm ${PRIORITY_BADGE[application.priority] ?? 'badge-ghost'}`}>
          {application.priority}
        </span>
        {application.applied_date && (
          <span className="text-xs text-base-content/40">{application.applied_date}</span>
        )}
      </div>
      {rounds > 0 && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-base-200">
          <svg className="w-3 h-3 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-base-content/40">{rounds} interview{rounds > 1 ? 's' : ''}</span>
        </div>
      )}
    </>
  );
}

export default function ApplicationCard({ application, isOverlay = false }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: application.id });
  const navigate = useNavigate();

  if (isOverlay) {
    return (
      <div className="card bg-base-100 shadow-xl border border-primary w-60 p-3 rotate-2 scale-105 cursor-grabbing">
        <CardContent application={application} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => { if (!isDragging) navigate(`/applications/${application.id}`); }}
      className={`card bg-base-100 border border-base-200 p-3 cursor-grab select-none touch-none transition-all ${
        isDragging ? 'opacity-40 border-primary' : 'hover:shadow-md hover:-translate-y-0.5'
      }`}
    >
      <CardContent application={application} />
    </div>
  );
}
