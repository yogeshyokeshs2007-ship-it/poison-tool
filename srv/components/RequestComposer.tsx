import React, { useState } from 'react';
import { Send, Paperclip, Wrench, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import type { ToolItem } from '../types';

interface RequestComposerProps {
  tools: ToolItem[];
  onSubmit: (prompt: string, selectedTool?: string) => Promise<void>;
  isProcessing: boolean;
  selectedToolName?: string;
  onSelectToolName?: (tool: string) => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const RequestComposer: React.FC<RequestComposerProps> = ({
  tools,
  onSubmit,
  isProcessing,
  selectedToolName,
  onSelectToolName,
  onShowToast
}) => {
  const [prompt, setPrompt] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  const samplePrompts = [
    { label: '🌤️ Live Weather (Tokyo)', text: "What's the weather in Tokyo right now?", safe: true },
    { label: '🔎 Live Search (Quantum)', text: "Search online for Quantum computing algorithms", safe: true },
    { label: '◉ Live GitHub (Agents)', text: "Search GitHub for multi-agent autonomous framework", safe: true },
    { label: '💲 Live Forex (USD/EUR)', text: "What is the live exchange rate for USD to EUR and JPY?", safe: true },
    { label: '☁️ Live API Fetch', text: "Fetch live API from https://catfact.ninja/fact", safe: true },
    { label: '🧮 Live Math Evaluator', text: "Calculate sqrt(144) * 25 + pow(2, 6)", safe: true },
    { label: '⚠️ Leaked Key (Block Demo)', text: "Analyze this document for confidential passwords and database credentials", safe: false }
  ];

  const handleSend = async () => {
    if (!prompt.trim()) {
      onShowToast('Please enter a request prompt first.', 'warning');
      return;
    }
    if (isProcessing) return;

    try {
      const fullPrompt = attachedFile ? `[Attachment: ${attachedFile}] ${prompt}` : prompt;
      await onSubmit(fullPrompt, selectedToolName);
      setPrompt('');
      setAttachedFile(null);
    } catch (err: any) {
      onShowToast(err.message || 'Error executing request', 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filename = e.target.files[0].name;
      setAttachedFile(filename);
      onShowToast(`Attached file: ${filename}`, 'info');
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold">▱</span>
            <h2 className="text-sm font-extrabold text-slate-900">New Request</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ask the general agent to execute tools. All outputs are verified by TrustFlow before display.
          </p>
        </div>

        {/* Selected Tool Pill if manually chosen */}
        {selectedToolName && (
          <div className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg font-medium">
            <span>Tool override:</span>
            <strong>{selectedToolName}</strong>
            <button
              onClick={() => onSelectToolName?.('')}
              className="text-blue-400 hover:text-blue-700 font-bold text-xs ml-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        {/* Quick Sample Presets */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPrompt(p.text)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                p.safe
                  ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Text Input */}
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            placeholder='Enter your request here...&#10;Example: "Find the weather in New York and summarize conditions"&#10;(Press Ctrl+Enter or Cmd+Enter to dispatch)'
            className="w-full min-h-[110px] p-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
          />

          {attachedFile && (
            <div className="mt-2 flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-1.5 rounded-lg">
              <span className="flex items-center gap-1.5 font-medium">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                Attached: <strong>{attachedFile}</strong>
              </span>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-blue-500 hover:text-blue-800 font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {/* File upload button */}
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span>Attach File</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileAttach}
                disabled={isProcessing}
              />
            </label>

            {/* Tool Selector Dropdown */}
            <div className="relative inline-block text-left">
              <select
                value={selectedToolName || ''}
                onChange={(e) => onSelectToolName?.(e.target.value)}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <option value="">Auto-Planner Decision</option>
                {tools.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.icon} {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSend}
            disabled={isProcessing || !prompt.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-600/20 transition-all transform active:scale-98 disabled:transform-none disabled:cursor-not-allowed ml-auto"
          >
            {isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Executing Pipeline...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Request</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
