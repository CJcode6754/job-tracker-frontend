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
  applicationId?: number;
}

const STATUSES         = ['wishlist', 'applied', 'phone_screen', 'interview', 'offer', 'rejected'] as const;
const CURRENCIES       = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
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
    defaultValues: defaultValues ?? { status: 'wishlist', priority: 'medium', salary_currency: 'PHP' },
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

  const priorityColors: Record<string, string> = { high: 'btn-error', medium: 'btn-warning', low: 'btn-success' };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="space-y-5 p-5">

        {/* AI JD Tagger */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <button type="button" onClick={() => setShowAI((s) => !s)} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-semibold text-primary">Auto-fill from Job Description</span>
              <span className="badge badge-primary badge-sm">AI</span>
            </div>
            <svg className={`w-4 h-4 text-primary transition-transform ${showAI ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAI && (
            <div className="space-y-3">
              <textarea
                className="textarea textarea-bordered w-full bg-base-100"
                value={jdInput}
                onChange={(e) => setJdInput(e.target.value)}
                rows={4}
                placeholder="Paste the full job description..."
              />
              <button
                type="button"
                onClick={() => { analyzeJD(jdInput); setTagsApplied(false); }}
                disabled={tagLoading || !jdInput.trim()}
                className="btn btn-primary btn-sm"
              >
                {tagLoading ? <span className="loading loading-spinner loading-xs" /> : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {tagLoading ? 'Analyzing...' : 'Analyze JD'}
              </button>

              {tags && (
                <div className="bg-base-100 rounded-lg p-3 space-y-1.5 border border-base-300">
                  {([
                    tags.company      ? ['Company',  tags.company]            : null,
                    ['Role',            tags.role_title],
                    tags.location     ? ['Location', tags.location]           : null,
                    ['Seniority',       tags.seniority],
                    ['Remote',          tags.remote_policy],
                    ['Type',            tags.employment_type],
                    tags.salary_range ? ['Salary',   tags.salary_range]       : null,
                    ['Stack',           tags.tech_stack.join(', ')],
                    ['Priority',        `${tags.estimated_priority} — ${tags.priority_reason}`],
                  ] as ([string, string] | null)[])
                    .filter((item): item is [string, string] => item !== null)
                    .map(([k, v]) => (
                      <p key={k} className="text-xs text-base-content/70">
                        <span className="font-semibold text-base-content">{k}:</span> {v}
                      </p>
                    ))}
                  {tagsApplied ? (
                    <div className="flex items-center gap-1.5 mt-2 text-success text-xs font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Applied to form
                    </div>
                  ) : (
                    <button type="button" onClick={applyTags} className="btn btn-primary btn-sm btn-block mt-2">
                      Apply to form
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="divider my-0" />

        {/* Basic Info */}
        <div className="space-y-3">
          <SectionLabel>Basic Info</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <fieldset className="fieldset col-span-2 sm:col-span-1">
              <legend className="fieldset-legend">Company <RequiredStar /></legend>
              <input
                ref={(el) => { companyFieldRef(el); (companyRef as React.MutableRefObject<HTMLInputElement | null>).current = el; }}
                className={`input input-bordered w-full ${errors.company ? 'input-error' : ''}`}
                {...companyRegisterRest}
                placeholder="e.g. Acme Corp"
                autoFocus
              />
              <FieldError message={errors.company?.message} />
            </fieldset>

            <fieldset className="fieldset col-span-2 sm:col-span-1">
              <legend className="fieldset-legend">Role <RequiredStar /></legend>
              <input
                ref={(el) => { roleFieldRef(el); (roleRef as React.MutableRefObject<HTMLInputElement | null>).current = el; }}
                className={`input input-bordered w-full ${errors.role ? 'input-error' : ''}`}
                {...roleRegisterRest}
                placeholder="e.g. Frontend Engineer"
              />
              <FieldError message={errors.role?.message} />
            </fieldset>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Job URL</legend>
            <input
              className={`input input-bordered w-full ${errors.job_url ? 'input-error' : ''}`}
              {...register('job_url')}
              type="url"
              placeholder="https://..."
            />
            <FieldError message={errors.job_url?.message} />
          </fieldset>
        </div>

        <div className="divider my-0" />

        {/* Status & Priority */}
        <div className="space-y-3">
          <SectionLabel>Status & Priority</SectionLabel>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Status</legend>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <label key={s} className="cursor-pointer">
                  <input type="radio" {...register('status')} value={s} className="sr-only" />
                  <span className={`badge badge-md cursor-pointer transition-all ${
                    status === s ? 'bg-primary text-primary-content border-primary' : 'badge-ghost hover:bg-base-200'
                  }`}>
                    {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Priority</legend>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <label key={p} className="cursor-pointer flex-1">
                  <input type="radio" {...register('priority')} value={p} className="sr-only" />
                  <span className={`btn btn-sm w-full capitalize ${priority === p ? priorityColors[p] : 'btn-ghost border border-base-300'}`}>
                    {p}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="divider my-0" />

        {/* Job Details */}
        <div className="space-y-3">
          <SectionLabel>Job Details</SectionLabel>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Location</legend>
            <input className="input input-bordered w-full" {...register('location')} placeholder="e.g. New York, NY or Remote" />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Work Type</legend>
            <div className="flex gap-2">
              {WORK_TYPES.map((w) => (
                <label key={w} className="cursor-pointer flex-1">
                  <input type="radio" {...register('work_type')} value={w} className="sr-only" />
                  <span className={`btn btn-sm w-full capitalize ${workType === w ? 'btn-neutral' : 'btn-ghost border border-base-300'}`}>
                    {w}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Employment Type</legend>
            <div className="flex flex-wrap gap-2">
              {EMPLOYMENT_TYPES.map((e) => (
                <label key={e} className="cursor-pointer">
                  <input type="radio" {...register('employment_type')} value={e} className="sr-only" />
                  <span className={`badge badge-md cursor-pointer transition-all ${
                    employmentType === e ? 'bg-neutral text-neutral-content border-neutral' : 'badge-ghost hover:bg-base-200'
                  }`}>
                    {e.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="divider my-0" />

        {/* Dates */}
        <div className="space-y-3">
          <SectionLabel>Dates</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Applied Date</legend>
              <input className="input input-bordered w-full" {...register('applied_date')} type="date" />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Deadline</legend>
              <input className="input input-bordered w-full" {...register('deadline')} type="date" />
            </fieldset>
          </div>
        </div>

        <div className="divider my-0" />

        {/* Salary */}
        <div className="space-y-3">
          <SectionLabel>Salary (optional)</SectionLabel>
          <div className="flex gap-3 items-end">
            <fieldset className="fieldset w-24 shrink-0">
              <legend className="fieldset-legend">Currency</legend>
              <select className="select select-bordered w-full" {...register('salary_currency')}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </fieldset>
            <fieldset className="fieldset flex-1">
              <legend className="fieldset-legend">Min</legend>
              <input className="input input-bordered w-full" {...register('salary_min')} type="number" placeholder="80,000" />
            </fieldset>
            <span className="pb-2.5 text-base-content/30 text-sm shrink-0">—</span>
            <fieldset className="fieldset flex-1">
              <legend className="fieldset-legend">Max</legend>
              <input className="input input-bordered w-full" {...register('salary_max')} type="number" placeholder="120,000" />
            </fieldset>
          </div>
        </div>

        <div className="divider my-0" />

        {/* Notes */}
        <div className="space-y-3">
          <SectionLabel>Notes</SectionLabel>
          <textarea className="textarea textarea-bordered w-full" {...register('notes')} rows={3} placeholder="Any notes about this role..." />
        </div>

      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-base-200 bg-base-100 sticky bottom-0">
        {(errors.company || errors.role) && (
          <p className="text-xs text-error mb-3 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.company?.message ?? errors.role?.message}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm min-w-24">
            {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : null}
            {isSubmitting ? 'Saving...' : applicationId ? 'Update' : 'Add Application'}
          </button>
        </div>
      </div>
    </form>
  );
}
