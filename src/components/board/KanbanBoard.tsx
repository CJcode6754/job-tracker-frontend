import { useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useApplicationStore } from '@/store/useApplicationStore';
import KanbanColumn from './KanbanColumn';
import type { ApplicationStatus } from '@/types';

const COLUMNS: { id: ApplicationStatus; label: string }[] = [
  { id: 'wishlist',     label: 'Wishlist' },
  { id: 'applied',      label: 'Applied' },
  { id: 'phone_screen', label: 'Phone Screen' },
  { id: 'interview',    label: 'Interview' },
  { id: 'offer',        label: 'Offer' },
  { id: 'rejected',     label: 'Rejected' },
];

export default function KanbanBoard() {
  const { applications, fetchApplications, moveApplication } = useApplicationStore();

  useEffect(() => { fetchApplications(); }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveApplication(Number(active.id), over.id as ApplicationStatus);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden p-4 h-full bg-gray-50">
        {COLUMNS.map(({ id, label }) => (
          <KanbanColumn
            key={id}
            status={id}
            label={label}
            applications={applications.filter((a) => a.status === id)}
          />
        ))}
      </div>
    </DndContext>
  );
}