import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import type { JobApplication, InterviewRound } from '@/types';
import { useApplicationStore } from '@/store/useApplicationStore';
import Navbar from '@/components/layout/Navbar';
import InterviewRoundForm, { type InterviewRoundFormData } from '@/components/forms/InterviewRoundForm';
import { toast } from 'sonner';

const STATUS_STYLES: Record<string, string> = {
  wishlist:     'bg-base-content/10 text-base-content',
  applied:      'bg-info/15 text-info',
  phone_screen: 'bg-secondary/15 text-secondary',
  interview:    'bg-warning/15 text-warning',
  offer:        'bg-success/15 text-success',
  rejected:     'bg-error/15 text-error',
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

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-base-content/40 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm text-base-content mt-0.5">{value}</p>
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteApplication, updateApplication } = useApplicationStore();
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [notFound, setNotFound]           = useState(false);
  const [showAddRound, setShowAddRound]   = useState(false);
  const [editingRound, setEditingRound]   = useState<InterviewRound | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/applications/${id}`)
      .then(({ data }) => setApplication(data.data ?? data))
      .catch(() => setNotFound(true));
  }, [id]);

  const handleArchive = async () => {
    if (!application) return;
    if (!confirm('Move this application to the archive? It will be hidden from the main board.')) return;
    await updateApplication(application.id, { status: 'archived' });
    toast.success('Application moved to archive');
    navigate('/board');
  };

  const handlePermanentDelete = async () => {
    if (!application) return;
    if (!confirm('Permanently delete this application? This cannot be undone.')) return;
    await deleteApplication(application.id);
    toast.success('Application permanently deleted');
    navigate('/board');
  };

  const handleAddRound = async (data: InterviewRoundFormData) => {
    const { data: round } = await api.post(`/applications/${id}/interview-rounds`, data);
    setApplication((prev) => prev ? { ...prev, interview_rounds: [...prev.interview_rounds, round] } : prev);
    setShowAddRound(false);
    toast.success('New round added to schedule');
  };

  const handleUpdateRound = async (data: InterviewRoundFormData) => {
    if (!editingRound) return;
    const { data: updated } = await api.put(`/applications/${id}/interview-rounds/${editingRound.id}`, data);
    setApplication((prev) => prev ? {
      ...prev,
      interview_rounds: prev.interview_rounds.map((r) => r.id === editingRound.id ? updated : r),
    } : prev);
    setEditingRound(null);
    toast.success('Round details updated');
  };

  const handleDeleteRound = async (roundId: number) => {
    if (!confirm('Remove this interview round?')) return;
    setDeletingId(roundId);
    await api.delete(`/applications/${id}/interview-rounds/${roundId}`);
    setApplication((prev) => prev ? {
      ...prev,
      interview_rounds: prev.interview_rounds.filter((r) => r.id !== roundId),
    } : prev);
    setDeletingId(null);
    toast.success('Round removed');
  };

  if (notFound) return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center flex-col gap-6 p-8">
        <div className="w-20 h-20 rounded-3xl bg-error/10 flex items-center justify-center text-error">
           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
           </svg>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">Entry Not Found</h1>
          <p className="text-sm text-base-content/40 mt-2">This application may have been archived or removed.</p>
        </div>
        <button onClick={() => navigate('/board')} className="btn btn-primary rounded-2xl px-8 shadow-lg shadow-primary/20">Back to Pipeline</button>
      </div>
    </div>
  );

  if (!application) return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <span className="loading loading-spinner loading-lg text-primary opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Decrypting Details...</p>
        </div>
      </div>
    </div>
  );

  const salary = application.salary_min
    ? `${application.salary_currency ?? 'PHP'} ${application.salary_min.toLocaleString()}${application.salary_max ? ` – ${application.salary_max.toLocaleString()}` : '+'}`
    : 'Not Specified';

  return (
    <div className="min-h-screen bg-base-100 selection:bg-primary/20">
      <Navbar />
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-8 space-y-8 pb-32">
        {/* Header/Nav */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/board')} 
            className="group flex items-center gap-3 py-2 pr-4 rounded-2xl bg-base-100 border border-base-content/5 shadow-sm hover:border-primary/20 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-base-200 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">Back to Pipeline</span>
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleArchive} 
              className="btn btn-ghost btn-sm rounded-xl text-primary hover:bg-primary/10 font-bold"
              disabled={application.status === 'archived'}
            >
              {application.status === 'archived' ? 'Already Archived' : 'Archive Entry'}
            </button>
            <button 
              onClick={handlePermanentDelete} 
              className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
              title="Delete Permanently"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-base-100 rounded-[32px] p-8 sm:p-10 border border-base-content/5 shadow-2xl shadow-black/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
             <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${STATUS_STYLES[application.status] ?? 'bg-base-200'}`}>
                {application.status.replace(/_/g, ' ')}
             </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-primary text-primary-content flex items-center justify-center text-4xl font-black shadow-xl shadow-primary/20 shrink-0">
              {application.company.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-3 mb-2">
                 <span className={`badge badge-sm font-bold uppercase tracking-widest ${application.priority === 'high' ? 'badge-error' : application.priority === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                   {application.priority} Priority
                 </span>
                 <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Added {new Date(application.created_at).toLocaleDateString()}</span>
               </div>
               <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-2">{application.company}</h1>
               <div className="flex flex-wrap items-center gap-4">
                 <p className="text-lg font-bold text-base-content/60">{application.role}</p>
                 {application.job_url && (
                   <a href={application.job_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs rounded-lg gap-2 opacity-40 hover:opacity-100">
                     Official Post
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                     </svg>
                   </a>
                 )}
               </div>
            </div>
          </div>

          {/* Logistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-10 border-t border-base-content/5">
             <InfoItem label="Location" value={application.location} />
             <InfoItem label="Work Model" value={application.work_type} />
             <InfoItem label="Employment" value={application.employment_type?.replace(/_/g, ' ')} />
             <InfoItem label="Salary Range" value={salary} />
             <InfoItem label="Applied Date" value={application.applied_date} />
             <InfoItem label="Deadline" value={application.deadline} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Notes Panel */}
          <div className="space-y-8">
            <div className="bg-base-100 rounded-3xl p-8 border border-base-content/5 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-base-200 flex items-center justify-center text-base-content/40">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest opacity-40">Internal Notes</h2>
              </div>
              {application.notes ? (
                <div className="prose prose-sm max-w-none text-base-content/80 leading-relaxed font-medium">
                   {application.notes.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-base-content/5 rounded-2xl">
                   <p className="text-xs font-bold text-base-content/20 uppercase tracking-widest">No detailed notes provided</p>
                </div>
              )}
            </div>

            {/* Interviews Panel */}
            {application.status === 'interview' && (
              <div className="bg-base-100 rounded-3xl p-8 border border-base-content/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest opacity-40">Interview Schedule</h2>
                  </div>
                  {!showAddRound && (
                    <button onClick={() => setShowAddRound(true)} className="btn btn-primary btn-sm rounded-xl px-6 font-bold shadow-lg shadow-primary/10">
                      Schedule Round
                    </button>
                  )}
                </div>

                {showAddRound && (
                  <div className="bg-base-200/50 rounded-2xl p-6 mb-8 border border-base-content/5">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40">New Interview Round</span>
                       <button onClick={() => setShowAddRound(false)} className="btn btn-ghost btn-xs btn-circle">✕</button>
                    </div>
                    <InterviewRoundForm onSubmit={handleAddRound} onCancel={() => setShowAddRound(false)} />
                  </div>
                )}

                <div className="space-y-4">
                  {application.interview_rounds.length === 0 && !showAddRound ? (
                    <div className="py-12 text-center bg-base-200/30 rounded-3xl">
                      <p className="text-[10px] font-black text-base-content/20 uppercase tracking-widest">Awaiting Round Details</p>
                    </div>
                  ) : (
                    application.interview_rounds.map((round) => (
                      <div key={round.id} className="group relative bg-base-100 rounded-2xl p-5 border border-base-content/5 hover:border-primary/20 hover:shadow-xl hover:shadow-black/5 transition-all">
                        {editingRound?.id === round.id ? (
                          <div className="animate-in fade-in zoom-in-95 duration-200">
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
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-3 mb-3">
                                 <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                    round.type === 'technical' ? 'bg-info/10 text-info' : 
                                    round.type === 'hr' ? 'bg-success/10 text-success' : 
                                    round.type === 'system_design' ? 'bg-warning/10 text-warning' : 'bg-secondary/10 text-secondary'
                                 }`}>
                                   {round.type.replace(/_/g, ' ')}
                                 </div>
                                 <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{round.date}</span>
                               </div>
                               
                               <div className="flex items-center gap-4 mb-2">
                                  {round.interviewer_name && (
                                    <div className="flex items-center gap-2">
                                       <div className="w-5 h-5 rounded-full bg-base-200 flex items-center justify-center text-[8px] font-black text-base-content/60">
                                          {round.interviewer_name.charAt(0)}
                                       </div>
                                       <span className="text-xs font-bold">{round.interviewer_name}</span>
                                    </div>
                                  )}
                                  <StarDisplay rating={round.self_rating} />
                               </div>
                               
                               {round.notes && (
                                 <p className="text-sm text-base-content/60 leading-relaxed">{round.notes}</p>
                               )}
                            </div>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingRound(round)} className="btn btn-ghost btn-xs btn-circle bg-base-200">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                              </button>
                              <button onClick={() => handleDeleteRound(round.id)} disabled={deletingId === round.id} className="btn btn-ghost btn-xs btn-circle bg-error/10 text-error">
                                {deletingId === round.id
                                  ? <span className="loading loading-spinner loading-xs" />
                                  : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                }
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

