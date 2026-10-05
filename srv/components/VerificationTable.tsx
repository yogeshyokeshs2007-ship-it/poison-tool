import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';
import type { VerificationRecord } from '../types';

interface VerificationTableProps {
  records: VerificationRecord[];
}

export const VerificationTable: React.FC<VerificationTableProps> = ({ records }) => {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col mb-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold">🛡️</span>
            <h2 className="text-sm font-extrabold text-slate-900">TrustFlow Remote Verification</h2>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              Audit Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming tool outputs verified remotely on Member 2 / Laptop 2 before dispatch to user
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold self-start sm:self-auto">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          Member 2 / Laptop 2 Node
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 w-20">Time</th>
              <th className="py-2.5 px-3 w-24">Request ID</th>
              <th className="py-2.5 px-3 w-28">Tool</th>
              <th className="py-2.5 px-4 min-w-[220px]">Tool Output Sample</th>
              <th className="py-2.5 px-3 w-28">Decision</th>
              <th className="py-2.5 px-4 min-w-[200px]">Security Reason</th>
              <th className="py-2.5 px-3 text-right pr-4 w-20">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No verification records found.
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                    {rec.time}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-[11px]">
                    {rec.requestId}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {rec.tool}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                    {rec.decision === 'BLOCK' ? (
                      <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {rec.toolOutput}
                      </span>
                    ) : (
                      <span className="line-clamp-1">{rec.toolOutput}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {rec.decision === 'ALLOW' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Allow
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        Block
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 text-[11px] leading-tight">
                    {rec.reason}
                  </td>
                  <td className="py-2.5 px-3 text-right pr-4 font-mono text-slate-500 text-[11px]">
                    {rec.latencyMs}ms
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
