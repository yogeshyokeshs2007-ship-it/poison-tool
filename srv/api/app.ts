import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import { dataStore, type SeedData } from '../db.ts';
import type {
  Decision,
  HistoryItem,
  LogEntry,
  MetricData,
  ToolItem,
  VerificationRecord,
  TrustFlowVerifyResponse
} from '../types';

const app = express();

app.use(express.json());

// In-memory data store for the General Agent & TrustFlow ecosystem
const toolsDirectory: ToolItem[] = [
  { id: 'maps', name: 'Maps', icon: '📍', category: 'general', description: 'Geographic and location query resolution', riskLevel: 'LOW', requiresVerification: true, usageCount: 4 },
  { id: 'directions', name: 'Directions', icon: '➤', category: 'general', description: 'Turn-by-turn routing and transit estimation', riskLevel: 'LOW', requiresVerification: true, usageCount: 2 },
  { id: 'search', name: 'Search', icon: '🔎', category: 'general', description: 'Web search engine and knowledge base query', riskLevel: 'MEDIUM', requiresVerification: true, usageCount: 8 },
  { id: 'calculator', name: 'Calculator', icon: '🧮', category: 'utility', description: 'Mathematical evaluation and statistical calculations', riskLevel: 'LOW', requiresVerification: true, usageCount: 5 },
  { id: 'weather', name: 'Weather', icon: '🌤️', category: 'utility', description: 'Real-time weather reports and forecasts', riskLevel: 'LOW', requiresVerification: true, usageCount: 6 },
  { id: 'calendar', name: 'Calendar', icon: '📅', category: 'utility', description: 'Schedule and agenda manager', riskLevel: 'MEDIUM', requiresVerification: true, usageCount: 3 },
  { id: 'email', name: 'Email', icon: '✉️', category: 'utility', description: 'Draft and send electronic communications', riskLevel: 'HIGH', requiresVerification: true, usageCount: 4 },
  { id: 'notes', name: 'Notes', icon: '📝', category: 'utility', description: 'Scratchpad and notebook indexing', riskLevel: 'LOW', requiresVerification: true, usageCount: 1 },
  { id: 'translation', name: 'Translation', icon: '🌐', category: 'utility', description: 'Multi-lingual natural language translator', riskLevel: 'LOW', requiresVerification: true, usageCount: 3 },
  { id: 'currency', name: 'Currency', icon: '💲', category: 'utility', description: 'Foreign exchange rate converter', riskLevel: 'LOW', requiresVerification: true, usageCount: 2 },
  { id: 'unit-converter', name: 'Unit Converter', icon: '📐', category: 'utility', description: 'Metric, imperial, and engineering unit conversion', riskLevel: 'LOW', requiresVerification: true, usageCount: 1 },
  { id: 'document-analyzer', name: 'Document Analyzer', icon: '📄', category: 'analysis', description: 'Parser for PDF, DOCX and text documents', riskLevel: 'HIGH', requiresVerification: true, usageCount: 7 },
  { id: 'file-analyzer', name: 'File Analyzer', icon: '📁', category: 'analysis', description: 'Inspects binary structures and metadata', riskLevel: 'HIGH', requiresVerification: true, usageCount: 3 },
  { id: 'image-analyzer', name: 'Image Analyzer', icon: '🖼️', category: 'analysis', description: 'Vision model for object and scene analysis', riskLevel: 'MEDIUM', requiresVerification: true, usageCount: 2 },
  { id: 'ocr', name: 'OCR', icon: '⌗', category: 'analysis', description: 'Optical character recognition on images', riskLevel: 'MEDIUM', requiresVerification: true, usageCount: 2 },
  { id: 'audio-transcription', name: 'Audio Transcription', icon: '🎙️', category: 'analysis', description: 'Speech-to-text audio processor', riskLevel: 'MEDIUM', requiresVerification: true, usageCount: 1 },
  { id: 'video-analyzer', name: 'Video Analyzer', icon: '🎬', category: 'analysis', description: 'Frame-by-frame multimodal video parser', riskLevel: 'HIGH', requiresVerification: true, usageCount: 1 },
  { id: 'code-executor', name: 'Code Executor', icon: '</>', category: 'developer', description: 'Sandboxed Python / JS code execution engine', riskLevel: 'HIGH', requiresVerification: true, usageCount: 4 },
  { id: 'database', name: 'Database', icon: '🗄️', category: 'data', description: 'Query relational and document databases', riskLevel: 'HIGH', requiresVerification: true, usageCount: 3 },
  { id: 'api-request', name: 'API Request', icon: '☁️', category: 'developer', description: 'External HTTP REST/GraphQL API caller', riskLevel: 'HIGH', requiresVerification: true, usageCount: 5 },
  { id: 'github', name: 'GitHub', icon: '◉', category: 'developer', description: 'Repository, issue, and commit manager', riskLevel: 'MEDIUM', requiresVerification: true, usageCount: 2 },
  { id: 'cloud-storage', name: 'Cloud Storage', icon: '☁', category: 'data', description: 'S3/GCS bucket file interaction', riskLevel: 'HIGH', requiresVerification: true, usageCount: 1 },
  { id: 'spreadsheet', name: 'Spreadsheet', icon: '▦', category: 'data', description: 'Excel and CSV formula and data evaluator', riskLevel: 'LOW', requiresVerification: true, usageCount: 2 },
  { id: 'reminder', name: 'Reminder', icon: '🔔', category: 'utility', description: 'Scheduled alerts and push notifications', riskLevel: 'LOW', requiresVerification: true, usageCount: 1 },
  { id: 'time', name: 'Time', icon: '◷', category: 'utility', description: 'Timezone and global clock synchronization', riskLevel: 'LOW', requiresVerification: true, usageCount: 2 },
  { id: 'connector', name: 'Connector', icon: '🔗', category: 'general', description: 'Webhook and event pipeline bridge', riskLevel: 'MEDIUM', requiresVerification: true, usageCount: 1 }
];

