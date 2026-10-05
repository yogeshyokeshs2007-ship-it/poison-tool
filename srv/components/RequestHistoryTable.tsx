import React, { useState } from 'react';
import { Search, Eye, Filter, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { HistoryItem } from '../types';

interface RequestHistoryTableProps {
  history: HistoryItem[];
  onViewDetails: (item: HistoryItem) => void;
  filter: string;
  onFilterChange: (f: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
}

export const RequestHistoryTable: React.FC<RequestHistoryTableProps> = ({
  history,
  onViewDetails,
  filter,
  onFilterChange,
  search,
  onSearchChange
}) => {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold">◷</span>
            <h2 className="text-sm font-extrabold text-slate-900">Request History</h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {history.length} Entries
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of general agent queries, tool interactions, and TrustFlow verdicts
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search requests..."
              className="pl-8 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white w-40 sm:w-48 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ALLOW">Allowed Only</option>
              <option value="BLOCK">Blocked Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 w-12 text-center">#</th>
              <th className="py-2.5 px-3 w-20">Time</th>
              <th className="py-2.5 px-4 min-w-[200px]">Request</th>
              <th className="py-2.5 px-3 min-w-[120px]">Tool</th>
              <th className="py-2.5 px-3 min-w-[130px]">TrustFlow Decision</th>
              <th className="py-2.5 px-3 w-28">Status</th>
              <th className="py-2.5 px-3 text-right pr-4 w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {history.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No request history matched your search filter.
                </td>
              </tr>
            ) : (
              history.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 text-center font-bold text-slate-400">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {item.time}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-semibold text-slate-900 line-clamp-1">
                      {item.request}
                    </span>
                    <span className="text-[10px] text-slate-400 block line-clamp-1">
                      ID: {item.id} • {item.reason}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium">
                      <span>{item.toolIcon || '🔧'}</span>
                      <span>{item.tool}</span>
                      {item.isOnlineExecution && (
                        <span className="text-[7.5px] font-black text-sky-700 bg-sky-50 px-1 py-0.2 rounded border border-sky-200">
                          LIVE
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {item.decision === 'ALLOW' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Allow
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        Block
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Completed
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right pr-4">
                    <button
                      onClick={() => onViewDetails(item)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
