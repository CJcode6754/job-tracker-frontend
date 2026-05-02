import { useDroppable } from '@dnd-kit/core';
import ApplicationCard from './ApplicationCard';
import type { ApplicationStatus, JobApplication } from '@/types';

interface Props {
  status: ApplicationStatus;
  label: string;
  applications: JobApplication[];
  isDragging: boolean;
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  wishlist:     'bg-base-content/20',
  applied:      'bg-info',
  phone_screen: 'bg-secondary',
  interview:    'bg-warning',
  offer:        'bg-success',
  rejected:     'bg-error',
};

export default function KanbanColumn({ status, label, applications, isDragging }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col w-56 sm:w-64 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
          <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">{label}</span>
        </div>
        <span className="badge badge-sm badge-ghost">{applications.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 flex-1 overflow-y-auto p-2 rounded-xl min-h-20 transition-all ${
          isOver
            ? 'bg-primary/10 ring-2 ring-primary ring-offset-1'
            : isDragging
            ? 'bg-base-200/80'
            : 'bg-base-200/60'
        }`}
      >
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}
        {applications.length === 0 && (
          <div className={`flex items-center justify-center h-14 text-xs ${isOver ? 'text-primary' : 'text-base-content/30'}`}>
            {isOver ? 'Drop here' : 'No cards'}
          </div>
        )}
      </div>
    </div>
  );
}
