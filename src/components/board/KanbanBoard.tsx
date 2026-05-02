import { useEffect, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, rectIntersection } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useApplicationStore } from '@/store/useApplicationStore';
import KanbanColumn from './KanbanColumn';
import ApplicationCard from './ApplicationCard';
import type { ApplicationStatus, JobApplication } from '@/types';

const COLUMNS: { id: ApplicationStatus; label: string }[] = [
  { id: 'wishlist',     label: 'Wishlist' },
  { id: 'applied',      label: 'Applied' },
  { id: 'phone_screen', label: 'Phone Screen' },
  { id: 'interview',    label: 'Interview' },
  { id: 'offer',        label: 'Offer' },
  { id: 'rejected',     label: 'Rejected' },
];

const VALID_STATUSES: string[] = ['wishlist', 'applied', 'phone_screen', 'interview', 'offer', 'rejected'];

export default function KanbanBoard() {
  const { applications, fetchApplications, moveApplication } = useApplicationStore();
  const [activeCard, setActiveCard] = useState<JobApplication | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleDragStart = (event: { active: { id: string | number } }) => {
    setActiveCard(applications.find((a) => a.id === Number(event.active.id)) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    const targetStatus = VALID_STATUSES.includes(overId)
      ? overId
      : applications.find((a) => a.id === Number(over.id))?.status;
    const currentStatus = applications.find((a) => a.id === Number(active.id))?.status;
    if (targetStatus && targetStatus !== currentStatus) {
      moveApplication(Number(active.id), targetStatus as ApplicationStatus);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 p-4 h-full overflow-x-auto overflow-y-hidden">
        {COLUMNS.map(({ id, label }) => (
          <KanbanColumn
            key={id}
            status={id}
            label={label}
            applications={applications.filter((a) => a.status === id)}
            isDragging={!!activeCard}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCard ? <ApplicationCard application={activeCard} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
