import { useDroppable } from '@dnd-kit/core';
import ApplicationCard from './ApplicationCard';
import type { ApplicationStatus, JobApplication } from '@/types';

interface Props {
  status: ApplicationStatus;
  label: string;
  applications: JobApplication[];
  isDragging: boolean;
}

const STATUS_CONFIG: Record<ApplicationStatus, { dot: string; bg: string; ring: string }> = {
  wishlist:     { dot: 'bg-base-content/30', bg: 'bg-base-200/40',   ring: 'ring-base-content/10' },
  applied:      { dot: 'bg-primary shadow-sm shadow-primary/40',    bg: 'bg-primary/5',     ring: 'ring-primary/20' },
  phone_screen: { dot: 'bg-secondary shadow-sm shadow-secondary/40', bg: 'bg-secondary/5',   ring: 'ring-secondary/20' },
  interview:    { dot: 'bg-warning shadow-sm shadow-warning/40',   bg: 'bg-warning/5',     ring: 'ring-warning/20' },
  offer:        { dot: 'bg-success shadow-sm shadow-success/40',   bg: 'bg-success/5',     ring: 'ring-success/20' },
  rejected:     { dot: 'bg-error shadow-sm shadow-error/40',       bg: 'bg-error/5',       ring: 'ring-error/20' },
  archived:     { dot: 'bg-base-content/20',                      bg: 'bg-base-300/20',   ring: 'ring-base-content/10' },
};

export default function KanbanColumn({ status, label, applications, isDragging }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col min-w-[280px] sm:min-w-[320px] flex-1 h-full max-w-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
          <span className="text-[11px] font-black text-base-content/40 uppercase tracking-widest">{label}</span>
        </div>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
          applications.length > 0 ? 'bg-base-300 text-base-content/60' : 'text-base-content/20'
        }`}>
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 flex-1 overflow-y-auto p-3 rounded-3xl min-h-24 transition-all duration-300 ${
          isOver
            ? `ring-2 ${config.ring} ${config.bg} shadow-inner`
            : isDragging
            ? 'bg-base-200/40 ring-1 ring-base-content/5'
            : 'bg-base-200/20'
        }`}
      >
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}

        {applications.length === 0 && (
          <div className={`flex flex-col items-center justify-center flex-1 min-h-32 rounded-2xl border-2 border-dashed transition-all ${
            isOver ? 'border-primary/40 bg-primary/5 text-primary' : 'border-base-content/5 text-base-content/10'
          }`}>
            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">{isOver ? 'Drop here' : 'Empty Column'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
