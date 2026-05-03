import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { InterviewRound } from '@/types';

const schema = z.object({
  type:             z.enum(['technical', 'hr', 'system_design', 'take_home']),
  date:             z.string().optional(),
  interviewer_name: z.string().optional(),
  notes:            z.string().optional(),
  self_rating:      z.preprocess(v => v === '' || v === null ? undefined : Number(v), z.number().min(1).max(5).optional()),
});

export type InterviewRoundFormData = z.infer<typeof schema>;

const TYPES = ['technical', 'hr', 'system_design', 'take_home'] as const;

interface Props {
  defaultValues?: Partial<InterviewRoundFormData>;
  onSubmit: (data: InterviewRoundFormData) => Promise<void>;
  onCancel: () => void;
}

function StarRating({ value, onChange }: { value?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-xl transition-colors ${star <= (value ?? 0) ? 'text-warning' : 'text-base-content/20 hover:text-warning/60'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function InterviewRoundForm({ defaultValues, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<InterviewRoundFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { type: 'hr' },
  });

  const rating = watch('self_rating');
  const type   = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Type</legend>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <label key={t} className="cursor-pointer">
              <input type="radio" {...register('type')} value={t} className="sr-only" />
              <span className={`badge badge-md cursor-pointer transition-all ${
                type === t ? 'bg-primary text-primary-content border-primary' : 'badge-ghost hover:bg-base-200'
              }`}>
                {t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
        {errors.type && <p className="text-xs text-error mt-1">{errors.type.message}</p>}
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Date</legend>
          <input className="input input-bordered w-full" {...register('date')} type="date" />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Interviewer Name</legend>
          <input className="input input-bordered w-full" {...register('interviewer_name')} placeholder="e.g. Jane Smith" />
        </fieldset>
      </div>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Notes</legend>
        <textarea className="textarea textarea-bordered w-full" {...register('notes')} rows={3} placeholder="How did it go?" />
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Self Rating</legend>
        <StarRating value={rating} onChange={(v) => setValue('self_rating', v as 1|2|3|4|5)} />
      </fieldset>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm min-w-20">
          {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : 'Save'}
        </button>
      </div>
    </form>
  );
}
