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

export default function ApplicationForm({ onClose, defaultValues, applicationId }: Props) {
  const { addApplication, updateApplication } = useApplicationStore();
  const { tags, loading: tagLoading, analyzeJD } = useJobTagger();
  const [jdInput, setJdInput]     = useState('');
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

  // Apply AI-extracted tags into the form
  const applyTags = () => {
    if (!tags) return;
    if (tags.estimated_priority) setValue('priority', tags.estimated_priority);
    if (tags.tech_stack.length) {
      setValue('notes', `Tech stack: ${tags.tech_stack.join(', ')}\n\nRequirements:\n${tags.key_requirements.join('\n')}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Company *</label>
        <input {...register('company')} className="w-full border rounded-lg px-3 py-2 text-sm" />
        {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Role *</label>
        <input {...register('role')} className="w-full border rounded-lg px-3 py-2 text-sm" />
        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select {...register('status')} className="w-full border rounded-lg px-3 py-2 text-sm">
            {['wishlist','applied','phone_screen','interview','offer','rejected'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select {...register('priority')} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Job URL</label>
        <input {...register('job_url')} type="url" className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Applied Date</label>
          <input {...register('applied_date')} type="date" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deadline</label>
          <input {...register('deadline')} type="date" className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea {...register('notes')} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      {/* 🏷️ AI JD Tagger */}
      <div className="border rounded-lg p-3 space-y-2 bg-gray-50">
        <button
          type="button"
          onClick={() => setShowTagger((s) => !s)}
          className="text-sm text-indigo-600 font-medium hover:underline"
        >
          🏷️ {showTagger ? 'Hide' : 'Paste job description for AI auto-fill'}
        </button>

        {showTagger && (
          <>
            <textarea
              value={jdInput}
              onChange={(e) => setJdInput(e.target.value)}
              rows={4}
              placeholder="Paste the full job description..."
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => analyzeJD(jdInput)}
              disabled={tagLoading || !jdInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs rounded-lg px-3 py-1.5"
            >
              {tagLoading ? 'Analyzing...' : 'Analyze JD'}
            </button>

            {tags && (
              <div className="bg-white border rounded-lg p-3 space-y-1.5 text-xs text-gray-700">
                <p><span className="font-medium">Role:</span> {tags.role_title}</p>
                <p><span className="font-medium">Seniority:</span> {tags.seniority}</p>
                <p><span className="font-medium">Remote:</span> {tags.remote_policy}</p>
                <p><span className="font-medium">Type:</span> {tags.employment_type}</p>
                {tags.salary_range && <p><span className="font-medium">Salary:</span> {tags.salary_range}</p>}
                <p><span className="font-medium">Stack:</span> {tags.tech_stack.join(', ')}</p>
                <p><span className="font-medium">Suggested priority:</span> {tags.estimated_priority} — {tags.priority_reason}</p>
                <button
                  type="button"
                  onClick={applyTags}
                  className="mt-2 w-full bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg py-1.5 hover:bg-indigo-100 transition-colors"
                >
                  Apply to form
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : applicationId ? 'Update' : 'Add Application'}
        </button>
      </div>
    </form>
  );
}