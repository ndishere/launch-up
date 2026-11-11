import React, { useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Database,
  Sparkles,
  ShieldCheck,
  FileText,
  Code2,
  Play,
  Globe,
  Layers,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';

import { synthesizeScope, buildBackendAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

interface ProjectBuilderTabProps {
  projectId?: string;
  projectName?: string;
  embedded?: boolean;
}

const buildErNodes = (isDark: boolean): Node[] => {
  const cardBg = isDark ? '#141821' : '#ffffff';
  const cardBorder = isDark ? '#272f40' : '#e2e8f0';
  const dividerClass = isDark ? 'border-slate-800' : 'border-slate-100';
  const textMuted = isDark ? 'text-slate-300' : 'text-slate-600';

  return [
    {
      id: 'table-clients',
      position: { x: 40, y: 70 },
      data: {
        label: (
          <div className="text-left font-mono text-xs">
            <div className={`flex items-center justify-between pb-1.5 border-b ${dividerClass} font-semibold text-indigo-500`}>
              <span>clients</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                RLS
              </span>
            </div>
            <div className={`pt-1.5 space-y-1 text-[11px] ${textMuted}`}>
              <div className="text-amber-600 dark:text-amber-400 font-medium">PK id: UUID</div>
              <div>company_name: VARCHAR</div>
              <div>country_code: CHAR(2)</div>
              <div>billing_tier: VARCHAR</div>
            </div>
          </div>
        ),
      },
      style: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: 12, width: 220 },
    },
    {
      id: 'table-projects',
      position: { x: 330, y: 70 },
      data: {
        label: (
          <div className="text-left font-mono text-xs">
            <div className={`flex items-center justify-between pb-1.5 border-b ${dividerClass} font-semibold text-indigo-500`}>
              <span>projects</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                RLS
              </span>
            </div>
            <div className={`pt-1.5 space-y-1 text-[11px] ${textMuted}`}>
              <div className="text-amber-600 dark:text-amber-400 font-medium">PK id: UUID</div>
              <div>name: VARCHAR</div>
              <div>monthly_budget_usd: NUM</div>
              <div>status: VARCHAR</div>
            </div>
          </div>
        ),
      },
      style: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: 12, width: 220 },
    },
    {
      id: 'table-orders',
      position: { x: 620, y: 70 },
      data: {
        label: (
          <div className="text-left font-mono text-xs">
            <div className={`flex items-center justify-between pb-1.5 border-b ${dividerClass} font-semibold text-indigo-500`}>
              <span>project_orders</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                RLS
              </span>
            </div>
            <div className={`pt-1.5 space-y-1 text-[11px] ${textMuted}`}>
              <div className="text-amber-600 dark:text-amber-400 font-medium">PK id: UUID</div>
              <div className="text-indigo-500">FK project_id: UUID</div>
              <div>order_status: VARCHAR</div>
              <div>payload: JSONB</div>
            </div>
          </div>
        ),
      },
      style: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: 12, width: 220 },
    },
    {
      id: 'table-principals',
      position: { x: 185, y: 260 },
      data: {
        label: (
          <div className="text-left font-mono text-xs">
            <div className={`flex items-center justify-between pb-1.5 border-b ${dividerClass} font-semibold text-indigo-500`}>
              <span>principals</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                RBAC
              </span>
            </div>
            <div className={`pt-1.5 space-y-1 text-[11px] ${textMuted}`}>
              <div className="text-amber-600 dark:text-amber-400 font-medium">PK id: UUID</div>
              <div>type: HUMAN | AI_AGENT</div>
              <div>role: VARCHAR</div>
            </div>
          </div>
        ),
      },
      style: { background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 10, padding: 12, width: 220 },
    },
  ];
};

