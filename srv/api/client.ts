import type {
  HistoryItem,
  LogEntry,
  MetricData,
  ToolItem,
  VerificationRecord,
  TrustFlowVerifyResponse
} from '../types';

export interface ExecuteRequestResult {
  record: HistoryItem;
  verification: TrustFlowVerifyResponse;
  steps: {
    step: number;
    name: string;
    status: string;
    info: string;
  }[];
}

export const api = {
  async getMetrics(): Promise<MetricData> {
    const res = await fetch('/api/metrics');
    if (!res.ok) throw new Error('Failed to fetch metrics');
    const json = await res.json();
    return json.data;
  },

  async getTools(category?: string): Promise<ToolItem[]> {
    const url = category && category !== 'all' ? `/api/tools?category=${encodeURIComponent(category)}` : '/api/tools';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch tools');
    const json = await res.json();
    return json.data;
  },

  async getHistory(params?: { search?: string; filter?: string; tool?: string }): Promise<HistoryItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.filter) query.append('filter', params.filter);
    if (params?.tool) query.append('tool', params.tool);

    const url = `/api/history${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch request history');
    const json = await res.json();
    return json.data;
  },

  async getHistoryById(id: string): Promise<HistoryItem & { verification?: VerificationRecord }> {
    const res = await fetch(`/api/history/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Failed to fetch request ${id}`);
    const json = await res.json();
    return json.data;
  },

  async getVerifications(): Promise<VerificationRecord[]> {
    const res = await fetch('/api/verifications');
    if (!res.ok) throw new Error('Failed to fetch verifications');
    const json = await res.json();
    return json.data;
  },

  async getLogs(level?: string): Promise<LogEntry[]> {
    const url = level && level !== 'ALL' ? `/api/logs?level=${encodeURIComponent(level)}` : '/api/logs';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch system logs');
    const json = await res.json();
    return json.data;
  },

  async clearLogs(): Promise<void> {
    const res = await fetch('/api/logs/clear', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear logs');
  },

  async sendRequest(requestText: string, selectedTool?: string): Promise<ExecuteRequestResult> {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: requestText, selectedTool })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit request to agent');
    }
    const json = await res.json();
    return json.data;
  },

  async verifyDirect(tool: string, output: string, userPrompt?: string): Promise<TrustFlowVerifyResponse> {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, output, userPrompt })
    });
    if (!res.ok) throw new Error('TrustFlow direct verification failed');
    const json = await res.json();
    return json.data;
  }
};
