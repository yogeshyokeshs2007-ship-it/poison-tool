import React from 'react';
import { Layers, CheckCircle2, Ban, Wrench } from 'lucide-react';
import type { MetricData } from '../types';

interface MetricsCardsProps {
  metrics: MetricData | null;
  onFilterHistory?: (type: 'ALL' | 'ALLOW' | 'BLOCK') => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, onFilterHistory }) => {
  const total = metrics?.totalRequests ?? 24;
  const allowed = metrics?.allowedRequests ?? 18;
  const blocked = metrics?.blockedRequests ?? 6;
  const tools = metrics?.toolsUsed ?? 12;

  const allowedPercentage = total > 0 ? Math.round((allowed / total) * 100) : 75;
  const blockedPercentage = total > 0 ? Math.round((blocked / total) * 100) : 25;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
      {/* 1. Total Requests */}
      <div
        onClick={() => onFilterHistory?.('ALL')}
        className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
          <Layers className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            Total Requests
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{total}</span>
            <span className="text-[10px] font-bold text-emerald-600">↑ 12%</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 text-right leading-tight hidden xl:block">
          Since last<br />session
        </div>
      </div>

      {/* 2. Allowed Outputs */}
      <div
        onClick={() => onFilterHistory?.('ALLOW')}
        className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            Allowed Outputs
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{allowed}</span>
            <span className="text-[10px] font-bold text-emerald-600">({allowedPercentage}%)</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 text-right leading-tight hidden xl:block">
          Approved by<br />TrustFlow
        </div>
      </div>

      {/* 3. Blocked Outputs */}
      <div
        onClick={() => onFilterHistory?.('BLOCK')}
        className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
      >
        <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
          <Ban className="w-5 h-5 text-rose-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            Blocked Outputs
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{blocked}</span>
            <span className="text-[10px] font-bold text-rose-600">({blockedPercentage}%)</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 text-right leading-tight hidden xl:block">
          Shielded by<br />TrustFlow
        </div>
      </div>

      {/* 4. Tools Used */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl flex-shrink-0 group-hover:scale-105 transition-transform">
          <Wrench className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
            Tools Used
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{tools}</span>
            <span className="text-[10px] font-bold text-purple-600">/ 26 Active</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 text-right leading-tight hidden xl:block">
          Unique tools<br />accessed
        </div>
      </div>
    </section>
  );
};
