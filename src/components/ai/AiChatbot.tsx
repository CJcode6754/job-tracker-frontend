import { useState, useRef, useEffect } from 'react';
import { useAiChat } from '@/hooks/useAi';
import type { ChatMessage } from '@/types';

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-content text-xs mr-2 shrink-0 mt-1 font-semibold">
          AI
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
        isUser
          ? 'bg-primary text-primary-content rounded-br-sm'
          : 'bg-base-200 text-base-content rounded-bl-sm'
      }`}>
        {message.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-content text-xs mr-2 shrink-0 font-semibold">
        AI
      </div>
      <div className="bg-base-200 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

const SUGGESTED_QUESTIONS = [
  'Which applications need a follow-up?',
  'Do I have any deadlines this week?',
  'How many interviews do I have?',
  'Which company pays the most?',
];

export default function AiChatbot() {
  const { messages, loading, sendMessage, clearHistory } = useAiChat();
  const [input, setInput]   = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput('');
    sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 btn btn-primary rounded-full shadow-lg flex items-center justify-center text-2xl z-50"
        title="AI Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[560px] bg-base-100 rounded-2xl shadow-2xl flex flex-col border border-base-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-200 bg-primary rounded-t-2xl">
            <div>
              <p className="font-semibold text-primary-content text-sm">Job Search AI</p>
              <p className="text-primary-content/70 text-xs">Ask about your applications</p>
            </div>
            <button
              onClick={clearHistory}
              className="text-primary-content/70 hover:text-primary-content text-xs underline"
            >
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions (only at start) */}
          {messages.length === 1 && !loading && (
            <div className="px-4 pb-2">
              <p className="text-xs text-base-content/40 mb-2">Try asking:</p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left text-xs text-primary bg-primary/10 hover:bg-primary/20 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-base-200 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={loading}
              className="input input-bordered input-sm flex-1"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="btn btn-primary btn-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
