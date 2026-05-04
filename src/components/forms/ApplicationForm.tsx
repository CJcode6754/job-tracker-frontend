import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Resolver } from 'react-hook-form';
import { useApplicationStore } from '@/store/useApplicationStore';
import { useJobTagger } from '@/hooks/useAi';
import { toast } from 'sonner';

const schema = z.object({
  company:         z.string().min(1, 'Company is required'),
  role:            z.string().min(1, 'Role is required'),
  job_url:         z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  status:          z.enum(['wishlist', 'applied', 'phone_screen', 'interview', 'offer', 'rejected']),
  priority:        z.enum(['high', 'medium', 'low']),
  applied_date:    z.string().optional(),
  deadline:        z.string().optional(),
  salary_min:      z.preprocess(v => v === '' || v === null || v === undefined ? undefined : Number(v), z.number().positive().optional()),
  salary_max:      z.preprocess(v => v === '' || v === null || v === undefined ? undefined : Number(v), z.number().positive().optional()),
  salary_currency: z.string().optional(),
  location:        z.string().optional(),
  work_type:       z.preprocess(v => (v === '' || v === null || v === undefined) ? undefined : v, z.enum(['remote', 'onsite', 'hybrid']).optional()),
  employment_type: z.preprocess(v => (v === '' || v === null || v === undefined) ? undefined : v, z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance']).optional()),
  notes:           z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  defaultValues?: Partial<FormData>;
  applicationId?: string;
}

const STATUSES         = ['wishlist', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'archived'] as const;
const CURRENCIES       = ['PHP', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'];
const WORK_TYPES       = ['remote', 'onsite', 'hybrid'] as const;
const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'internship', 'freelance'] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2">{children}</p>;
}

function RequiredStar() {
  return <span className="text-error ml-0.5">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-error mt-1">
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </p>
  );
}

