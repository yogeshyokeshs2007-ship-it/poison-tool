import React from 'react';
import { Activity, ShieldCheck, RefreshCw, Cpu, Server } from 'lucide-react';
import type { MetricData } from '../types';

interface TopBarProps {
  metrics: MetricData | null;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ metrics, onRefresh, isLoading }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div>
        <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Secure AI Tool Usage with Verification
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Policy Guard Active
          </span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          TrustFlow General Agent Control Center (Member 1 Agent + Member 2 Remote Node)
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Node Connectivity status */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>M1 (Agent):</span>
            <span className="text-emerald-600 font-bold">Ready</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-indigo-600" />
            <span>M2 (Verifier):</span>
            <span className="text-emerald-600 font-bold">
              {metrics ? `${metrics.avgLatencyMs}ms` : 'Ready'}
            </span>
          </span>
        </div>

        {/* Online Status Pill */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span>
          <span>System Online</span>
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh Data from Node.js API"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            U
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">Project User</span>
            <span className="text-[10px] text-slate-500">Operator</span>
          </div>
        </div>
      </div>
    </header>
  );
};
