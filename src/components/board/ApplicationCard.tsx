import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import type { JobApplication } from '@/types';

const PRIORITY_COLORS = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-green-100 text-green-700',
};

export default function ApplicationCard({ application }: { application: JobApplication }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: application.id });
  const navigate = useNavigate();

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => navigate(`/applications/${application.id}`)}
      className="bg-white rounded-lg p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <p className="font-semibold text-sm text-gray-800">{application.company}</p>
      <p className="text-xs text-gray-500 mt-0.5">{application.role}</p>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[application.priority]}`}>
          {application.priority}
        </span>
        {application.applied_date && (
          <span className="text-xs text-gray-400">{application.applied_date}</span>
        )}
      </div>
    </div>
  );
}