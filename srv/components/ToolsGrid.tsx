import React, { useState } from 'react';
import { Wrench, Shield, Check, Search } from 'lucide-react';
import type { ToolItem } from '../types';

interface ToolsGridProps {
  tools: ToolItem[];
  onSelectTool: (toolName: string) => void;
  selectedToolName?: string;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({
  tools,
  onSelectTool,
  selectedToolName
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'general', label: 'General' },
    { id: 'utility', label: 'Utility' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'developer', label: 'Developer' },
    { id: 'data', label: 'Data' }
  ];

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold">🔧</span>
            <h2 className="text-sm font-extrabold text-slate-900">Available Agent Tools</h2>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
              {tools.length} Tools Configured
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tools selectable by planner.py for agent orchestration with verified execution guardrails
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="pl-8 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {filteredTools.map((tool) => {
            const isSelected = selectedToolName === tool.name;
            const riskColors = {
              LOW: 'text-emerald-700 bg-emerald-50 border-emerald-200',
              MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200',
              HIGH: 'text-rose-700 bg-rose-50 border-rose-200'
            };

            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.name)}
                title={`${tool.name}: ${tool.description}`}
                className={`p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between group relative ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl leading-none">{tool.icon}</span>
                  <div className="flex items-center gap-1">
                    {tool.isOnline && (
                      <span className="text-[7.5px] font-black text-sky-700 bg-sky-50 px-1 py-0.2 rounded border border-sky-200">
                        LIVE
                      </span>
                    )}
                    <span
                      className={`text-[8px] font-extrabold uppercase px-1 py-0.2 rounded border ${
                        riskColors[tool.riskLevel]
                      }`}
                    >
                      {tool.riskLevel}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-900 truncate group-hover:text-blue-600">
                    {tool.name}
                  </div>
                  <div className="text-[9px] text-slate-400 capitalize truncate mt-0.5">
                    {tool.category}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