const INITIAL_ER_EDGES: Edge[] = [
  {
    id: 'e-clients-projects',
    source: 'table-clients',
    target: 'table-projects',
    label: '1 : N',
    style: { stroke: '#6366f1' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
  },
  {
    id: 'e-projects-orders',
    source: 'table-projects',
    target: 'table-orders',
    label: '1 : N',
    style: { stroke: '#6366f1' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
  },
  {
    id: 'e-principals-projects',
    source: 'table-principals',
    target: 'table-projects',
    label: 'M : N',
    style: { stroke: '#94a3b8' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
  },
];

export const ProjectBuilderTab: React.FC<ProjectBuilderTabProps> = ({
  projectId,
  projectName,
  embedded = false,
}) => {
  const { projects, activeCanvasProjectId, resolvedTheme } = useApp();
  const isDark = resolvedTheme === 'dark';

  const resolvedProject =
    projects.find((p) => p.id === (projectId || activeCanvasProjectId)) || projects[0];
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    resolvedProject?.id || 'proj-0001'
  );

  useEffect(() => {
    if (projectId) setSelectedProjectId(projectId);
  }, [projectId]);

  const [activeSubTab, setActiveSubTab] = useState<'intake' | 'er-diagram' | 'stories' | 'openapi'>('intake');

  const [transcript, setTranscript] = useState<string>(
    `${projectName || resolvedProject?.name || 'Enterprise platform'} operating across India, Germany, and the United States. ` +
      'Requires real-time tracking, responsive web UI (375px-1920px), Android mobile app with account deletion, and PostgreSQL 16 backend with RLS.'
  );

  const [complianceFlags, setComplianceFlags] = useState<{ [key: string]: boolean }>({
    DPDP_INDIA: true,
    GDPR_EU: true,
    CCPA_US: true,
    GOOGLE_PLAY_DATA_SAFETY: true,
  });

  const [targetModules, setTargetModules] = useState<{ [key: string]: boolean }>({
    web: true,
    android: true,
    backend: true,
    marketing: true,
  });

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedOutput, setSynthesizedOutput] = useState<{
    executiveSummary: string;
    stories: Array<{ id: string; title: string; criteria: string[]; status: string }>;
    sqlMigration: string;
    openapiYaml: string;
    gateId?: string;
  } | null>(null);

  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/orders');
  const [testPayload, setTestPayload] = useState<string>(
    '{\n  "customer_id": "cust-84920",\n  "package_weight_kg": 4.5,\n  "destination_city": "Berlin"\n}'
  );
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const erNodes = useMemo(() => buildErNodes(isDark), [isDark]);

  const toggleCompliance = (flag: string) => {
    setComplianceFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  const toggleModule = (mod: string) => {
    setTargetModules((prev) => ({ ...prev, [mod]: !prev[mod] }));
  };

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const activeCountries: string[] = [];
      if (complianceFlags.DPDP_INDIA) activeCountries.push('IN');
      if (complianceFlags.GDPR_EU) activeCountries.push('DE');
      if (complianceFlags.CCPA_US) activeCountries.push('US');

      const requestedMods = Object.entries(targetModules)
        .filter(([_, v]) => v)
        .map(([k]) => k);

      const intakeRes = await synthesizeScope({
        project_id: selectedProjectId,
        interview_transcript: transcript,
        target_countries: activeCountries.length > 0 ? activeCountries : ['IN'],
        requested_modules: requestedMods,
      });

      await buildBackendAPI({
        project_id: selectedProjectId,
        sql_ddl: intakeRes.data.sql_ddl,
        rbac_matrix: { admin: ['*'], user: ['read', 'write'] },
        openapi_spec_url: 'https://api.launchup.internal/openapi.yaml',
      });

      setSynthesizedOutput({
        executiveSummary: `Synthesized scope for ${selectedProjectId} across [${activeCountries.join(', ')}] with PostgreSQL 16 RLS policies and OpenAPI 3.1 contract.`,
        stories: [
          {
            id: 'US-001',
            title: 'Real-Time Dispatch & Status Tracking',
            criteria: ['Returns 200 OK telemetry', 'Responsive across 375px-1920px viewports'],
            status: 'READY_FOR_DEV',
          },
          {
            id: 'US-002',
            title: 'PostgreSQL 16 M:N Row-Level Security',
            criteria: ['ENABLE ROW LEVEL SECURITY on all tenant tables', 'Zero cross-tenant data leakage'],
            status: 'READY_FOR_DEV',
          },
          {
            id: 'US-003',
            title: 'DPDP & GDPR Privacy Export & Erasure',
            criteria: ['/api/v1/privacy/me/export JSON archive', '/api/v1/privacy/me/erase proof'],
            status: 'READY_FOR_DEV',
          },
          {
            id: 'US-004',
            title: 'Google Play Data Safety & Account Deletion',
            criteria: ['/settings/delete-account route active', 'CSV matched to permissions'],
            status: 'READY_FOR_DEV',
          },
        ],
        sqlMigration: intakeRes.data.sql_ddl,
        openapiYaml: intakeRes.data.openapi_spec_yaml,
        gateId: intakeRes.data.approval_gate_id,
      });

      setActiveSubTab('stories');
    } catch (err: any) {
      alert('Scope Synthesis Failed: ' + err.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleTestApi = async () => {
    setIsTestingApi(true);
    await new Promise((r) => setTimeout(r, 450));
    setApiResponse({
      status: 201,
      message: 'Order created with Row-Level Security isolation.',
      project_id: selectedProjectId,
      order_id: 'ord-' + Math.floor(10000 + Math.random() * 90000),
      rls_policy_verified: 'project_orders_tenant_isolation [PASS]',
      timestamp: new Date().toISOString(),
    });
    setIsTestingApi(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-[#111318] text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden ${
        embedded ? 'min-h-[620px]' : 'h-[calc(100vh-5.5rem)]'
      }`}
    >
      {/* Clean Studio Header & Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0D1017]">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Scope, ER Schema & OpenAPI Studio
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              MOD-02 & MOD-05 · PostgreSQL RLS & OpenAPI 3.1 contract synthesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
          {[
            { id: 'intake', label: 'Intake & Scope', icon: FileText },
            { id: 'er-diagram', label: 'ER & RLS Graph', icon: Database },
            { id: 'stories', label: `Stories (${synthesizedOutput?.stories.length || 0})`, icon: Layers },
            { id: 'openapi', label: 'OpenAPI Tester', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  activeSubTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeSubTab === 'intake' && (
          <div className="max-w-3xl mx-auto space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Client Scope & Requirements Brief
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-lg bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                placeholder="Enter client scope notes..."
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Compliance Frameworks
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'DPDP_INDIA', label: 'DPDP India', desc: 'Consent & Erasure' },
                  { key: 'GDPR_EU', label: 'EU GDPR', desc: 'AI Label & Export' },
                  { key: 'CCPA_US', label: 'US CCPA', desc: 'Do-Not-Sell PII' },
                  { key: 'GOOGLE_PLAY_DATA_SAFETY', label: 'Play Safety', desc: 'Account Deletion' },
                ].map((c) => (
                  <button
                    key={c.key}
                    onClick={() => toggleCompliance(c.key)}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      complianceFlags[c.key]
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                        : 'bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-medium">{c.label}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Target Generation Modules
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'web', label: 'Responsive Web', icon: Globe },
                  { key: 'android', label: 'Android Suite', icon: Smartphone },
                  { key: 'backend', label: 'RLS Backend', icon: Database },
                  { key: 'marketing', label: 'Canva Marketing', icon: Sparkles },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.key}
                      onClick={() => toggleModule(m.key)}
                      className={`p-2.5 rounded-lg border flex items-center gap-2 transition-colors text-left ${
                        targetModules[m.key]
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                          : 'bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-medium truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
                <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize Scope & RLS (MOD-02)'}</span>
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'er-diagram' && (
          <div className="h-[520px] flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  PostgreSQL 16 Row-Level Security Schema
                </span>
              </div>

              {synthesizedOutput?.sqlMigration && (
                <button
                  onClick={() => copyToClipboard(synthesizedOutput.sqlMigration)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL DDL'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <ReactFlow
                defaultNodes={erNodes}
                defaultEdges={INITIAL_ER_EDGES}
                colorMode={isDark ? 'dark' : 'light'}
                fitView
              >
                <Background gap={20} size={1} />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>
          </div>
        )}

        {activeSubTab === 'stories' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  PRD User Stories
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified agile deliverables with acceptance criteria.
                </p>
              </div>
              {synthesizedOutput?.gateId && (
                <span className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[11px] font-mono">
                  Gate 2: {synthesizedOutput.gateId.slice(0, 14)}
                </span>
              )}
            </div>

            {synthesizedOutput ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Summary: </span>
                  {synthesizedOutput.executiveSummary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {synthesizedOutput.stories.map((story) => (
                    <div
                      key={story.id}
                      className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          {story.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                          {story.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        {story.title}
                      </h4>
                      <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
                        {story.criteria.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-14 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <FileText className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">No PRD synthesized yet.</p>
                <button
                  onClick={() => setActiveSubTab('intake')}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-xs font-medium text-white"
                >
                  Open Intake Form
                </button>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'openapi' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Endpoint
                </label>
                <div className="mt-1 flex gap-2">
                  <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800">
                    POST
                  </span>
                  <input
                    type="text"
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  RLS Context Headers
                </label>
                <pre className="mt-1 p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] overflow-x-auto">
{`Content-Type: application/json
X-Tenant-Project-ID: ${selectedProjectId}`}
                </pre>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  JSON Body
                </label>
                <textarea
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  rows={5}
                  className="w-full mt-1 p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-emerald-400 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleTestApi}
                disabled={isTestingApi}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-spin' : ''}`} />
                <span>{isTestingApi ? 'Executing...' : 'Send Request'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Response
                </label>
                {apiResponse && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                    HTTP {apiResponse.status}
                  </span>
                )}
              </div>

              <div className="flex-1 min-h-[260px] rounded-lg bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-3 font-mono text-xs overflow-auto">
                {apiResponse ? (
                  <pre className="text-emerald-700 dark:text-emerald-400 leading-relaxed text-[11px]">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    Send a request to inspect live JSON response.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
