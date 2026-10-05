import React from 'react';
import {
  Shield,
  LayoutDashboard,
  PlusCircle,
  History,
  Wrench,
  ShieldCheck,
  FileText,
  BarChart3,
  Settings,
  GraduationCap,
  Laptop
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingRequestsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingRequestsCount = 0
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-request', label: 'New Request', icon: PlusCircle },
    { id: 'history', label: 'Request History', icon: History },
    { id: 'tools', label: 'Tools Directory', icon: Wrench },
    { id: 'verification', label: 'TrustFlow Verification', icon: ShieldCheck },
    { id: 'logs', label: 'System Logs', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0f1d33] text-white flex flex-col flex-shrink-0 min-h-screen p-3 border-r border-slate-800 selection:bg-blue-600">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-3 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-600/30 text-white font-bold text-xl">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight leading-tight text-white flex items-center gap-1.5">
            TrustFlow
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              v2.4
            </span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">General Agent Sandbox</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.id === 'new-request' && pendingRequestsCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* College Project / Hackathon Metadata Card */}
      <div className="mt-auto bg-slate-900/80 border border-slate-700/60 rounded-xl p-3.5 shadow-sm text-xs text-slate-300">
        <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[10px] uppercase tracking-wider mb-2">
          <GraduationCap className="w-3.5 h-3.5" />
          Project Architecture
        </div>
        <strong className="block text-white text-[13px] font-bold mb-1.5">TrustFlow General Agent</strong>
        <p className="text-[11px] text-slate-400 leading-relaxed space-y-1">
          <span className="block font-medium text-slate-300">College Hackathon System</span>
          <span className="flex items-center gap-1 text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            <strong>Member 1:</strong> agent.py, planner.py
          </span>
          <span className="flex items-center gap-1 text-[10.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block"></span>
            <strong>Member 2:</strong> TrustFlow /verify
          </span>
          <span className="block text-[10px] text-slate-500 pt-1 border-t border-slate-800 mt-2 flex items-center gap-1">
            <Laptop className="w-3 h-3 text-slate-400" /> Remote Verification Service
          </span>
        </p>
      </div>
    </aside>
  );
};
