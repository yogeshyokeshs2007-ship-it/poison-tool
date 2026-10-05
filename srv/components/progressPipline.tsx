import React from 'react';
import { Check, Clock, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { Decision } from '../types';

export interface StepItem {
  step: number;
  name: string;
  info: string;
  status: 'pending' | 'active' | 'done' | 'blocked';
}

interface ProgressPipelineProps {
  steps: StepItem[];
  currentDecision?: Decision | null;
  activeRequestId?: string | null;
}

export const ProgressPipeline: React.FC<ProgressPipelineProps> = ({
  steps,
  currentDecision,
  activeRequestId
}) => {
  // Calculate fill percentage
  const completedStepsCount = steps.filter((s) => s.status === 'done' || s.status === 'blocked').length;
  const activeStepIndex = steps.findIndex((s) => s.status === 'active');
  const effectiveProgress =
    activeStepIndex >= 0
      ? ((activeStepIndex + 0.5) / (steps.length - 1)) * 100
      : (completedStepsCount / steps.length) * 100;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold">〽</span>
            <h2 className="text-sm font-extrabold text-slate-900">Current Request Status</h2>
            {activeRequestId && (
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {activeRequestId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-agent execution pipeline & remote TrustFlow verdict
          </p>
        </div>

        {currentDecision && (
          <div className="flex items-center gap-1.5">
            {currentDecision === 'ALLOW' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ALLOW Verdict
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                BLOCK Verdict (Output Shielded)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress body */}
      <div className="px-5 py-6">
        <div className="relative flex items-center justify-between">
          {/* Background Track Line */}
          <div className="absolute left-6 right-6 top-4 h-1 bg-slate-200 z-0"></div>

          {/* Active Fill Line */}
          <div
            className={`absolute left-6 top-4 h-1 z-0 transition-all duration-500 ${
              currentDecision === 'BLOCK' ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(Math.max(effectiveProgress, 0), 100)}%` }}
          ></div>

          {/* 6 Steps */}
          {steps.map((st) => {
            const isDone = st.status === 'done';
            const isActive = st.status === 'active';
            const isBlocked = st.status === 'blocked';

            return (
              <div key={st.step} className="flex-1 text-center relative z-10 flex flex-col items-center">
                {/* Circle Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 shadow-sm ${
                    isBlocked
                      ? 'bg-rose-600 text-white border-2 border-rose-700 shadow-rose-300 ring-4 ring-rose-100'
                      : isDone
                      ? 'bg-emerald-500 text-white border-2 border-emerald-600 shadow-emerald-200'
                      : isActive
                      ? 'bg-white text-blue-600 border-3 border-blue-600 shadow-blue-200 ring-4 ring-blue-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {isBlocked ? (
                    '⊘'
                  ) : isDone ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : isActive ? (
                    '●'
                  ) : (
                    st.step
                  )}
                </div>

                {/* Step label */}
                <div
                  className={`text-[11px] font-extrabold mt-2 leading-tight ${
                    isBlocked
                      ? 'text-rose-700 font-black'
                      : isDone
                      ? 'text-emerald-700'
                      : isActive
                      ? 'text-blue-700'
                      : 'text-slate-600'
                  }`}
                >
                  {st.name}
                </div>

                {/* Sub info */}
                <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-2 max-w-[110px] leading-tight font-medium">
                  {st.info}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
