import { useState } from 'react';
import api from '@/lib/axios';
import type { ChatMessage, JobTags } from '@/types';
import { toast } from 'sonner';

// -------------------------------------------------------
// 💬 Chatbot Hook
// -------------------------------------------------------
export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hi! I'm your job search assistant. Ask me anything about your applications — like \"which companies haven't responded?\" or \"do I have any deadlines this week?\"",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Keep only the last 10 messages as history to stay within free tier token limits
      const history = updatedMessages
        .slice(1, -1)
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.text }));

      const { data } = await api.post('/ai/chat', { message: text, history });
      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch (err: any) {
      const msg = err?.response?.status === 429
        ? 'Rate limit reached. Please wait a moment.'
        : 'AI is unavailable right now. Try again.';
      toast.error(msg);
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => setMessages([{
    role: 'model',
    text: "Hi! I'm your job search assistant. Ask me anything about your applications.",
  }]);

  return { messages, loading, sendMessage, clearHistory };
}

// -------------------------------------------------------
// ✍️ Cover Letter Hook
// -------------------------------------------------------
export function useCoverLetter() {
  const [letter, setLetter]   = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async (params: {
    company: string;
    role: string;
    job_description?: string;
    notes?: string;
    user_background?: string;
  }) => {
    setLoading(true);
    setLetter('');
    try {
      const { data } = await api.post('/ai/cover-letter', params);
      setLetter(data.cover_letter);
    } catch {
      toast.error('Failed to generate cover letter.');
    } finally {
      setLoading(false);
    }
  };

  return { letter, loading, generate };
}

// -------------------------------------------------------
// 📊 Insights Hook
// -------------------------------------------------------
export function useAiInsights() {
  const [insights, setInsights] = useState('');
  const [loading, setLoading]   = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    setInsights('');
    try {
      const { data } = await api.post('/ai/insights');
      setInsights(data.insights);
    } catch {
      toast.error('Failed to load insights.');
    } finally {
      setLoading(false);
    }
  };

  return { insights, loading, fetchInsights };
}

// -------------------------------------------------------
// 🏷️ Job Description Tagger Hook
// -------------------------------------------------------
export function useJobTagger() {
  const [tags, setTags]       = useState<JobTags | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeJD = async (job_description: string) => {
    setLoading(true);
    setTags(null);
    try {
      const { data } = await api.post('/ai/tag-job', { job_description });
      setTags(data.tags);
    } catch {
      toast.error('Failed to analyze job description.');
    } finally {
      setLoading(false);
    }
  };

  return { tags, loading, analyzeJD };
}