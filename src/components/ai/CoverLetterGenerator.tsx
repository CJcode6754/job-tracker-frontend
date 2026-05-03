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
  const [jd, setJd]           = useState('');
  const [bg, setBg]           = useState('');
  const [showInputs, setShowInputs] = useState(true);

  const handleGenerate = async () => {
    await generate({
      company,
      role,
      job_description: jd || undefined,
      notes,
      user_background: bg || undefined,
    });
    setShowInputs(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-4">

      {/* Inputs */}
      {showInputs && (
        <div className="space-y-3">
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

          <button onClick={handleGenerate} disabled={loading} className="btn btn-primary btn-sm w-full">
            {loading
              ? <><span className="loading loading-spinner loading-xs" /> Generating...</>
              : <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Cover Letter
                </>
            }
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2 pt-1">
          {[100, 95, 88, 100, 92, 85, 100, 90].map((w, i) => (
            <div key={i} className="skeleton h-3 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {/* Generated letter */}
      {letter && !loading && (
        <div className="space-y-3">
          {/* Letter card — scrollable, max height */}
          <div className="relative">
            <div className="bg-base-200/60 border border-base-300 rounded-xl overflow-hidden">
              {/* Letter header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-base-300 bg-base-100">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs font-medium text-base-content/60">Cover Letter — {company}</span>
                </div>
                <button
                  onClick={() => setShowInputs((s) => !s)}
                  className="text-xs text-primary hover:underline"
                >
                  {showInputs ? 'Hide inputs' : 'Edit inputs'}
                </button>
              </div>

              {/* Scrollable letter body */}
              <div className="max-h-80 overflow-y-auto px-5 py-4">
                <div className="text-sm text-base-content leading-relaxed whitespace-pre-wrap font-[Georgia,serif]">
                  {letter}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={copyToClipboard} className="btn btn-primary btn-sm flex-1 gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to Clipboard
            </button>
            <button
              onClick={() => { setShowInputs(true); }}
              className="btn btn-ghost btn-sm border border-base-300 gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
