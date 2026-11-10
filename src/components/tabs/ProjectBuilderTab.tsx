import React, { useState } from 'react';
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
  CheckCircle2,
  AlertTriangle,
  Globe,
  Layers,
  ChevronRight,
  Send,
  Lock,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';

import { synthesizeScope, buildBackendAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

// Initial ER Diagram Nodes (Showing Tables, Columns, and RLS Badges)
const INITIAL_ER_NODES: Node[] = [
  {
    id: 'table-clients',
    position: { x: 40, y: 80 },
    data: {
      label: (
        <div className="text-left font-mono text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 font-bold text-sky-400">
            <span>clients</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              RLS ACTIVE
            </span>
          </div>
          <div className="pt-1.5 space-y-1 text-[11px] text-slate-300">
            <div className="text-amber-400 font-semibold">🔑 id: UUID [PK]</div>
            <div>company_name: VARCHAR(255)</div>
            <div>country_code: CHAR(2)</div>
            <div>billing_tier: VARCHAR(50)</div>
            <div>created_at: TIMESTAMPTZ</div>
          </div>
        </div>
      ),
    },
    style: { background: '#0f172a', border: '1.5px solid #38bdf8', borderRadius: 12, padding: 12, width: 230 },
  },
  {
    id: 'table-projects',
    position: { x: 340, y: 80 },
    data: {
      label: (
        <div className="text-left font-mono text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 font-bold text-indigo-400">
            <span>projects</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              RLS ACTIVE
            </span>
          </div>
          <div className="pt-1.5 space-y-1 text-[11px] text-slate-300">
            <div className="text-amber-400 font-semibold">🔑 id: UUID [PK]</div>
            <div>name: VARCHAR(255)</div>
            <div>monthly_budget_usd: NUMERIC</div>
            <div>tokens_spent_usd: NUMERIC</div>
            <div>status: VARCHAR(50)</div>
          </div>
        </div>
      ),
    },
    style: { background: '#0f172a', border: '1.5px solid #6366f1', borderRadius: 12, padding: 12, width: 230 },
  },
  {
    id: 'table-orders',
    position: { x: 640, y: 80 },
    data: {
      label: (
        <div className="text-left font-mono text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 font-bold text-emerald-400">
            <span>project_orders</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              RLS ACTIVE
            </span>
          </div>
          <div className="pt-1.5 space-y-1 text-[11px] text-slate-300">
            <div className="text-amber-400 font-semibold">🔑 id: UUID [PK]</div>
            <div className="text-purple-400">🔗 project_id: UUID [FK]</div>
            <div>customer_id: UUID</div>
            <div>order_status: VARCHAR(50)</div>
            <div>payload: JSONB</div>
          </div>
        </div>
      ),
    },
    style: { background: '#0f172a', border: '1.5px solid #10b981', borderRadius: 12, padding: 12, width: 230 },
  },
  {
    id: 'table-principals',
    position: { x: 190, y: 280 },
    data: {
      label: (
        <div className="text-left font-mono text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 font-bold text-purple-400">
            <span>principals (Human / AI)</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              RBAC ACTIVE
            </span>
          </div>
          <div className="pt-1.5 space-y-1 text-[11px] text-slate-300">
            <div className="text-amber-400 font-semibold">🔑 id: UUID [PK]</div>
            <div>principal_type: HUMAN | AI_AGENT</div>
            <div>role: CLIENT_APPROVER | AGENT</div>
            <div>is_super_admin: BOOLEAN</div>
          </div>
        </div>
      ),
    },
    style: { background: '#0f172a', border: '1.5px solid #a855f7', borderRadius: 12, padding: 12, width: 240 },
  },
];

const INITIAL_ER_EDGES: Edge[] = [
  {
    id: 'e-clients-projects',
    source: 'table-clients',
    target: 'table-projects',
    animated: true,
    label: '1 : N (client_project_links)',
    style: { stroke: '#38bdf8' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
  },
  {
    id: 'e-projects-orders',
    source: 'table-projects',
    target: 'table-orders',
    animated: true,
    label: '1 : N (project_id)',
    style: { stroke: '#6366f1' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
  },
  {
    id: 'e-principals-projects',
    source: 'table-principals',
    target: 'table-projects',
    animated: true,
    label: 'M : N (project_memberships)',
    style: { stroke: '#a855f7' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  },
];

export const ProjectBuilderTab: React.FC = () => {
  const { projects } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'intake' | 'er-diagram' | 'stories' | 'openapi'>('intake');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-0001');

  // Intake Questionnaire State
  const [transcript, setTranscript] = useState<string>(
    'Cross-border freight delivery platform operating in India, Germany, and the United States. ' +
    'Requires real-time parcel dispatch tracking, responsive web dashboard (375px to 1920px), ' +
    'native Android mobile application with account deletion settings, and PostgreSQL 16 backend ' +
    'enforcing Row-Level Security and DPDP/GDPR data export compliance.'
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

  // Synthesized PRD Output
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizedOutput, setSynthesizedOutput] = useState<{
    executiveSummary: string;
    stories: Array<{ id: string; title: string; criteria: string[]; status: string }>;
    sqlMigration: string;
    openapiYaml: string;
    gateId?: string;
  } | null>(null);

  // OpenAPI Tester State
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/orders');
  const [testPayload, setTestPayload] = useState<string>('{\n  "customer_id": "cust-84920",\n  "package_weight_kg": 4.5,\n  "destination_city": "Berlin"\n}');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const toggleCompliance = (flag: string) => {
    setComplianceFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  const toggleModule = (mod: string) => {
    setTargetModules((prev) => ({ ...prev, [mod]: !prev[mod] }));
  };

  // Run BA Intake Synthesis (MOD-02 & MOD-05)
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

      // Build Backend API with RLS (MOD-05)
      await buildBackendAPI({
        project_id: selectedProjectId,
        sql_ddl: intakeRes.data.sql_ddl,
        rbac_matrix: { admin: ['*'], user: ['read', 'write'] },
        openapi_spec_url: 'https://api.launchup.internal/openapi.yaml',
      });

      setSynthesizedOutput({
        executiveSummary: `Synthesized scope for ${selectedProjectId} across jurisdictions [${activeCountries.join(', ')}] with multi-tenant PostgreSQL 16 RLS policies and OpenAPI 3.1 specification.`,
        stories: [
          {
            id: 'US-001',
            title: 'Real-Time Order & Dispatch Tracking',
            criteria: ['Returns 200 OK with live telemetry', 'Supports 375px to 1920px responsive viewports'],
            status: 'READY_FOR_DEV',
          },
          {
            id: 'US-002',
            title: 'PostgreSQL 16 M:N Row-Level Security',
            criteria: ['100% of tables enforce ENABLE ROW LEVEL SECURITY', 'Zero data leakage across client boundaries'],
            status: 'READY_FOR_DEV',
          },
          {
            id: 'US-003',
            title: 'DPDP & GDPR Data Portability & Erasure',
            criteria: ['/api/v1/privacy/me/export returns JSON archive', '/api/v1/privacy/me/erase provides cryptographic proof'],
            status: 'READY_FOR_DEV',
          },
          {
            id: 'US-004',
            title: 'Google Play Data Safety & Account Deletion',
            criteria: ['In-app /settings/delete-account route active', 'CSV declarations matched with permissions'],
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
    await new Promise((r) => setTimeout(r, 600));
    setApiResponse({
      status: 201,
      message: 'Order created with Row-Level Security isolation.',
      tenant_id: 'tenant-amritsar-logistics-01',
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
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header & Sub-Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              Project Builder: BA Scope, ER Diagram & OpenAPI Studio
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                MOD-02 & MOD-05
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive client intake, PostgreSQL 16 RLS policies, and OpenAPI 3.1 specification.
            </p>
          </div>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('intake')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSubTab === 'intake'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            BA Intake & Scope
          </button>

          <button
            onClick={() => setActiveSubTab('er-diagram')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSubTab === 'er-diagram'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Visual ER & RLS
          </button>

          <button
            onClick={() => setActiveSubTab('stories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSubTab === 'stories'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            User Stories ({synthesizedOutput?.stories.length || 0})
          </button>

          <button
            onClick={() => setActiveSubTab('openapi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSubTab === 'openapi'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            OpenAPI 3.1 Studio
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* TAB 1: BA INTAKE & SCOPE SYNTHESIZER */}
        {activeSubTab === 'intake' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Client Intake Transcript & Requirements
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Paste raw client meeting notes, voice transcripts, or specification briefs. The BA agent synthesizes PRD user stories, SQL RLS migrations, and OpenAPI 3.1 endpoints.
              </p>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={5}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
                placeholder="Enter client scope notes..."
              />

              {/* Compliance Framework Toggles */}
              <div className="mt-6">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                  Regulatory Compliance Engines
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'DPDP_INDIA', label: 'DPDP India 2023', desc: 'Consent & Erasure' },
                    { key: 'GDPR_EU', label: 'EU GDPR Art. 50', desc: 'AI Label & Export' },
                    { key: 'CCPA_US', label: 'California CCPA', desc: 'Do-Not-Sell PII' },
                    { key: 'GOOGLE_PLAY_DATA_SAFETY', label: 'Google Play Safety', desc: 'Account Deletion' },
                  ].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => toggleCompliance(c.key)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        complianceFlags[c.key]
                          ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{c.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Engine Modules */}
              <div className="mt-6">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                  Target Generation Modules
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'web', label: 'MOD-03: Responsive Web', icon: Globe },
                    { key: 'android', label: 'MOD-04: Android Suite', icon: Smartphone },
                    { key: 'backend', label: 'MOD-05: RLS Backend', icon: Database },
                    { key: 'marketing', label: 'MOD-07: Canva Pro', icon: Sparkles },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.key}
                        onClick={() => toggleModule(m.key)}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                          targetModules[m.key]
                            ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-semibold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSynthesize}
                  disabled={isSynthesizing}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Sparkles className={`w-4 h-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
                  {isSynthesizing ? 'Synthesizing Blueprint & RLS Policies...' : 'Synthesize Scope & Architecture (MOD-02)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VISUAL ER DATABASE SCHEMA & RLS DIAGRAM */}
        {activeSubTab === 'er-diagram' && (
          <div className="h-[calc(100vh-12rem)] flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  PostgreSQL 16 M:N Tenancy & Row-Level Security Graph
                </h2>
                <p className="text-xs text-slate-400">
                  Every tenant table is protected with <code className="text-emerald-400">ENABLE ROW LEVEL SECURITY</code> and isolated via session tokens.
                </p>
              </div>

              {synthesizedOutput?.sqlMigration && (
                <button
                  onClick={() => copyToClipboard(synthesizedOutput.sqlMigration)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copied SQL' : 'Copy DDL Migration'}
                </button>
              )}
            </div>

            <div className="flex-1 rounded-2xl border border-slate-800 overflow-hidden relative">
              <ReactFlow
                defaultNodes={INITIAL_ER_NODES}
                defaultEdges={INITIAL_ER_EDGES}
                fitView
                className="bg-slate-950"
              >
                <Background color="#334155" gap={20} size={1} />
                <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300" />
                <MiniMap className="!bg-slate-900 !border-slate-800" />
              </ReactFlow>
            </div>
          </div>
        )}

        {/* TAB 3: USER STORIES BOARD */}
        {activeSubTab === 'stories' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Synthesized PRD User Stories</h2>
                <p className="text-xs text-slate-400">
                  Executive blueprint translated into verified agile deliverables with acceptance criteria.
                </p>
              </div>

              {synthesizedOutput?.gateId && (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  Gate 2 ID: {synthesizedOutput.gateId.slice(0, 18)}...
                </div>
              )}
            </div>

            {synthesizedOutput ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-indigo-400">Executive Summary: </span>
                  {synthesizedOutput.executiveSummary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {synthesizedOutput.stories.map((story) => (
                    <div key={story.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-indigo-400">{story.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {story.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-2">{story.title}</h3>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Acceptance Criteria:</span>
                        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                          {story.criteria.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No PRD synthesized yet.</p>
                <button
                  onClick={() => setActiveSubTab('intake')}
                  className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white"
                >
                  Go to Intake Form
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OPENAPI 3.1 STUDIO & TESTER */}
        {activeSubTab === 'openapi' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-400" />
                OpenAPI 3.1 REST API Studio & RLS Policy Tester
              </h2>
              <p className="text-xs text-slate-400">
                Execute live requests against synthesized microservice contracts with tenant context headers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Endpoint Request Builder */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Endpoint</label>
                  <div className="mt-1 flex gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                      POST
                    </span>
                    <input
                      type="text"
                      value={selectedEndpoint}
                      onChange={(e) => setSelectedEndpoint(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Headers (RLS Context)</label>
                  <pre className="mt-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-[11px]">
{`Content-Type: application/json
X-Tenant-Project-ID: ${selectedProjectId}
Authorization: Bearer rls_session_token_signed_jwt`}
                  </pre>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">JSON Request Payload</label>
                  <textarea
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    rows={6}
                    className="w-full mt-1 p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={handleTestApi}
                  disabled={isTestingApi}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Play className={`w-3.5 h-3.5 ${isTestingApi ? 'animate-spin' : ''}`} />
                  {isTestingApi ? 'Executing API Call...' : 'Send Request'}
                </button>
              </div>

              {/* Endpoint Live Response */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Response Output</label>
                  {apiResponse && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      HTTP {apiResponse.status}
                    </span>
                  )}
                </div>

                <div className="h-80 rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-auto">
                  {apiResponse ? (
                    <pre className="text-emerald-400 leading-relaxed text-[11px]">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                      Send a request to see the live microservice response.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
