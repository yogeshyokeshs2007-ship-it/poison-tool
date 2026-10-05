import React, { useState } from 'react';
import { ArrowRight, Check, Ban, Info, Shield, HelpCircle } from 'lucide-react';

export const SystemFlow: React.FC = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes = [
    {
      id: 'user',
      title: 'User',
      icon: '👤',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
      badge: 'Client',
      desc: 'Query / Goal input from web dashboard',
      detail: 'The human user submits an untrusted natural language task requiring one or more tool executions.'
    },
    {
      id: 'agent',
      title: 'General Agent',
      icon: '🤖',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      badge: 'agent.py',
      desc: 'Member 1 (Laptop 1)',
      detail: 'Core orchestration engine (agent.py) responsible for intent parsing, session context, and coordinating with planner.py.'
    },
    {
      id: 'planner',
      title: 'Planner',
      icon: '📋',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      badge: 'planner.py',
      desc: 'Member 1 (Laptop 1)',
      detail: 'Breaks requests down into tool sequences, evaluates parameters, and selects the optimal specialized tool.'
    },
    {
      id: 'tool',
      title: 'Any Tool',
      icon: '🔧',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
      badge: 'Executor',
      desc: 'Search, Maps, Calc, etc.',
      detail: 'Executes the targeted action (API, Python math, file read, DB query) and produces raw execution bytes.'
    },
    {
      id: 'untrusted',
      title: 'Untrusted Output',
      icon: '📄',
      color: 'bg-rose-50 border-rose-200 text-rose-900',
      badge: 'Raw Payload',
      desc: 'Raw output from tool',
      detail: 'CRITICAL SECURITY BOUNDARY: Raw tool output is considered strictly untrusted until verified by TrustFlow.'
    },
    {
      id: 'http',
      title: 'HTTP Request',
      icon: '🌐',
      color: 'bg-cyan-50 border-cyan-200 text-cyan-900',
      badge: 'POST /verify',
      desc: 'To Member 2 / Laptop 2',
      detail: 'Encrypted network transmission carrying tool metadata, prompt context, and output payload to Member 2.'
    },
    {
      id: 'trustflow',
      title: 'TrustFlow /verify',
      icon: '🛡️',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      badge: 'Verifier',
      desc: 'Remote verification service',
      detail: 'Member 2 remote verification service inspecting for prompt injections, credential leaks, PII, and unsafe data.'
    }
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold">▤</span>
            <h2 className="text-sm font-extrabold text-slate-900">System Flow Architecture</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              End-to-End Verification Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Decoupled execution model: Member 1 plans & executes tools; Member 2 verifies safety before delivery
          </p>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          Click any step to inspect technical details
        </div>
      </div>

      {/* Flow diagram horizontal container */}
      <div className="p-4 sm:p-5 overflow-x-auto bg-slate-50/50">
        <div className="flex items-center min-w-[980px] justify-between gap-2">
          {nodes.map((node, index) => {
            const isSelected = activeNode === node.id;
            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <button
                  onClick={() => setActiveNode(isSelected ? null : node.id)}
                  className={`w-[122px] min-h-[82px] border rounded-xl p-2.5 text-left transition-all duration-200 relative group flex flex-col justify-between ${
                    node.color
                  } ${
                    isSelected
                      ? 'ring-2 ring-blue-500 shadow-md scale-102'
                      : 'hover:shadow hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl leading-none">{node.icon}</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-white/70 border border-black/5 text-slate-700">
                      {node.badge}
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold leading-tight">{node.title}</div>
                    <div className="text-[9px] opacity-75 leading-tight mt-0.5">{node.desc}</div>
                  </div>
                </button>

                {/* Arrow */}
                {index < nodes.length - 1 && (
                  <div className="text-blue-500 font-bold flex-shrink-0 px-0.5 opacity-70">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Final Arrow pointing to Decisions */}
          <div className="text-blue-500 font-bold flex-shrink-0 px-0.5 opacity-70">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Decision Column */}
          <div className="flex flex-col gap-2 flex-shrink-0 w-[124px]">
            {/* ALLOW decision */}
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-2 flex items-center gap-2 shadow-xs">
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-emerald-800 tracking-wide">ALLOW</div>
                <div className="text-[8px] text-emerald-700 font-medium leading-tight">Output accessible</div>
              </div>
            </div>

            {/* BLOCK decision */}
            <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-2 flex items-center gap-2 shadow-xs">
              <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                <Ban className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-black text-rose-800 tracking-wide">BLOCK</div>
                <div className="text-[8px] text-rose-700 font-medium leading-tight">Output hidden</div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Node Detailed Info Card */}
        {activeNode && (
          <div className="mt-3.5 p-3 rounded-xl bg-white border border-blue-200 text-xs text-slate-700 shadow-xs flex items-start gap-2.5 animate-fadeIn">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <strong className="font-bold text-slate-900 mr-1.5">
                {nodes.find((n) => n.id === activeNode)?.title} Module:
              </strong>
              <span>{nodes.find((n) => n.id === activeNode)?.detail}</span>
            </div>
            <button
              onClick={() => setActiveNode(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
