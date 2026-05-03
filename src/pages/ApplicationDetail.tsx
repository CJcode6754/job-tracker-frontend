import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import type { JobApplication, InterviewRound } from '@/types';
import { useApplicationStore } from '@/store/useApplicationStore';
import Navbar from '@/components/layout/Navbar';
import InterviewRoundForm, { type InterviewRoundFormData } from '@/components/forms/InterviewRoundForm';
import { toast } from 'sonner';

const TYPE_COLORS: Record<string, string> = {
  technical:    'badge-info',
  hr:           'badge-success',
  system_design:'badge-warning',
  take_home:    'badge-secondary',
};

function StarDisplay({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <span key={s} className={`text-sm ${s <= rating ? 'text-warning' : 'text-base-content/20'}`}>★</span>
      ))}
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteApplication } = useApplicationStore();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [showAddRound, setShowAddRound]   = useState(false);
  const [editingRound, setEditingRound]   = useState<InterviewRound | null>(null);
  const [deletingId, setDeletingId]       = useState<number | null>(null);

  useEffect(() => {
    api.get(`/applications/${id}`).then(({ data }) => setApplication(data));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this application?')) return;
    await deleteApplication(Number(id));
    toast.success('Deleted');
    navigate('/');
  };

  const handleAddRound = async (data: InterviewRoundFormData) => {
    const { data: round } = await api.post(`/applications/${id}/interview-rounds`, data);
    setApplication((prev) => prev ? { ...prev, interview_rounds: [...prev.interview_rounds, round] } : prev);
    setShowAddRound(false);
    toast.success('Interview round added');
  };

  const handleUpdateRound = async (data: InterviewRoundFormData) => {
    if (!editingRound) return;
    const { data: updated } = await api.put(`/applications/${id}/interview-rounds/${editingRound.id}`, data);
    setApplication((prev) => prev ? {
      ...prev,
      interview_rounds: prev.interview_rounds.map((r) => r.id === editingRound.id ? updated : r),
    } : prev);
    setEditingRound(null);
    toast.success('Round updated');
  };

  const handleDeleteRound = async (roundId: number) => {
    if (!confirm('Delete this interview round?')) return;
    setDeletingId(roundId);
    await api.delete(`/applications/${id}/interview-rounds/${roundId}`);
    setApplication((prev) => prev ? {
      ...prev,
      interview_rounds: prev.interview_rounds.filter((r) => r.id !== roundId),
    } : prev);
    setDeletingId(null);
    toast.success('Round deleted');
  };

  if (!application) return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    </div>
  );

  const salary = application.salary_min
    ? `${application.salary_currency ?? 'USD'} ${application.salary_min.toLocaleString()}${application.salary_max ? ` – ${application.salary_max.toLocaleString()}` : '+'}`
    : null;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-5 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{application.company}</h1>
              <span className="badge badge-ghost badge-sm capitalize">{application.status.replace(/_/g, ' ')}</span>
              <span className={`badge badge-sm ${application.priority === 'high' ? 'badge-error' : application.priority === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                {application.priority}
              </span>
            </div>
            <p className="text-sm text-base-content/50 mt-0.5">{application.role}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {application.location && <span className="text-xs text-base-content/50">📍 {application.location}</span>}
              {application.work_type && <span className="text-xs text-base-content/50 capitalize">· {application.work_type}</span>}
              {application.employment_type && <span className="text-xs text-base-content/50 capitalize">· {application.employment_type.replace(/_/g, ' ')}</span>}
              {salary && <span className="text-xs text-success font-medium">· {salary}</span>}
              {application.job_url && (
                <a href={application.job_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">· View Job Post ↗</a>
              )}
            </div>
          </div>
          <button onClick={handleDelete} className="btn btn-ghost btn-sm text-error hover:bg-error/10 shrink-0">
            Delete
          </button>
        </div>

        {/* Dates */}
        {(application.applied_date || application.deadline) && (
          <div className="flex gap-4 flex-wrap">
            {application.applied_date && (
              <div className="text-xs text-base-content/50">
                <span className="font-medium text-base-content">Applied:</span> {application.applied_date}
              </div>
            )}
            {application.deadline && (
              <div className="text-xs text-base-content/50">
                <span className="font-medium text-base-content">Deadline:</span> {application.deadline}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {application.notes && (
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body p-5">
              <h2 className="text-sm font-semibold mb-2">Notes</h2>
              <p className="text-sm text-base-content/70 whitespace-pre-wrap leading-relaxed">{application.notes}</p>
            </div>
          </div>
        )}

        {/* Interview Rounds — only shown when status is interview */}
        {application.status === 'interview' && (
        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold">Interview Rounds</h2>
                <p className="text-xs text-base-content/40 mt-0.5">{application.interview_rounds.length} round{application.interview_rounds.length !== 1 ? 's' : ''}</p>
              </div>
              {!showAddRound && (
                <button onClick={() => setShowAddRound(true)} className="btn btn-primary btn-sm gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Round
                </button>
              )}
            </div>

            {/* Add form */}
            {showAddRound && (
              <div className="bg-base-200 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">New Round</p>
                <InterviewRoundForm onSubmit={handleAddRound} onCancel={() => setShowAddRound(false)} />
              </div>
            )}

            {/* Rounds list */}
            {application.interview_rounds.length === 0 && !showAddRound ? (
              <div className="text-center py-8">
                <p className="text-sm text-base-content/40">No interview rounds yet.</p>
                <p className="text-xs text-base-content/30 mt-1">Click "Add Round" to track your interviews.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {application.interview_rounds.map((round) => (
                  <div key={round.id}>
                    {editingRound?.id === round.id ? (
                      <div className="bg-base-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-3">Edit Round</p>
                        <InterviewRoundForm
                          defaultValues={{
                            type: round.type,
                            date: round.date,
                            interviewer_name: round.interviewer_name,
                            notes: round.notes,
                            self_rating: round.self_rating,
                          }}
                          onSubmit={handleUpdateRound}
                          onCancel={() => setEditingRound(null)}
                        />
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 bg-base-200 rounded-xl px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`badge badge-sm ${TYPE_COLORS[round.type] ?? 'badge-ghost'}`}>
                              {round.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </span>
                            {round.date && <span className="text-xs text-base-content/50">{round.date}</span>}
                            {round.interviewer_name && <span className="text-xs text-base-content/50">· {round.interviewer_name}</span>}
                          </div>
                          {round.self_rating && <StarDisplay rating={round.self_rating} />}
                          {round.notes && <p className="text-xs text-base-content/60 mt-1.5 leading-relaxed">{round.notes}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => setEditingRound(round)} className="btn btn-ghost btn-xs btn-circle">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteRound(round.id)}
                            disabled={deletingId === round.id}
                            className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
                          >
                            {deletingId === round.id
                              ? <span className="loading loading-spinner loading-xs" />
                              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            }
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

      </div>
    </div>
  );
}
