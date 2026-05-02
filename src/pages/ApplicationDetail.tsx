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

  if (!application) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{application.company}</h1>
          <p className="text-gray-600">{application.role}</p>
        </div>
        <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm">
          Delete
        </button>
      </div>

      {/* Interview Rounds Section */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Interview Rounds</h2>
        {application.interview_rounds.map((round) => (
          <div key={round.id} className="border rounded-lg p-3 mb-2">
            <p className="font-medium">{round.type} — {round.date}</p>
            <p className="text-sm text-gray-600">{round.notes}</p>
          </div>
        ))}
      </section>

      {/* ✍️ AI Cover Letter Generator */}
      <CoverLetterGenerator
        company={application.company}
        role={application.role}
        notes={application.notes}
      />
      </div>
    </div>
  );
}