const historySeed: HistoryItem[] = [
  {
    id: 'req_001',
    time: '10:24:10',
    request: "What's the weather in New York?",
    tool: 'Weather',
    toolIcon: '🌤️',
    decision: 'ALLOW',
    reason: 'Safe content — Public meteorological report',
    status: 'Completed',
    output: 'Current New York weather: 68°F (20°C), Partly Cloudy, Humidity 52%, Wind NW 9 mph. High today 72°F, Low 59°F. No severe weather alerts.',
    durationMs: 420,
    plannerReasoning: 'Selected Weather tool based on meteorological query intent for geographic location "New York".',
    timestamp: Date.now() - 3600000 * 2
  },
  {
    id: 'req_002',
    time: '10:18:32',
    request: 'Calculate 25 × 48',
    tool: 'Calculator',
    toolIcon: '🧮',
    decision: 'ALLOW',
    reason: 'Safe content — Standard arithmetic evaluation',
    status: 'Completed',
    output: 'Calculation result: 25 × 48 = 1,200',
    durationMs: 180,
    plannerReasoning: 'Identified pure mathematical multiplication expression; dispatched to sandboxed Calculator utility.',
    timestamp: Date.now() - 3600000 * 2.5
  },
  {
    id: 'req_003',
    time: '10:15:20',
    request: 'Search for latest AI news',
    tool: 'Search',
    toolIcon: '🔎',
    decision: 'ALLOW',
    reason: 'Safe content — Public news search verified',
    status: 'Completed',
    output: 'Top AI News Headlines:\n1. Open-source multi-agent safety benchmarks demonstrate 40% reduction in unauthorized tool executions.\n2. New inference efficiency optimizations reduce token latency by 2.4x across serverless clusters.\n3. Industry consortium publishes updated agentic tool verification protocols.',
    durationMs: 650,
    plannerReasoning: 'Information retrieval requested. Planner dispatched web search query for "latest AI news 2026".',
    timestamp: Date.now() - 3600000 * 3
  },
  {
    id: 'req_004',
    time: '10:10:05',
    request: 'Analyze this document (confidential internal credentials)',
    tool: 'Document Analyzer',
    toolIcon: '📄',
    decision: 'BLOCK',
    reason: 'Potential sensitive data — Detected internal credentials / secret patterns in output payload',
    status: 'Completed',
    output: null, // Strictly nullified per TrustFlow security contract
    durationMs: 890,
    plannerReasoning: 'Document parsing requested. Tool returned raw text containing API key tokens and internal database passwords.',
    timestamp: Date.now() - 3600000 * 3.5
  },
  {
    id: 'req_005',
    time: '10:05:12',
    request: 'Send an email to team about sprint planning tomorrow at 10 AM',
    tool: 'Email',
    toolIcon: '✉️',
    decision: 'ALLOW',
    reason: 'Safe content — Standard business scheduling communication',
    status: 'Completed',
    output: 'Email draft generated:\nTo: engineering-team@company.internal\nSubject: Sprint Planning — Tomorrow at 10:00 AM\nBody: Hi team, a quick reminder that sprint planning will take place tomorrow at 10:00 AM in Conference Room B and via video link. Please ensure your backlog cards are groomed.',
    durationMs: 510,
    plannerReasoning: 'Email composer selected. Prepared draft template for team meeting confirmation without sensitive attachments.',
    timestamp: Date.now() - 3600000 * 4
  }
];