export default function ApplicationForm({ onClose, defaultValues, applicationId }: Props) {
  const { addApplication, updateApplication } = useApplicationStore();
  const { tags, loading: tagLoading, analyzeJD } = useJobTagger();
  const [jdInput, setJdInput]         = useState('');
  const [showAI, setShowAI]           = useState(false);
  const [tagsApplied, setTagsApplied] = useState(false);

  const companyRef = useRef<HTMLInputElement>(null);
  const roleRef    = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: defaultValues ?? { 
      status: 'wishlist', 
      priority: 'medium', 
      salary_currency: 'PHP',
      work_type: 'onsite',
      employment_type: 'full_time'
    },
  });

  const { ref: companyFieldRef, ...companyRegisterRest } = register('company');
  const { ref: roleFieldRef,    ...roleRegisterRest    } = register('role');

  const priority       = watch('priority');
  const status         = watch('status');
  const workType       = watch('work_type');
  const employmentType = watch('employment_type');

  const onSubmit = async (data: FormData) => {
    try {
      if (applicationId) {
        await updateApplication(applicationId, data as Record<string, unknown>);
        toast.success('Application updated!');
      } else {
        await addApplication(data as Record<string, unknown>);
        toast.success('Application added!');
      }
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const errs = err?.response?.data?.errors;
      const msg  = err?.response?.data?.message;
      toast.error(errs ? Object.values(errs).flat().join(', ') : (msg ?? 'Something went wrong.'));
    }
  };

  const onError = () => {
    if (errors.company) {
      companyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      companyRef.current?.focus();
    } else if (errors.role) {
      roleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      roleRef.current?.focus();
    }
  };

  const applyTags = () => {
    if (!tags) return;
    if (tags.company)    setValue('company', tags.company, { shouldValidate: false });
    if (tags.role_title) setValue('role', tags.role_title, { shouldValidate: false });
    if (tags.location)   setValue('location', tags.location, { shouldValidate: false });
    if (tags.estimated_priority) setValue('priority', tags.estimated_priority, { shouldValidate: false });
    if (tags.remote_policy) {
      const map: Record<string, 'remote' | 'onsite' | 'hybrid'> = {
        'remote': 'remote', 'hybrid': 'hybrid', 'on-site': 'onsite', 'onsite': 'onsite',
      };
      const mapped = map[tags.remote_policy.toLowerCase()];
      if (mapped) setValue('work_type', mapped, { shouldValidate: false });
    }
    if (tags.employment_type) {
      const map: Record<string, 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance'> = {
        'full-time': 'full_time', 'part-time': 'part_time',
        'contract': 'contract', 'freelance': 'freelance', 'internship': 'internship',
      };
      const mapped = map[tags.employment_type.toLowerCase()];
      if (mapped) setValue('employment_type', mapped, { shouldValidate: false });
    }
    if (tags.tech_stack.length) {
      setValue('notes', `Tech stack: ${tags.tech_stack.join(', ')}\n\nRequirements:\n${tags.key_requirements.join('\n')}`, { shouldValidate: false });
    }
    setTagsApplied(true);
    toast.success('Applied to form');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col h-full max-h-[85vh]">
      <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 space-y-8">

        {/* AI JD Tagger */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4 shadow-sm">
          <button type="button" onClick={() => setShowAI((s) => !s)} className="flex items-center justify-between w-full group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <span className="text-sm font-black text-primary block">AI Auto-Fill</span>
                <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Analyze Job Description</span>
              </div>
            </div>
            <svg className={`w-4 h-4 text-primary transition-transform duration-300 ${showAI ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAI && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <textarea
                className="textarea bg-base-100 border-base-content/10 w-full rounded-xl focus:ring-2 focus:ring-primary/20 text-sm h-32"
                value={jdInput}
                onChange={(e) => setJdInput(e.target.value)}
                placeholder="Paste the job description here..."
              />
              <button
                type="button"
                onClick={() => { analyzeJD(jdInput); setTagsApplied(false); }}
                disabled={tagLoading || !jdInput.trim()}
                className="btn btn-primary btn-sm rounded-xl px-6 font-bold shadow-lg shadow-primary/20"
              >
                {tagLoading ? <span className="loading loading-spinner loading-xs" /> : 'Start Analysis'}
              </button>

              {tags && (
                <div className="bg-base-100 rounded-xl p-4 space-y-2 border border-base-content/5 shadow-inner">
                  {([
                    tags.company      ? ['Company',  tags.company]            : null,
                    ['Role',            tags.role_title],
                    tags.location     ? ['Location', tags.location]           : null,
                    ['Seniority',       tags.seniority],
                    ['Type',            tags.remote_policy],
                  ] as ([string, string] | null)[])
                    .filter((item): item is [string, string] => item !== null)
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center text-[11px]">
                        <span className="font-bold opacity-30 uppercase tracking-widest">{k}</span>
                        <span className="font-black text-right truncate max-w-50">{v}</span>
                      </div>
                    ))}
                  {tagsApplied ? (
                    <div className="flex items-center justify-center gap-2 mt-4 text-success text-[10px] font-black uppercase tracking-widest">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Applied Successfully
                    </div>
                  ) : (
                    <button type="button" onClick={applyTags} className="btn btn-primary btn-xs btn-block mt-4 rounded-lg font-bold">
                      Apply to Form
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <SectionLabel>Core Information</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Company <RequiredStar /></span>
              </label>
              <input
                ref={(el) => { companyFieldRef(el); (companyRef as React.MutableRefObject<HTMLInputElement | null>).current = el; }}
                className={`input bg-base-100 border border-base-content/10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 ${errors.company ? 'ring-2 ring-error/50' : ''}`}
                {...companyRegisterRest}
                placeholder="Google, Stripe, etc."
                autoFocus
              />
              <FieldError message={errors.company?.message} />
            </div>

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Role <RequiredStar /></span>
              </label>
              <input
                ref={(el) => { roleFieldRef(el); (roleRef as React.MutableRefObject<HTMLInputElement | null>).current = el; }}
                className={`input bg-base-100 border border-base-content/10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 ${errors.role ? 'ring-2 ring-error/50' : ''}`}
                {...roleRegisterRest}
                placeholder="Frontend Engineer"
              />
              <FieldError message={errors.role?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Job URL</span>
              </label>
              <input
                className={`input bg-base-100 border border-base-content/10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 ${errors.job_url ? 'ring-2 ring-error/50' : ''}`}
                {...register('job_url')}
                type="url"
                placeholder="https://linkedin.com/jobs/..."
              />
              <FieldError message={errors.job_url?.message} />
            </div>

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Location</span>
              </label>
              <input className="input bg-base-100 border border-base-content/10 rounded-xl text-sm font-bold" {...register('location')} placeholder="London / Remote" />
            </div>
          </div>
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-3">
            <SectionLabel>Application Status</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <label key={s} className="group relative cursor-pointer">
                  <input type="radio" {...register('status')} value={s} className="sr-only" />
                  <div className={`px-3 py-2 rounded-xl text-[10px] font-black text-center uppercase tracking-widest transition-all ${
                    status === s ? 'bg-primary text-primary-content shadow-lg shadow-primary/20 scale-[1.02]' : 'bg-base-200 text-base-content/40 hover:bg-base-300'
                  }`}>
                    {s.replace(/_/g, ' ')}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SectionLabel>Priority Level</SectionLabel>
            <div className="flex flex-col gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <label key={p} className="group relative cursor-pointer">
                  <input type="radio" {...register('priority')} value={p} className="sr-only" />
                  <div className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between ${
                    priority === p 
                    ? p === 'high' ? 'bg-error text-error-content shadow-error/20' 
                      : p === 'medium' ? 'bg-warning text-warning-content shadow-warning/20'
                      : 'bg-success text-success-content shadow-success/20'
                    : 'bg-base-200 text-base-content/30'
                  } ${priority === p ? 'shadow-lg scale-[1.02]' : 'hover:bg-base-300'}`}>
                    {p}
                    <div className={`w-1.5 h-1.5 rounded-full ${priority === p ? 'bg-current' : 'bg-base-content/10'}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-4 pt-4 border-t border-base-content/5">
          <SectionLabel>Logistics & Details</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Work Model</span>
              </label>
              <div className="flex gap-1.5 p-1 bg-base-200 rounded-xl">
                {WORK_TYPES.map((w) => (
                  <label key={w} className="cursor-pointer flex-1">
                    <input type="radio" {...register('work_type')} value={w} className="sr-only" />
                    <div className={`py-1.5 rounded-lg text-[9px] font-black text-center uppercase tracking-widest transition-all ${
                      workType === w ? 'bg-base-100 text-primary shadow-sm shadow-black/5' : 'text-base-content/30 hover:text-base-content/60'
                    }`}>
                      {w}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Employment Type</span>
              </label>
              <div className="flex flex-wrap gap-1.5 p-1 bg-base-200 rounded-xl">
                {EMPLOYMENT_TYPES.map((e) => (
                  <label key={e} className="cursor-pointer flex-1 min-w-17.5">
                    <input type="radio" {...register('employment_type')} value={e} className="sr-only" />
                    <div className={`py-1.5 rounded-lg text-[9px] font-black text-center uppercase tracking-widest transition-all ${
                      employmentType === e ? 'bg-base-100 text-primary shadow-sm shadow-black/5' : 'text-base-content/30 hover:text-base-content/60'
                    }`}>
                      {e.replace('_', ' ')}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Applied Date</span>
              </label>
              <input className="input bg-base-100 border border-base-content/10 rounded-xl text-sm font-bold" {...register('applied_date')} type="date" />
            </div>
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Application Deadline</span>
              </label>
              <input className="input bg-base-100 border border-base-content/10 rounded-xl text-sm font-bold" {...register('deadline')} type="date" />
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="space-y-4 pt-4 border-t border-base-content/5">
          <SectionLabel>Compensation</SectionLabel>
          <div className="flex gap-3 items-end">
             <div className="form-control w-24 shrink-0">
                <label className="label py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Currency</span>
                </label>
                <select className="select bg-base-100 border border-base-content/10 rounded-xl text-xs font-bold h-11" {...register('salary_currency')}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div className="form-control flex-1">
                <label className="label py-1">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Salary Range</span>
                </label>
                <div className="flex items-center gap-2">
                   <input className="input bg-base-100 border border-base-content/10 rounded-xl text-sm font-bold w-full h-11" {...register('salary_min')} type="number" placeholder="Min" />
                   <span className="opacity-20 font-black">—</span>
                   <input className="input bg-base-100 border border-base-content/10 rounded-xl text-sm font-bold w-full h-11" {...register('salary_max')} type="number" placeholder="Max" />
                </div>
             </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3 pt-4 border-t border-base-content/5 pb-4">
          <SectionLabel>Additional Notes</SectionLabel>
          <textarea className="textarea bg-base-100 border border-base-content/10 rounded-2xl text-sm font-medium w-full h-24 focus:ring-2 focus:ring-primary/20" {...register('notes')} placeholder="Interview stages, referral details, or company values..." />
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 bg-base-100 border-t border-base-content/5 flex items-center justify-between">
        <div className="max-w-[50%]">
          {(errors.company || errors.role) && (
            <p className="text-[10px] font-black text-error uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.company?.message ?? errors.role?.message}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm rounded-xl font-bold opacity-40 hover:opacity-100 transition-opacity">
            Discard
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm rounded-xl px-8 font-black shadow-lg shadow-primary/20">
            {isSubmitting ? <span className="loading loading-spinner loading-xs mr-2" /> : null}
            {applicationId ? 'Update Entry' : 'Save Application'}
          </button>
        </div>
      </div>
    </form>
  );
}
