import { useState } from 'react';
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
  { id: 'archived',     label: 'Archived' },
];

const VALID_STATUSES: string[] = ['wishlist', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'archived'];

function CardSkeleton() {
  return (
    <div className="bg-base-100 border border-base-200 rounded-xl p-3 space-y-2">
      <div className="flex items-start gap-2">
        <div className="skeleton w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-3 w-3/4 rounded" />
          <div className="skeleton h-2.5 w-1/2 rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-1.5 border-t border-base-200/70">
        <div className="skeleton h-2.5 w-1/3 rounded" />
        <div className="skeleton w-5 h-5 rounded-full" />
      </div>
    </div>
  );
}

function ColumnSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col min-w-48 flex-1 h-full">
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <div className="skeleton w-2 h-2 rounded-full" />
          <div className="skeleton h-2.5 w-20 rounded" />
        </div>
        <div className="skeleton h-4 w-5 rounded-full" />
      </div>
      <div className="flex flex-col gap-1.5 flex-1 p-2 rounded-xl bg-base-200/40">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Realistic card counts per column for the skeleton
const SKELETON_COUNTS = [3, 4, 2, 3, 1];

export default function KanbanBoard({ 
  showRejected = false, 
  showArchived = false 
}: { 
  showRejected?: boolean; 
  showArchived?: boolean; 
}) {
  const { applications, loading, moveApplication } = useApplicationStore();
  const [activeCard, setActiveCard] = useState<JobApplication | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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

  if (loading) {
    return (
      <div className="flex gap-3 p-4 h-full overflow-x-auto overflow-y-hidden pb-4 min-w-0">
        {SKELETON_COUNTS.map((count, i) => (
          <ColumnSkeleton key={i} count={count} />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 p-4 h-full overflow-x-auto overflow-y-hidden pb-4 min-w-0">
        {COLUMNS.filter(col => {
          if (col.id === 'rejected') return showRejected;
          if (col.id === 'archived') return showArchived;
          return true;
        }).map(({ id, label }) => (
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
