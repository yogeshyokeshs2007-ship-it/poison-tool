import React from 'react';
import { BarChart3, PieChart, ShieldCheck, ShieldAlert, Zap, TrendingUp } from 'lucide-react';
import type { HistoryItem, MetricData, ToolItem } from '../types';

interface AnalyticsViewProps {
  metrics: MetricData | null;
  history: HistoryItem[];
  tools: ToolItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ metrics, history, tools }) => {
  const total = metrics?.totalRequests || history.length || 24;
  const allowed = metrics?.allowedRequests || history.filter((h) => h.decision === 'ALLOW').length || 18;
  const blocked = metrics?.blockedRequests || history.filter((h) => h.decision === 'BLOCK').length || 6;

  const allowedPct = Math.round((allowed / total) * 100);
  const blockedPct = 100 - allowedPct;

  // Tool frequency breakdown
  const toolCounts: Record<string, number> = {};
  history.forEach((h) => {
    toolCounts[h.tool] = (toolCounts[h.tool] || 0) + 1;
  });

  const topTools = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Verification Ratio</span>
            <PieChart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{allowedPct}%</span>
            <span className="text-xs font-bold text-emerald-600">Approval Rate</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
            <div className="bg-emerald-500 h-2.5" style={{ width: `${allowedPct}%` }}></div>
            <div className="bg-rose-500 h-2.5" style={{ width: `${blockedPct}%` }}></div>
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2">
            <span className="text-emerald-700">✓ {allowed} Allowed</span>
            <span className="text-rose-700">⊘ {blocked} Blocked</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Remote Verifier Latency</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics?.avgLatencyMs || 148}</span>
            <span className="text-xs font-bold text-slate-500">ms avg</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Laptop 2 / Member 2 HTTP verification round-trip execution latency
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Tools Portfolio</span>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{tools.length}</span>
            <span className="text-xs font-bold text-purple-600">Registered</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Across 5 functional domains: General, Utility, Analysis, Dev & Data
          </p>
        </div>
      </div>

      {/* Top Tools Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          Frequently Invoked Tools
        </h3>
        <div className="space-y-3">
          {topTools.map(([toolName, count]) => {
            const pct = Math.round((count / (history.length || 1)) * 100);
            return (
              <div key={toolName}>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{toolName}</span>
                  <span className="text-slate-500 font-mono">
                    {count} runs ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.max(pct, 12)}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
