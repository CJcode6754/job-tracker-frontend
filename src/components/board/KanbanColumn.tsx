import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ApplicationCard from './ApplicationCard';
import type { ApplicationStatus, JobApplication } from '@/types';

interface Props {
  status: ApplicationStatus;
  label: string;
  applications: JobApplication[];
}

export default function KanbanColumn({ status, label, applications }: Props) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className="bg-gray-100 rounded-xl p-3 w-72 flex-shrink-0 flex flex-col h-full max-h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-700">{label}</h3>
        <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">{applications.length}</span>
      </div>
      <SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-0.5">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}