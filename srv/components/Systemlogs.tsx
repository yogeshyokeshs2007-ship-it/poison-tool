import React, { useRef, useEffect, useState } from 'react';
import { Terminal, Trash2, Filter } from 'lucide-react';
import type { LogEntry } from '../types';

interface SystemLogsProps {
  logs: LogEntry[];
  onClearLogs: () => Promise<void>;
  isLoading?: boolean;
}

export const SystemLogs: React.FC<SystemLogsProps> = ({ logs, onClearLogs, isLoading }) => {
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((log) => {
    if (levelFilter === 'ALL') return true;
    return log.type === levelFilter;
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col mb-5">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold">▤</span>
            <h2 className="text-sm font-extrabold text-slate-900">System Logs</h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              {filteredLogs.length} events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Agent, planner, tool execution, and TrustFlow remote events
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Level Filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO Only</option>
            <option value="BLOCK">BLOCK Only</option>
            <option value="SUCCESS">SUCCESS Only</option>
            <option value="WARN">WARN Only</option>
          </select>

          {/* Clear Logs */}
          <button
            onClick={onClearLogs}
            disabled={isLoading || logs.length === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal View */}
      <div
        ref={scrollRef}
        className="bg-[#07111f] text-[#d1fae5] p-4 font-mono text-[11px] leading-relaxed min-h-[170px] max-h-[260px] overflow-y-auto selection:bg-blue-800 selection:text-white"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 italic py-4 text-center">
            No system log events recorded for current filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const typeColor = {
              INFO: 'text-emerald-400 font-bold',
              SUCCESS: 'text-sky-400 font-bold',
              WARN: 'text-amber-400 font-bold',
              BLOCK: 'text-rose-400 font-extrabold'
            }[log.type] || 'text-slate-300';

            const compColor = {
              AGENT: 'text-purple-300',
              PLANNER: 'text-amber-300',
              TOOL: 'text-blue-300',
              TRUSTFLOW: 'text-emerald-300',
              SYSTEM: 'text-slate-400'
            }[log.component] || 'text-slate-400';

            return (
              <div key={log.id} className="py-0.5 hover:bg-slate-900/60 px-1 rounded flex items-start gap-2">
                <span className="text-slate-500 flex-shrink-0">[{log.time}]</span>
                <span className={`px-1 rounded text-[10px] uppercase flex-shrink-0 ${typeColor}`}>
                  {log.type}
                </span>
                <span className={`text-[10px] font-bold ${compColor}`}>
                  [{log.component}]
                </span>
                <span className="text-slate-200 flex-1 break-words">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