const verificationSeed: VerificationRecord[] = [
  {
    id: 'ver_001',
    time: '10:24:14',
    requestId: 'req_001',
    tool: 'Weather',
    toolOutput: 'Weather data for New York: 68°F Partly Cloudy',
    decision: 'ALLOW',
    reason: 'Safe content — Public meteorological report',
    latencyMs: 142,
    verifiedBy: 'TrustFlow v2.4 (Laptop 2 / Member 2)',
    timestamp: Date.now() - 3600000 * 2
  },
  {
    id: 'ver_002',
    time: '10:18:34',
    requestId: 'req_002',
    tool: 'Calculator',
    toolOutput: 'Calculation result: 25 * 48 = 1200',
    decision: 'ALLOW',
    reason: 'Safe content — Standard arithmetic evaluation',
    latencyMs: 98,
    verifiedBy: 'TrustFlow v2.4 (Laptop 2 / Member 2)',
    timestamp: Date.now() - 3600000 * 2.5
  },
  {
    id: 'ver_003',
    time: '10:15:22',
    requestId: 'req_003',
    tool: 'Search',
    toolOutput: 'Search results summary for AI industry news',
    decision: 'ALLOW',
    reason: 'Safe content — Public news search verified',
    latencyMs: 185,
    verifiedBy: 'TrustFlow v2.4 (Laptop 2 / Member 2)',
    timestamp: Date.now() - 3600000 * 3
  },
  {
    id: 'ver_004',
    time: '10:10:07',
    requestId: 'req_004',
    tool: 'Document Analyzer',
    toolOutput: 'Document content analysis [REDACTED BY TRUSTFLOW]',
    decision: 'BLOCK',
    reason: 'Potential sensitive data — Detected internal credentials / secret patterns in output payload',
    latencyMs: 230,
    verifiedBy: 'TrustFlow v2.4 (Laptop 2 / Member 2)',
    timestamp: Date.now() - 3600000 * 3.5
  },
  {
    id: 'ver_005',
    time: '10:05:15',
    requestId: 'req_005',
    tool: 'Email',
    toolOutput: 'Email draft for team sprint planning',
    decision: 'ALLOW',
    reason: 'Safe content — Standard business scheduling communication',
    latencyMs: 160,
    verifiedBy: 'TrustFlow v2.4 (Laptop 2 / Member 2)',
    timestamp: Date.now() - 3600000 * 4
  }
];

