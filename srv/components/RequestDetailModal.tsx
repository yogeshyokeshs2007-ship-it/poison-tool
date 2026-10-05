import React from 'react';
import { X, ShieldAlert, ShieldCheck, Clock, CheckCircle, AlertTriangle, Layers } from 'lucide-react';
import type { HistoryItem, VerificationRecord } from '../types';

interface RequestDetailModalProps {
  item: (HistoryItem & { verification?: VerificationRecord | null }) | null;
  onClose: () => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const isBlocked = item.decision === 'BLOCK';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                isBlocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isBlocked ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                Request Details: <span className="font-mono text-blue-600">{item.id}</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">{item.time}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 text-sm font-bold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Key Attribute Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-0.5">
                Target Tool
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <span>{item.toolIcon || '🔧'}</span>
                <span>{item.tool}</span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-0.5">
                TrustFlow Verdict
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                  isBlocked
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {isBlocked ? '⊘ BLOCKED' : '✓ ALLOWED'}
              </span>
            </div>

            {item.durationMs && (
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-0.5">
                  Pipeline Duration
                </span>
                <span className="font-mono font-bold text-slate-700">{item.durationMs}ms</span>
              </div>
            )}

            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-0.5">
                Verifier
              </span>
              <span className="font-medium text-slate-700">Member 2 (TrustFlow /verify)</span>
            </div>

            {item.onlineSource && (
              <div className="col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-slate-400 font-semibold uppercase text-[10px]">
                  Live Remote Execution:
                </span>
                <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  🌐 {item.onlineSource}
                </span>
              </div>
            )}
          </div>

          {/* User Request */}
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
              User Prompt / Task
            </span>
            <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-900 font-medium">
              {item.request}
            </div>
          </div>

          {/* Planner Reasoning */}
          {item.plannerReasoning && (
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                Planner (Member 1 - planner.py) Reasoning
              </span>
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-amber-900">
                {item.plannerReasoning}
              </div>
            </div>
          )}

          {/* TrustFlow Reason */}
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
              TrustFlow Verification Analysis
            </span>
            <div
              className={`p-3 rounded-xl border font-medium ${
                isBlocked
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {item.reason}
            </div>
          </div>

          {/* OUTPUT SECTION: CORE SECURITY PRINCIPLE ENFORCEMENT */}
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
              Tool Output Access
            </span>

            {isBlocked ? (
              /* Strictly Shielded Block Banner */
              <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 text-rose-950 space-y-2">
                <div className="flex items-center gap-2 font-black text-rose-800 text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  Output Shielded by TrustFlow Security Rule
                </div>
                <p className="text-rose-800 text-xs leading-relaxed">
                  The raw tool output has been strictly purged from the client view. Because TrustFlow returned a{' '}
                  <strong className="font-bold">BLOCK</strong> decision, untrusted data, potential credential leaks, or policy
                  violations are never exposed to the agent user.
                </p>
                <div className="bg-rose-100/80 border border-rose-200 rounded-lg p-2.5 font-mono text-[11px] text-rose-900">
                  [SECURITY GUARD: RAW BUFFER WIPED (0 BYTES DELIVERED)]
                </div>
              </div>
            ) : (
              /* Approved Output Box */
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-4 text-emerald-950 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Verified Output Safe for User Consumption
                </div>
                <div className="bg-white border border-emerald-200 rounded-lg p-3 text-slate-800 whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {item.output || 'No output text returned.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
