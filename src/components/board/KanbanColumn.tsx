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
  wishlist:     { dot: 'bg-base-content/30', bg: 'bg-base-200/40',   ring: 'ring-base-content/20' },
  applied:      { dot: 'bg-info',            bg: 'bg-info/5',        ring: 'ring-info/30' },
  phone_screen: { dot: 'bg-secondary',       bg: 'bg-secondary/5',   ring: 'ring-secondary/30' },
  interview:    { dot: 'bg-warning',         bg: 'bg-warning/5',     ring: 'ring-warning/30' },
  offer:        { dot: 'bg-success',         bg: 'bg-success/5',     ring: 'ring-success/30' },
  rejected:     { dot: 'bg-error',           bg: 'bg-error/5',       ring: 'ring-error/30' },
};

export default function KanbanColumn({ status, label, applications, isDragging }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col w-56 sm:w-64 shrink-0 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
          <span className="text-xs font-semibold text-base-content/70 uppercase tracking-wider">{label}</span>
        </div>
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
          applications.length > 0 ? 'bg-base-200 text-base-content/60' : 'text-base-content/30'
        }`}>
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-1.5 flex-1 overflow-y-auto p-2 rounded-xl min-h-16 transition-all duration-150 ${
          isOver
            ? `ring-2 ${config.ring} ${config.bg} ring-offset-1`
            : isDragging
            ? 'bg-base-200/50 ring-1 ring-base-200'
            : 'bg-base-200/40'
        }`}
      >
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}

        {applications.length === 0 && (
          <div className={`flex items-center justify-center flex-1 min-h-16 text-xs transition-colors ${
            isOver ? 'text-primary font-medium' : 'text-base-content/25'
          }`}>
            {isOver ? 'Drop here' : 'Empty'}
          </div>
        )}
      </div>
    </div>
  );
}