const logSeed: LogEntry[] = [
  {
    id: 'log_01',
    time: '10:24:10',
    type: 'INFO',
    component: 'AGENT',
    message: 'User request received: "What\'s the weather in New York?"',
    timestamp: Date.now() - 3600000 * 2
  },
  {
    id: 'log_02',
    time: '10:24:11',
    type: 'INFO',
    component: 'PLANNER',
    message: 'Planner selected tool: weather based on location query',
    timestamp: Date.now() - 3600000 * 2 + 1000
  },
  {
    id: 'log_03',
    time: '10:24:13',
    type: 'INFO',
    component: 'TOOL',
    message: 'Weather tool executed successfully; raw response 184 bytes captured',
    timestamp: Date.now() - 3600000 * 2 + 3000
  },
  {
    id: 'log_04',
    time: '10:24:14',
    type: 'INFO',
    component: 'TRUSTFLOW',
    message: 'POST http://laptop2.local:8000/verify dispatched payload req_001',
    timestamp: Date.now() - 3600000 * 2 + 4000
  },
  {
    id: 'log_05',
    time: '10:24:14',
    type: 'SUCCESS',
    component: 'TRUSTFLOW',
    message: 'TrustFlow decision: ALLOW (Reason: Safe content, Latency: 142ms)',
    timestamp: Date.now() - 3600000 * 2 + 4200
  },
  {
    id: 'log_06',
    time: '10:24:14',
    type: 'INFO',
    component: 'AGENT',
    message: 'Safe output delivered to client interface',
    timestamp: Date.now() - 3600000 * 2 + 4300
  }
];

const seedData: SeedData = {
  history: historySeed,
  verifications: verificationSeed,
  logs: logSeed
};

app.use('/api', (req: Request, _res: Response, next) => {
  if (req.path === '/health' || req.path === '/tools' || req.path === '/verify') {
    next();
    return;
  }
  dataStore.initialize(seedData).then(() => next()).catch(next);
});

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: (error?: unknown) => void) => {
    handler(req, res).catch(next);
  };
}

// Helper: Format current HH:mm:ss
function formatTime(): string {
  const d = new Date();
  return d.toTimeString().split(' ')[0];
}

// TrustFlow inspection function (Simulates / replicates Member 2 verification service)
function verifyWithTrustFlow(tool: string, rawOutput: string, userPrompt: string): TrustFlowVerifyResponse {
  const startTime = Date.now();
  const textToCheck = `${userPrompt} ${rawOutput}`.toLowerCase();

  const sensitiveKeywords = [
    'password',
    'passwd',
    'secret',
    'private key',
    'api_key',
    'bearer token',
    'credentials',
    'confidential',
    'internal only',
    'ssn',
    'credit card',
    'drop table',
    '/etc/shadow',
    'aws_secret_access_key'
  ];

  let isBlocked = false;
  let blockReason = 'Safe content';

  for (const keyword of sensitiveKeywords) {
    if (textToCheck.includes(keyword)) {
      isBlocked = true;
      blockReason = `Security Policy Violation: Detected sensitive pattern matching "${keyword}"`;
      break;
    }
  }

  // Also check if tool is code-executor with system compromise attempts
  if (tool.toLowerCase().includes('code') && (textToCheck.includes('os.system') || textToCheck.includes('child_process') || textToCheck.includes('rm -rf'))) {
    isBlocked = true;
    blockReason = 'Policy Violation: Restricted system call detected in execution script';
  }

  const decision: Decision = isBlocked ? 'BLOCK' : 'ALLOW';
  const latency = Math.floor(Math.random() * 80) + 110;

  return {
    decision,
    reason: isBlocked ? blockReason : 'Safe content — Verified by TrustFlow remote policy engine',
    confidence: isBlocked ? 0.99 : 0.97,
    latencyMs: latency,
    verifiedBy: 'TrustFlow v2.4 (Member 2 / Remote Laptop)',
    timestamp: formatTime()
  };
}

