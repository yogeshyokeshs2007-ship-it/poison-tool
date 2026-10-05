export type Decision = 'ALLOW' | 'BLOCK';

export interface MetricData {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  toolsUsed: number;
  systemStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  member1Status: 'CONNECTED' | 'DISCONNECTED';
  member2Status: 'CONNECTED' | 'DISCONNECTED';
  avgLatencyMs: number;
}

export interface ToolItem {
  id: string;
  name: string;
  icon: string;
  category: 'general' | 'utility' | 'analysis' | 'developer' | 'data';
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresVerification: boolean;
  usageCount: number;
  isOnline?: boolean;
  onlineEndpoint?: string;
}

export interface HistoryItem {
  id: string;
  time: string;
  request: string;
  tool: string;
  toolIcon?: string;
  decision: Decision;
  reason: string;
  status: 'Completed' | 'Processing' | 'Failed';
  output?: string | null;
  durationMs?: number;
  plannerReasoning?: string;
  timestamp: number;
  isOnlineExecution?: boolean;
  onlineSource?: string;
}

export interface VerificationRecord {
  id: string;
  time: string;
  requestId: string;
  tool: string;
  toolOutput: string;
  decision: Decision;
  reason: string;
  latencyMs: number;
  verifiedBy: string;
  timestamp: number;
}

export interface LogEntry {
  id: string;
  time: string;
  type: 'INFO' | 'WARN' | 'BLOCK' | 'SUCCESS';
  component: 'AGENT' | 'PLANNER' | 'TOOL' | 'TRUSTFLOW' | 'SYSTEM';
  message: string;
  timestamp: number;
}

export interface PipelineStep {
  step: number;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'done' | 'blocked';
  timestamp?: string;
}

export interface TrustFlowVerifyRequest {
  requestId: string;
  tool: string;
  output: string;
  userPrompt?: string;
}

export interface TrustFlowVerifyResponse {
  decision: Decision;
  reason: string;
  confidence: number;
  latencyMs: number;
  verifiedBy: string;
  timestamp: string;
}
