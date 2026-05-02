import { useState } from 'react';
import { useCoverLetter } from '@/hooks/useAi';
import { toast } from 'sonner';

interface Props {
  company: string;
  role: string;
  notes?: string;
}

export default function CoverLetterGenerator({ company, role, notes }: Props) {
  const { letter, loading, generate } = useCoverLetter();
  const [jd, setJd]         = useState('');
  const [bg, setBg]         = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = () => generate({
    company,
    role,
    job_description: jd || undefined,
    notes,
    user_background: bg || undefined,
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm">
      <div className="card-body p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">AI Cover Letter</h2>
            <p className="text-xs text-base-content/50 mt-0.5">Generate a tailored cover letter</p>
          </div>
          <button onClick={() => setIsOpen((o) => !o)} className="btn btn-ghost btn-sm">
            {isOpen ? 'Hide' : 'Generate'}
          </button>
        </div>

        {isOpen && (
          <div className="space-y-3 mt-3">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Job Description (optional)</legend>
              <textarea
                className="textarea textarea-bordered w-full"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={4}
                placeholder="Paste the job description here..."
              />
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Your Background / Key Skills</legend>
              <textarea
                className="textarea textarea-bordered w-full"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                rows={2}
                placeholder="e.g. 3 years Laravel, React, led a team of 4..."
              />
            </fieldset>

            <button onClick={handleGenerate} disabled={loading} className="btn btn-primary btn-sm">
              {loading ? <span className="loading loading-spinner loading-xs" /> : null}
              {loading ? 'Generating...' : 'Generate Cover Letter'}
            </button>

            {letter && (
              <div className="space-y-2">
                <div className="bg-base-200 rounded-lg p-4 text-sm text-base-content/70 whitespace-pre-wrap leading-relaxed">
                  {letter}
                </div>
                <button onClick={copyToClipboard} className="btn btn-ghost btn-sm btn-block border border-base-300">
                  Copy to Clipboard
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