// Generator for tool execution simulation
function simulateToolExecution(toolName: string, query: string): { output: string; icon: string } {
  const lower = query.toLowerCase();
  const toolEntry = toolsDirectory.find(t => t.name.toLowerCase() === toolName.toLowerCase()) || toolsDirectory[0];

  if (toolName.toLowerCase().includes('weather') || lower.includes('weather')) {
    return {
      output: `Current Weather in ${query.replace(/.*weather in\s*/i, '') || 'Target Location'}: 71°F, Sunny, Humidity 45%, Wind 8mph SW. Air Quality: Good (Index 32).`,
      icon: '🌤️'
    };
  }

  if (toolName.toLowerCase().includes('calculator') || lower.includes('calculate') || lower.includes('math')) {
    return {
      output: `Evaluated arithmetic result: Expression computed with precision 6 decimal points: Result = 1,200.00`,
      icon: '🧮'
    };
  }

  if (toolName.toLowerCase().includes('map') || lower.includes('direction') || lower.includes('route')) {
    return {
      output: `GeoRoute: 4.8 miles via Central Ave. Estimated arrival in 14 mins. Traffic: Light. 2 turns remaining.`,
      icon: '📍'
    };
  }

  if (toolName.toLowerCase().includes('search') || lower.includes('find') || lower.includes('search')) {
    return {
      output: `Top 3 Verified Search Results for "${query}":\n1. Overview & Comprehensive Guide (2026 Reference)\n2. Official Documentation and Technical Specifications\n3. Community Forum Discussion and Verified Best Practices`,
      icon: '🔎'
    };
  }

  if (toolName.toLowerCase().includes('email') || lower.includes('mail')) {
    return {
      output: `Draft Created Successfully:\nTo: specified-recipients\nSubject: Follow-up on ${query.slice(0, 30)}...\nStatus: Queued in Outbox pending verification approval.`,
      icon: '✉️'
    };
  }

  if (toolName.toLowerCase().includes('document') || lower.includes('doc') || lower.includes('file')) {
    if (lower.includes('secret') || lower.includes('password') || lower.includes('confidential')) {
      return {
        output: `Extracted Document Strings: [CONFIG_START]\nDB_HOST=internal-prod.cluster\nDB_PASS=Sup3rS3cretP@ss!\nAPI_KEY=sk_live_9482710492810\n[CONFIG_END]`,
        icon: '📄'
      };
    }
    return {
      output: `Document Summary: 4 pages analyzed. Total words: 1,420. Main topics: Project Architecture, Agent Tool Protocols, Verification Benchmarks.`,
      icon: '📄'
    };
  }

  return {
    output: `Tool "${toolEntry.name}" processed input successfully. Output generated 240 bytes with code 200 OK.`,
    icon: toolEntry.icon
  };
}

// ----------------- API ENDPOINTS -----------------

app.get('/api/metrics', asyncRoute(async (_req, res) => {
  const history = await dataStore.getAll<HistoryItem>('history');
  const metrics: MetricData = {
    totalRequests: history.length + 19,
    allowedRequests: history.filter((item) => item.decision === 'ALLOW').length + 14,
    blockedRequests: history.filter((item) => item.decision === 'BLOCK').length + 5,
    toolsUsed: 12,
    systemStatus: 'ONLINE',
    member1Status: 'CONNECTED',
    member2Status: 'CONNECTED',
    avgLatencyMs: 148,
    databaseStatus: dataStore.mode === 'postgres' ? 'CONNECTED' : 'MEMORY'
  };
  res.json({ success: true, data: metrics });
}));

app.get('/api/tools', (req: Request, res: Response) => {
  const category = typeof req.query.category === 'string' ? req.query.category : '';
  const tools = category && category !== 'all'
    ? toolsDirectory.filter((tool) => tool.category === category)
    : toolsDirectory;
  res.json({ success: true, count: tools.length, data: tools });
});

app.get('/api/history', asyncRoute(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.toLowerCase() : '';
  const filter = typeof req.query.filter === 'string' ? req.query.filter.toUpperCase() : 'ALL';
  const tool = typeof req.query.tool === 'string' ? req.query.tool.toLowerCase() : '';
  let results = await dataStore.getAll<HistoryItem>('history');

  if (search) {
    results = results.filter((item) =>
      item.request.toLowerCase().includes(search) ||
      item.tool.toLowerCase().includes(search) ||
      item.id.toLowerCase().includes(search) ||
      item.reason.toLowerCase().includes(search)
    );
  }
  if (filter === 'ALLOW' || filter === 'BLOCK') {
    results = results.filter((item) => item.decision === filter);
  }
  if (tool && tool !== 'all') {
    results = results.filter((item) => item.tool.toLowerCase() === tool);
  }
  res.json({ success: true, count: results.length, data: results });
}));

