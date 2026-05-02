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
    job_description:  jd,
    notes,
    user_background:  bg,
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">✍️ AI Cover Letter</h3>
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="text-xs text-indigo-600 hover:underline"
        >
          {isOpen ? 'Hide' : 'Generate'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Job Description (paste for better results)
            </label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows={4}
              placeholder="Paste the job description here..."
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Your Background / Key Skills
            </label>
            <textarea
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              rows={2}
              placeholder="e.g. 3 years Laravel, React, led a team of 4..."
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg py-2 font-medium transition-colors"
          >
            {loading ? '✨ Generating...' : '✨ Generate Cover Letter'}
          </button>

          {letter && (
            <div className="space-y-2">
              <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {letter}
              </div>
              <button
                onClick={copyToClipboard}
                className="w-full border border-indigo-300 text-indigo-600 hover:bg-indigo-50 text-sm rounded-lg py-2 transition-colors"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}