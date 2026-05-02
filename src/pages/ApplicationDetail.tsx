import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import type { JobApplication } from '@/types';
import { useApplicationStore } from '@/store/useApplicationStore';
import CoverLetterGenerator from '@/components/ai/CoverLetterGenerator';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteApplication } = useApplicationStore();
  const [application, setApplication] = useState<JobApplication | null>(null);

  useEffect(() => {
    api.get(`/applications/${id}`).then(({ data }) => setApplication(data));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this application?')) return;
    await deleteApplication(Number(id));
    toast.success('Deleted');
    navigate('/');
  };

  if (!application) return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 py-8 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{application.company}</h1>
            <p className="text-sm text-base-content/50 mt-0.5">{application.role}</p>
          </div>
          <button onClick={handleDelete} className="btn btn-ghost btn-sm text-error hover:bg-error/10">
            Delete
          </button>
        </div>

        {/* Interview Rounds */}
        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body p-5">
            <h2 className="text-sm font-semibold mb-3">Interview Rounds</h2>
            {application.interview_rounds.length === 0 ? (
              <p className="text-sm text-base-content/40">No interview rounds yet.</p>
            ) : (
              <div className="space-y-2">
                {application.interview_rounds.map((round) => (
                  <div key={round.id} className="bg-base-200 rounded-lg px-4 py-3">
                    <p className="text-sm font-medium">
                      {round.type?.replace('_', ' ')} — {round.date}
                    </p>
                    {round.notes && <p className="text-xs text-base-content/50 mt-1">{round.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cover Letter */}
        <CoverLetterGenerator
          company={application.company}
          role={application.role}
          notes={application.notes}
        />
      </div>
    </div>
  );
}
