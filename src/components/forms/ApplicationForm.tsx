import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApplicationStore } from '@/store/useApplicationStore';
import { useJobTagger } from '@/hooks/useAi';
import { toast } from 'sonner';

const schema = z.object({
  company:      z.string().min(1, 'Company is required'),
  role:         z.string().min(1, 'Role is required'),
  job_url:      z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status:       z.enum(['wishlist', 'applied', 'phone_screen', 'interview', 'offer', 'rejected']),
  priority:     z.enum(['high', 'medium', 'low']),
  applied_date: z.string().optional(),
  deadline:     z.string().optional(),
  salary_min:   z.number().optional(),
  salary_max:   z.number().optional(),
  notes:        z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  defaultValues?: Partial<FormData>;
  applicationId?: number;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      {children}
      {error && <p className="fieldset-label text-error">{error}</p>}
    </fieldset>
  );
}

export default function ApplicationForm({ onClose, defaultValues, applicationId }: Props) {
  const { addApplication, updateApplication } = useApplicationStore();
  const { tags, loading: tagLoading, analyzeJD } = useJobTagger();
  const [jdInput, setJdInput]       = useState('');
  const [showTagger, setShowTagger] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { status: 'wishlist', priority: 'medium' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (applicationId) {
        await updateApplication(applicationId, data);
        toast.success('Application updated!');
      } else {
        await addApplication(data);
        toast.success('Application added!');
      }
      onClose();
    } catch {
      toast.error('Something went wrong.');
    }
  };

  const applyTags = () => {
    if (!tags) return;
    if (tags.estimated_priority) setValue('priority', tags.estimated_priority);
    if (tags.tech_stack.length) {
      setValue('notes', `Tech stack: ${tags.tech_stack.join(', ')}\n\nRequirements:\n${tags.key_requirements.join('\n')}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Field label="Company *" error={errors.company?.message}>
        <input className="input input-bordered w-full" {...register('company')} placeholder="e.g. Acme Corp" />
      </Field>

      <Field label="Role *" error={errors.role?.message}>
        <input className="input input-bordered w-full" {...register('role')} placeholder="e.g. Frontend Engineer" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Status">
          <select className="select select-bordered w-full" {...register('status')}>
            {['wishlist', 'applied', 'phone_screen', 'interview', 'offer', 'rejected'].map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select className="select select-bordered w-full" {...register('priority')}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </Field>
      </div>

      <Field label="Job URL" error={errors.job_url?.message}>
        <input className="input input-bordered w-full" {...register('job_url')} type="url" placeholder="https://..." />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Applied Date">
          <input className="input input-bordered w-full" {...register('applied_date')} type="date" />
        </Field>
        <Field label="Deadline">
          <input className="input input-bordered w-full" {...register('deadline')} type="date" />
        </Field>
      </div>

      <Field label="Notes">
        <textarea className="textarea textarea-bordered w-full" {...register('notes')} rows={3} placeholder="Any notes about this role..." />
      </Field>

      {/* AI JD Tagger */}
      <div className="collapse collapse-arrow bg-base-200 border border-base-300">
        <input type="checkbox" checked={showTagger} onChange={() => setShowTagger((s) => !s)} />
        <div className="collapse-title text-sm font-medium text-primary">
          AI auto-fill from job description
        </div>
        <div className="collapse-content space-y-3">
          <textarea
            className="textarea textarea-bordered w-full"
            value={jdInput}
            onChange={(e) => setJdInput(e.target.value)}
            rows={4}
            placeholder="Paste the full job description..."
          />
          <button
            type="button"
            onClick={() => analyzeJD(jdInput)}
            disabled={tagLoading || !jdInput.trim()}
            className="btn btn-primary btn-sm"
          >
            {tagLoading ? <span className="loading loading-spinner loading-xs" /> : null}
            {tagLoading ? 'Analyzing...' : 'Analyze JD'}
          </button>

          {tags && (
            <div className="bg-base-100 rounded-lg p-3 space-y-1.5 border border-base-300">
              {(([
                ['Role', tags.role_title],
                ['Seniority', tags.seniority],
                ['Remote', tags.remote_policy],
                ['Type', tags.employment_type],
                tags.salary_range ? ['Salary', tags.salary_range] : null,
                ['Stack', tags.tech_stack.join(', ')],
                ['Priority', `${tags.estimated_priority} — ${tags.priority_reason}`],
              ] as ([string, string] | null)[]).filter((item): item is [string, string] => item !== null).map(([k, v]) => (
                <p key={k} className="text-xs text-base-content/70">
                  <span className="font-semibold text-base-content">{k}:</span> {v}
                </p>
              )))}
              <button type="button" onClick={applyTags} className="btn btn-ghost btn-sm btn-block mt-2">
                Apply to form
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
          {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : null}
          {isSubmitting ? 'Saving...' : applicationId ? 'Update' : 'Add Application'}
        </button>
      </div>
    </form>
  );
}