app.get('/api/history/:id', asyncRoute(async (req, res) => {
  const item = await dataStore.getById<HistoryItem>('history', req.params.id);
  if (!item) {
    res.status(404).json({ success: false, error: 'Request record not found' });
    return;
  }
  const sanitized = { ...item, output: item.decision === 'BLOCK' ? null : item.output };
  const verifications = await dataStore.getAll<VerificationRecord>('verifications');
  const relatedVerification = verifications.find((record) => record.requestId === item.id);
  res.json({
    success: true,
    data: { ...sanitized, verification: relatedVerification || null }
  });
}));

app.get('/api/verifications', asyncRoute(async (_req, res) => {
  const records = await dataStore.getAll<VerificationRecord>('verifications');
  res.json({ success: true, count: records.length, data: records });
}));

app.get('/api/logs', asyncRoute(async (req, res) => {
  const level = typeof req.query.level === 'string' ? req.query.level.toUpperCase() : 'ALL';
  let logs = await dataStore.getAll<LogEntry>('logs');
  if (level !== 'ALL') logs = logs.filter((log) => log.type === level);
  res.json({ success: true, count: logs.length, data: logs });
}));

app.post('/api/logs/clear', asyncRoute(async (_req, res) => {
  await dataStore.clear('logs');
  res.json({ success: true, message: 'Logs cleared successfully' });
}));

app.post('/api/verify', (req: Request, res: Response) => {
  const { tool, output, userPrompt } = req.body;
  if (!tool) {
    res.status(400).json({ success: false, error: 'Missing required field: tool' });
    return;
  }
  const result = verifyWithTrustFlow(tool, output || '', userPrompt || '');
  res.json({ success: true, data: result });
});

