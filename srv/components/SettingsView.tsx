import React, { useState } from 'react';
import { Settings, Shield, Server, Laptop, RefreshCw, Check } from 'lucide-react';

interface SettingsViewProps {
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast, onRefreshData }) => {
  const [remoteEndpoint, setRemoteEndpoint] = useState('http://laptop2.local:8000/verify');
  const [sensitivity, setSensitivity] = useState<'Standard' | 'Strict' | 'Paranoid'>('Strict');
  const [member1Host, setMember1Host] = useState('http://localhost:5000 (agent.py)');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    onShowToast('Settings updated successfully', 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetData = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const result: { error?: string } = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to reset data');
      onRefreshData();
      onShowToast('Database reset to initial demo state', 'info');
    } catch (error: unknown) {
      onShowToast(error instanceof Error ? error.message : 'Failed to reset data', 'error');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-3xl space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          General Agent & TrustFlow Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure connection endpoints for the distributed Member 1 & Member 2 hackathon architecture.
        </p>
      </div>

      <div className="space-y-4 text-xs">
        {/* Member 1 Setup */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
            <Laptop className="w-4 h-4 text-blue-600" />
            Member 1 Node (agent.py & planner.py)
          </label>
          <input
            type="text"
            value={member1Host}
            onChange={(e) => setMember1Host(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Local runtime hosting intent resolution, memory management, and tool dispatchers.
          </p>
        </div>

        {/* Member 2 Setup */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
            <Server className="w-4 h-4 text-indigo-600" />
            Member 2 Remote Verification URL (TrustFlow /verify)
          </label>
          <input
            type="text"
            value={remoteEndpoint}
            onChange={(e) => setRemoteEndpoint(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            HTTP POST endpoint deployed on Laptop 2 evaluating raw tool outputs for sensitive information.
          </p>
        </div>

        {/* Policy Rigor */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            TrustFlow Inspection Sensitivity
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['Standard', 'Strict', 'Paranoid'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSensitivity(lvl)}
                className={`py-2 px-3 rounded-lg border font-bold text-xs transition-all ${
                  sensitivity === lvl
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            <strong>Strict:</strong> Checks for API tokens, passwords, system path traversal, PII, and shell injection.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Initial Demo State
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-600/20 transition-all"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : null}
            {saved ? 'Saved!' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
