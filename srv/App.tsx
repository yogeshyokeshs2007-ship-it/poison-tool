/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MetricsCards } from './components/MetricsCard';
import { SystemFlow } from './components/SystemFlow';
import { RequestComposer } from './components/RequestComposer';
import { ProgressPipeline, StepItem } from './components/progressPipline';
import { RequestHistoryTable } from './components/RequestHistoryTable';
import { ToolsGrid } from './components/ToolsGrid';
import { VerificationTable } from './components/VerificationTable';
import { SystemLogs } from './components/Systemlogs';
import { RequestDetailModal } from './components/RequestDetailModal';
import { AnalyticsView } from './components/analyticsView';
import { SettingsView } from './components/SettingsView';
import { Toast } from './components/Toast';
import { api } from './api/client';
import type { HistoryItem, LogEntry, MetricData, ToolItem, VerificationRecord, Decision } from './types';

const defaultSteps: StepItem[] = [
  { step: 1, name: 'Received', info: '--:--:--', status: 'pending' },
  { step: 2, name: 'Planning', info: '--:--:--', status: 'pending' },
  { step: 3, name: 'Tool Execution', info: 'Tool not executed', status: 'pending' },
  { step: 4, name: 'Verification', info: 'Waiting for request', status: 'pending' },
  { step: 5, name: 'Decision', info: 'Allow or Block', status: 'pending' },
  { step: 6, name: 'Complete', info: 'Final result', status: 'pending' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Stepper state
  const [steps, setSteps] = useState<StepItem[]>(defaultSteps);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);

  // Form & selection state
  const [selectedToolName, setSelectedToolName] = useState<string>('');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  // Search & filter
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyFilter, setHistoryFilter] = useState<string>('ALL');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  const showToast = useCallback((msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  }, []);

  // Fetch all dashboard data from Node.js API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [metricsData, toolsData, historyData, verificationsData, logsData] = await Promise.all([
        api.getMetrics().catch(() => null),
        api.getTools().catch(() => []),
        api.getHistory().catch(() => []),
        api.getVerifications().catch(() => []),
        api.getLogs().catch(() => [])
      ]);

      if (metricsData) setMetrics(metricsData);
      setTools(toolsData);
      setHistory(historyData);
      setVerifications(verificationsData);
      setLogs(logsData);
    } catch (err: any) {
      showToast('Error synchronizing with backend: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
    showToast('TrustFlow General Agent Dashboard initialized', 'success');
  }, [loadData, showToast]);

  // Execute request through the Node.js API pipeline
  const handleSubmitRequest = async (promptText: string, toolOverride?: string) => {
    setIsProcessing(true);
    setCurrentDecision(null);
    const now = new Date().toLocaleTimeString('en-US', { hour12: false });

    // Step 1: Received
    setSteps([
      { step: 1, name: 'Received', info: `${now} • Request captured`, status: 'done' },
      { step: 2, name: 'Planning', info: 'Selecting tool...', status: 'active' },
      { step: 3, name: 'Tool Execution', info: 'Pending', status: 'pending' },
      { step: 4, name: 'Verification', info: 'Pending', status: 'pending' },
      { step: 5, name: 'Decision', info: 'Pending', status: 'pending' },
      { step: 6, name: 'Complete', info: 'Pending', status: 'pending' }
    ]);

    // Small delay to visualize step 2 (Planning)
    await new Promise((r) => setTimeout(r, 450));
    setSteps((prev) => [
      prev[0],
      { step: 2, name: 'Planning', info: `${now} • Planner assigned tool`, status: 'done' },
      { step: 3, name: 'Tool Execution', info: 'Executing action...', status: 'active' },
      prev[3],
      prev[4],
      prev[5]
    ]);

    // Small delay for step 3 (Tool Execution)
    await new Promise((r) => setTimeout(r, 550));
    setSteps((prev) => [
      prev[0],
      prev[1],
      { step: 3, name: 'Tool Execution', info: `${now} • Untrusted output captured`, status: 'done' },
      { step: 4, name: 'Verification', info: 'Calling TrustFlow /verify...', status: 'active' },
      prev[4],
      prev[5]
    ]);

    try {
      // Call backend API (Agent -> Planner -> Tool -> TrustFlow /verify)
      const result = await api.sendRequest(promptText, toolOverride);
      const { record, verification } = result;

      setActiveRequestId(record.id);
      setCurrentDecision(verification.decision);

      // Step 4: Verification completed
      await new Promise((r) => setTimeout(r, 400));
      setSteps((prev) => [
        prev[0],
        prev[1],
        prev[2],
        { step: 4, name: 'Verification', info: `${verification.timestamp} • TrustFlow responded (${verification.latencyMs}ms)`, status: 'done' },
        { step: 5, name: 'Decision', info: `Verdict: ${verification.decision}`, status: verification.decision === 'BLOCK' ? 'blocked' : 'done' },
        {
          step: 6,
          name: 'Complete',
          info: verification.decision === 'ALLOW' ? 'Safe output delivered' : 'Output shielded & wiped',
          status: verification.decision === 'BLOCK' ? 'blocked' : 'done'
        }
      ]);

      if (verification.decision === 'BLOCK') {
        showToast(`TrustFlow BLOCKED the output: ${verification.reason}`, 'error');
      } else {
        showToast('TrustFlow ALLOWED the output. Safe response delivered.', 'success');
      }

      // Re-fetch state
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Execution failed', 'error');
      setSteps(defaultSteps);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await api.clearLogs();
      setLogs([]);
      showToast('System logs cleared', 'info');
    } catch {
      showToast('Failed to clear logs', 'error');
    }
  };

  // Filtered history list
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.request.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.tool.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.id.toLowerCase().includes(historySearch.toLowerCase()) ||
      item.reason.toLowerCase().includes(historySearch.toLowerCase());

    const matchesFilter =
      historyFilter === 'ALL' || item.decision === historyFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRequestsCount={isProcessing ? 1 : 0}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          metrics={metrics}
          onRefresh={loadData}
          isLoading={isLoading}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-5">
          {/* Always display top high-level KPIs */}
          <MetricsCards
            metrics={metrics}
            onFilterHistory={(type) => {
              setHistoryFilter(type);
              setActiveTab('history');
            }}
          />

          {/* Tab: Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* Architecture diagram */}
              <SystemFlow />

              {/* Workspace Two-Column */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Request & Live Status */}
                <div className="lg:col-span-7 space-y-5">
                  <RequestComposer
                    tools={tools}
                    onSubmit={handleSubmitRequest}
                    isProcessing={isProcessing}
                    selectedToolName={selectedToolName}
                    onSelectToolName={setSelectedToolName}
                    onShowToast={showToast}
                  />

                  <ProgressPipeline
                    steps={steps}
                    currentDecision={currentDecision}
                    activeRequestId={activeRequestId}
                  />

                  <RequestHistoryTable
                    history={filteredHistory.slice(0, 5)}
                    onViewDetails={setSelectedHistoryItem}
                    filter={historyFilter}
                    onFilterChange={setHistoryFilter}
                    search={historySearch}
                    onSearchChange={setHistorySearch}
                  />
                </div>

                {/* Right Column: Tools, Verification & Logs */}
                <div className="lg:col-span-5 space-y-5">
                  <ToolsGrid
                    tools={tools}
                    onSelectTool={(name) => {
                      setSelectedToolName(name);
                      showToast(`Selected tool: ${name} (Planner override ready)`, 'info');
                    }}
                    selectedToolName={selectedToolName}
                  />

                  <VerificationTable records={verifications.slice(0, 5)} />

                  <SystemLogs
                    logs={logs}
                    onClearLogs={handleClearLogs}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: New Request */}
          {activeTab === 'new-request' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              <RequestComposer
                tools={tools}
                onSubmit={handleSubmitRequest}
                isProcessing={isProcessing}
                selectedToolName={selectedToolName}
                onSelectToolName={setSelectedToolName}
                onShowToast={showToast}
              />

              <ProgressPipeline
                steps={steps}
                currentDecision={currentDecision}
                activeRequestId={activeRequestId}
              />

              <SystemFlow />
            </div>
          )}

          {/* Tab: History */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              <RequestHistoryTable
                history={filteredHistory}
                onViewDetails={setSelectedHistoryItem}
                filter={historyFilter}
                onFilterChange={setHistoryFilter}
                search={historySearch}
                onSearchChange={setHistorySearch}
              />
            </div>
          )}

          {/* Tab: Tools */}
          {activeTab === 'tools' && (
            <div className="space-y-5">
              <ToolsGrid
                tools={tools}
                onSelectTool={(name) => {
                  setSelectedToolName(name);
                  setActiveTab('new-request');
                  showToast(`Selected tool: ${name}. Ready to compose request.`, 'info');
                }}
                selectedToolName={selectedToolName}
              />
            </div>
          )}

          {/* Tab: Verification */}
          {activeTab === 'verification' && (
            <div className="space-y-5">
              <VerificationTable records={verifications} />
            </div>
          )}

          {/* Tab: Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-5">
              <SystemLogs
                logs={logs}
                onClearLogs={handleClearLogs}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Tab: Analytics */}
          {activeTab === 'analytics' && (
            <AnalyticsView
              metrics={metrics}
              history={history}
              tools={tools}
            />
          )}

          {/* Tab: Settings */}
          {activeTab === 'settings' && (
            <SettingsView
              onShowToast={showToast}
              onRefreshData={loadData}
            />
          )}
        </main>
      </div>

      {/* Request Details Inspection Modal */}
      <RequestDetailModal
        item={selectedHistoryItem}
        onClose={() => setSelectedHistoryItem(null)}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