app.post('/api/requests', asyncRoute(async (req, res) => {
  const { request, selectedTool } = req.body;
  if (!request || typeof request !== 'string' || !request.trim()) {
    res.status(400).json({ success: false, error: 'Request prompt is required' });
    return;
  }

  const userQuery = request.trim();
  const requestId = 'req_' + randomUUID();
  const now = formatTime();
  const startTs = Date.now();
  let chosenToolName = selectedTool;
  if (!chosenToolName) {
    const query = userQuery.toLowerCase();
    if (query.includes('weather')) chosenToolName = 'Weather';
    else if (query.includes('calc') || query.includes('math') || query.includes('+') || query.includes('*')) chosenToolName = 'Calculator';
    else if (query.includes('map') || query.includes('route') || query.includes('directions')) chosenToolName = 'Maps';
    else if (query.includes('mail') || query.includes('email')) chosenToolName = 'Email';
    else if (query.includes('doc') || query.includes('analyze') || query.includes('file') || query.includes('password') || query.includes('secret')) chosenToolName = 'Document Analyzer';
    else chosenToolName = 'Search';
  }

  const toolResult = simulateToolExecution(chosenToolName, userQuery);
  const verification = verifyWithTrustFlow(chosenToolName, toolResult.output, userQuery);
  const durationMs = Date.now() - startTs + verification.latencyMs;
  const logTime = Date.now();
  const requestLogs: LogEntry[] = [
    {
      id: 'log_' + randomUUID(), time: now, type: 'INFO', component: 'AGENT',
      message: 'User request received [' + requestId + ']: "' + userQuery + '"', timestamp: logTime
    },
    {
      id: 'log_' + randomUUID(), time: now, type: 'INFO', component: 'PLANNER',
      message: 'Planner selected tool: "' + chosenToolName + '" for intent resolution', timestamp: logTime + 1
    },
    {
      id: 'log_' + randomUUID(), time: now, type: 'INFO', component: 'TOOL',
      message: 'Tool "' + chosenToolName + '" executed; generated untrusted output buffer', timestamp: logTime + 2
    },
    {
      id: 'log_' + randomUUID(), time: now,
      type: verification.decision === 'ALLOW' ? 'SUCCESS' : 'BLOCK', component: 'TRUSTFLOW',
      message: 'TrustFlow /verify decision: ' + verification.decision + ' (Reason: ' + verification.reason + ')', timestamp: logTime + 3
    },
    {
      id: 'log_' + randomUUID(), time: now,
      type: verification.decision === 'BLOCK' ? 'BLOCK' : 'INFO', component: 'AGENT',
      message: verification.decision === 'BLOCK'
        ? 'SECURITY ENFORCED: Output for [' + requestId + '] blocked and strictly withheld from user'
        : 'Verified output for [' + requestId + '] delivered to user',
      timestamp: logTime + 4
    }
  ];
  const verRecord: VerificationRecord = {
    id: 'ver_' + randomUUID(),
    time: now,
    requestId,
    tool: chosenToolName,
    toolOutput: verification.decision === 'ALLOW' ? toolResult.output.slice(0, 60) + '...' : '[REDACTED BY TRUSTFLOW]',
    decision: verification.decision,
    reason: verification.reason,
    latencyMs: verification.latencyMs,
    verifiedBy: verification.verifiedBy,
    timestamp: logTime
  };
  const historyItem: HistoryItem = {
    id: requestId,
    time: now,
    request: userQuery,
    tool: chosenToolName,
    toolIcon: toolResult.icon,
    decision: verification.decision,
    reason: verification.reason,
    status: 'Completed',
    output: verification.decision === 'ALLOW' ? toolResult.output : null,
    durationMs,
    plannerReasoning: 'Planner matched query to ' + chosenToolName + '. Tool output passed to TrustFlow remote verifier.',
    timestamp: logTime
  };

  await dataStore.insertMany([
    { kind: 'history', record: historyItem },
    { kind: 'verifications', record: verRecord },
    ...requestLogs.map((record) => ({ kind: 'logs' as const, record }))
  ]);
  res.json({
    success: true,
    data: {
      record: historyItem,
      verification,
      steps: [
        { step: 1, name: 'Received', status: 'done', info: now + ' - Request captured' },
        { step: 2, name: 'Planning', status: 'done', info: now + ' - Planner assigned ' + chosenToolName },
        { step: 3, name: 'Tool Execution', status: 'done', info: now + ' - Raw output collected' },
        { step: 4, name: 'Verification', status: 'done', info: now + ' - TrustFlow /verify evaluated' },
        { step: 5, name: 'Decision', status: 'done', info: now + ' - Verdict: ' + verification.decision },
        { step: 6, name: 'Complete', status: 'done', info: now + ' - ' + (verification.decision === 'ALLOW' ? 'Output delivered' : 'Output shielded') }
      ]
    }
  });
}));

app.post('/api/reset', asyncRoute(async (_req, res) => {
  await dataStore.reset(seedData);
  res.json({ success: true, message: 'Data reset successfully' });
}));

app.get('/api/health', asyncRoute(async (_req, res) => {
  if (dataStore.mode === 'not-configured') {
    res.status(503).json({ status: 'DEGRADED', database: 'NOT_CONFIGURED' });
    return;
  }
  await dataStore.initialize(seedData);
  await dataStore.checkConnection();
  res.json({
    status: 'OK',
    database: dataStore.mode === 'postgres' ? 'CONNECTED' : 'MEMORY',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
}));

app.use((error: unknown, _req: Request, res: Response, _next: (error?: unknown) => void) => {
  const message = error instanceof Error ? error.message : 'Unknown backend error';
  const errorCode =
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : undefined;
  console.error('[API] Request failed:', message);
  const missingDatabase = message.includes('DATABASE_URL is required');
  const invalidDatabaseCredentials =
    errorCode === '28P01' || /password authentication failed/i.test(message);
  res.status(missingDatabase || invalidDatabaseCredentials ? 503 : 500).json({
    success: false,
    error: missingDatabase
      ? message
      : invalidDatabaseCredentials
        ? 'PostgreSQL rejected the DATABASE_URL credentials. Check the Supabase database password and pooler username in Vercel, then redeploy.'
        : 'The backend could not complete the request.'
  });
});


export default app;
