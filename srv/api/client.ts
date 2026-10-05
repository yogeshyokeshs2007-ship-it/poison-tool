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

interface ApiEnvelope<T> {
  data?: T;
  error?: string;
}

async function readApiResponse<T>(response: Response, fallback: string): Promise<ApiEnvelope<T>> {
  const body = await response.text();
  let payload: ApiEnvelope<T> | undefined;

  try {
    payload = JSON.parse(body) as ApiEnvelope<T>;
  } catch {
    // Vercel and other proxies may return plain text or HTML for runtime errors.
  }

  if (!response.ok) {
    const detail = payload?.error || body.trim().slice(0, 300);
    throw new Error(
      detail
        ? `Backend error (HTTP ${response.status}): ${detail}`
        : `${fallback} (HTTP ${response.status})`
    );
  }

  if (!payload) {
    throw new Error(`${fallback}: backend returned a non-JSON response (HTTP ${response.status})`);
  }

  return payload;
}

async function getApiData<T>(response: Response, fallback: string): Promise<T> {
  const payload = await readApiResponse<T>(response, fallback);
  if (payload.data === undefined) throw new Error(fallback);
  return payload.data;
}

async function checkApiResponse(response: Response, fallback: string): Promise<void> {
  await readApiResponse<never>(response, fallback);
}

export const api = {
  async getMetrics(): Promise<MetricData> {
    return getApiData(await fetch('/api/metrics'), 'Failed to fetch metrics');
  },

  async getTools(category?: string): Promise<ToolItem[]> {
    const url = category && category !== 'all' ? '/api/tools?category=' + encodeURIComponent(category) : '/api/tools';
    return getApiData(await fetch(url), 'Failed to fetch tools');
  },

  async getHistory(params?: { search?: string; filter?: string; tool?: string }): Promise<HistoryItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.filter) query.append('filter', params.filter);
    if (params?.tool) query.append('tool', params.tool);
    const url = '/api/history' + (query.toString() ? '?' + query.toString() : '');
    return getApiData(await fetch(url), 'Failed to fetch request history');
  },

  async getHistoryById(id: string): Promise<HistoryItem & { verification?: VerificationRecord }> {
    return getApiData(await fetch('/api/history/' + encodeURIComponent(id)), 'Failed to fetch request ' + id);
  },

  async getVerifications(): Promise<VerificationRecord[]> {
    return getApiData(await fetch('/api/verifications'), 'Failed to fetch verifications');
  },

  async getLogs(level?: string): Promise<LogEntry[]> {
    const url = level && level !== 'ALL' ? '/api/logs?level=' + encodeURIComponent(level) : '/api/logs';
    return getApiData(await fetch(url), 'Failed to fetch system logs');
  },

  async clearLogs(): Promise<void> {
    await checkApiResponse(await fetch('/api/logs/clear', { method: 'POST' }), 'Failed to clear logs');
  },

  async resetData(): Promise<void> {
    await checkApiResponse(await fetch('/api/reset', { method: 'POST' }), 'Failed to reset data');
  },

  async sendRequest(requestText: string, selectedTool?: string): Promise<ExecuteRequestResult> {
    return getApiData(await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: requestText, selectedTool })
    }), 'Failed to submit request to agent');
  },

  async verifyDirect(tool: string, output: string, userPrompt?: string): Promise<TrustFlowVerifyResponse> {
    return getApiData(await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, output, userPrompt })
    }), 'TrustFlow direct verification failed');
  }
};
