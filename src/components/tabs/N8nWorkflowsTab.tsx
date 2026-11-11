import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Play,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Layers,
  Terminal,
  X,
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import {
  discoverLead,
  synthesizeScope,
  buildLandingWeb,
  buildMobileApp,
  buildBackendAPI,
  verifyQA,
  sendWhatsAppMessage,
  healIncident,
  decideGate,
} from '../../services/api';
import { SummaryMetricGrid, SummaryMetricCard } from '../common/SummaryMetricCard';

interface WorkflowNodeData {
  label: string;
  serviceId: string;
  action: string;
  description: string;
  params: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  executionResult?: any;
}

interface N8nWorkflowsTabProps {
  projectId?: string;
  projectName?: string;
  embedded?: boolean;
}

const makeNodeStyle = (isDark: boolean, accentHex: string, width = 220) => ({
  background: isDark ? '#141821' : '#ffffff',
  color: isDark ? '#f1f5f9' : '#0f172a',
  border: `1px solid ${accentHex}`,
  borderRadius: 10,
  padding: 10,
  width,
  fontSize: 12,
});

const getTemplates = (isDark: boolean): Record<
  string,
  { name: string; description: string; nodes: Node[]; edges: Edge[] }
> => ({
  template_lead_pitch: {
    name: 'Lead Pitch (MOD-01 -> Gate 1)',
    description: 'Scrapes digital gaps, autofills Canva proposal, halts for signoff.',
    nodes: [
      {
        id: 'node-1',
        position: { x: 40, y: 120 },
        data: {
          label: 'Web Audit Trigger',
          serviceId: 'WEBHOOK',
          action: 'Audit Prospect URL',
          description: 'Detects viewport overflow & Lighthouse < 50',
          params: { url: 'https://punjabfreight.example.com', target_niche: 'Logistics' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, isDark ? '#334155' : '#cbd5e1'),
      },
      {
        id: 'node-2',
        position: { x: 320, y: 120 },
        data: {
          label: 'Lead Pitch (MOD-01)',
          serviceId: 'MOD-01',
          action: 'POST /api/v1/leads/discover',
          description: 'Generates branded Canva proposal with DPDP/GDPR flags',
          params: { target_niche: 'Logistics', country_code: 'IN' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#6366f1'),
      },
      {
        id: 'node-3',
        position: { x: 600, y: 120 },
        data: {
          label: 'Gate 1 Approval (MOD-10)',
          serviceId: 'MOD-10',
          action: 'Human-in-the-Loop Signoff',
          description: 'Client Approver signs before technical build starts',
          params: { gate_type: 'OUTREACH_PITCH', decision: 'APPROVED' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#10b981'),
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'node-1',
        target: 'node-2',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
        style: { stroke: '#6366f1' },
      },
      {
        id: 'e2-3',
        source: 'node-2',
        target: 'node-3',
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
        style: { stroke: '#10b981' },
      },
    ],
  },

  template_intake_parallel: {
    name: 'Parallel Factory (MOD-02 -> 03/04/05 -> Gate 3)',
    description: 'Synthesizes PRD, compiles Web/Android/API concurrently, verifies QA.',
    nodes: [
      {
        id: 'node-1',
        position: { x: 40, y: 170 },
        data: {
          label: 'Intake Synthesizer (MOD-02)',
          serviceId: 'MOD-02',
          action: 'POST /api/v1/intake/synthesize',
          description: 'Synthesizes PRD, SQL RLS & OpenAPI 3.1',
          params: { target_countries: ['IN', 'DE', 'US'], modules: ['web', 'android', 'backend'] },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#6366f1'),
      },
      {
        id: 'node-2',
        position: { x: 320, y: 40 },
        data: {
          label: 'Web Builder (MOD-03)',
          serviceId: 'MOD-03',
          action: 'POST /api/v1/web/build',
          description: '375px-1920px responsive viewports',
          params: { golden_template_id: 'golden-web-landing' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#0ea5e9'),
      },
      {
        id: 'node-3',
        position: { x: 320, y: 170 },
        data: {
          label: 'Android Builder (MOD-04)',
          serviceId: 'MOD-04',
          action: 'POST /api/v1/mobile/build',
          description: 'Signed AAB/APK + Data Safety CSV',
          params: { package_name: 'com.launchup.express' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#10b981'),
      },
      {
        id: 'node-4',
        position: { x: 320, y: 300 },
        data: {
          label: 'Backend RLS (MOD-05)',
          serviceId: 'MOD-05',
          action: 'POST /api/v1/backend/build',
          description: 'PostgreSQL migrations & RLS isolation',
          params: { golden_template_id: 'golden-backend-api' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#f59e0b'),
      },
      {
        id: 'node-5',
        position: { x: 600, y: 170 },
        data: {
          label: 'QA & SecOps (MOD-06)',
          serviceId: 'MOD-06',
          action: 'POST /api/v1/qa/verify',
          description: 'Playwright + Semgrep + Trivy + Lighthouse >= 90',
          params: { check_security: true },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#a855f7'),
      },
      {
        id: 'node-6',
        position: { x: 870, y: 170 },
        data: {
          label: 'Gate 3 Signoff (MOD-10)',
          serviceId: 'MOD-10',
          action: 'Human-in-the-Loop Gate 3',
          description: 'Approves audited preview for production',
          params: { gate_type: 'STAGE_PREVIEW_APPROVED', decision: 'APPROVED' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#10b981'),
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', style: { stroke: '#6366f1' } },
      { id: 'e1-3', source: 'node-1', target: 'node-3', style: { stroke: '#6366f1' } },
      { id: 'e1-4', source: 'node-1', target: 'node-4', style: { stroke: '#6366f1' } },
      { id: 'e2-5', source: 'node-2', target: 'node-5', style: { stroke: '#a855f7' } },
      { id: 'e3-5', source: 'node-3', target: 'node-5', style: { stroke: '#a855f7' } },
      { id: 'e4-5', source: 'node-4', target: 'node-5', style: { stroke: '#a855f7' } },
      { id: 'e5-6', source: 'node-5', target: 'node-6', style: { stroke: '#10b981' } },
    ],
  },

  template_whatsapp_rag: {
    name: 'WhatsApp 24h & RAG (MOD-08)',
    description: '24-hour SLA check, pgvector similarity & Chatwoot fallback.',
    nodes: [
      {
        id: 'node-1',
        position: { x: 40, y: 140 },
        data: {
          label: 'Meta Webhook',
          serviceId: 'WEBHOOK',
          action: 'POST /webhook/whatsapp',
          description: 'Ingests inbound WhatsApp inquiry',
          params: { phone_number: '+919876543210', query: 'Where is my order #9482?' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, isDark ? '#334155' : '#cbd5e1'),
      },
      {
        id: 'node-2',
        position: { x: 320, y: 140 },
        data: {
          label: 'WhatsApp RAG (MOD-08)',
          serviceId: 'MOD-08',
          action: 'Evaluate Semantic Confidence',
          description: 'pgvector similarity check & 24h window',
          params: { rag_threshold: 0.75 },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#10b981'),
      },
      {
        id: 'node-3',
        position: { x: 600, y: 70 },
        data: {
          label: 'Autonomous Bot Reply',
          serviceId: 'MOD-08',
          action: 'Send Verified RAG Answer',
          description: 'Dispatches answer with opt-out footer',
          params: { reply_type: 'AUTOMATED_RAG' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#0ea5e9'),
      },
      {
        id: 'node-4',
        position: { x: 600, y: 210 },
        data: {
          label: 'Chatwoot Escalation',
          serviceId: 'INTEGRATION',
          action: 'Transfer to Live Agent',
          description: 'Escalates if confidence < 0.75',
          params: { inbox: 'Support Tier 2' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#f59e0b'),
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', style: { stroke: '#10b981' } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', label: '>= 0.75', style: { stroke: '#0ea5e9' } },
      { id: 'e2-4', source: 'node-2', target: 'node-4', label: '< 0.75', style: { stroke: '#f59e0b' } },
    ],
  },

  template_sre_self_healing: {
    name: 'Sentry 500 & Self-Healing (MOD-09 -> Gate 5)',
    description: 'Diagnoses stacktrace, resolves Graphify AST blast radius & sandbox tests.',
    nodes: [
      {
        id: 'node-1',
        position: { x: 40, y: 120 },
        data: {
          label: 'Sentry 500 Webhook',
          serviceId: 'WEBHOOK',
          action: 'Ingest Crash Stacktrace',
          description: 'Detects KeyError on rates-service',
          params: { incident_source: 'SENTRY_5XX', signature: 'KeyError: "shipping_rates"' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#ef4444'),
      },
      {
        id: 'node-2',
        position: { x: 320, y: 120 },
        data: {
          label: 'SRE Healing (MOD-09)',
          serviceId: 'MOD-09',
          action: 'POST /api/v1/sre/heal',
          description: 'AST blast radius & forbidden path check',
          params: { max_retries: 3 },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#f59e0b'),
      },
      {
        id: 'node-3',
        position: { x: 600, y: 120 },
        data: {
          label: 'Gate 5 Hotfix (MOD-10)',
          serviceId: 'MOD-10',
          action: 'Human-in-the-Loop Gate 5',
          description: 'Reviews GitHub PR after sandbox pass',
          params: { gate_type: 'HOTFIX_MERGE', decision: 'APPROVED' },
          status: 'idle',
        },
        style: makeNodeStyle(isDark, '#10b981'),
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', style: { stroke: '#ef4444' } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', style: { stroke: '#10b981' } },
    ],
  },
});

export const N8nWorkflowsTab: React.FC<N8nWorkflowsTabProps> = ({
  projectId,
  projectName,
  embedded = false,
}) => {
  const { resolvedTheme, activeCanvasProjectId, n8nGraphs, updateN8nGraph } = useApp();
  const isDark = resolvedTheme === 'dark';
  const targetProjectId = projectId || activeCanvasProjectId || 'proj-0001-0000-0000-000000000001';

  const templates = getTemplates(isDark);
  const savedGraph = n8nGraphs[targetProjectId];

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(
    () => savedGraph?.selectedTemplateKey || 'template_lead_pitch'
  );
  const initialNodes: Node[] =
    savedGraph?.nodes && savedGraph.nodes.length > 0
      ? savedGraph.nodes.map((sn) => ({
          id: sn.id,
          position: sn.position,
          data: sn.data,
          style: makeNodeStyle(isDark, '#6366f1'),
        }))
      : templates.template_lead_pitch.nodes;

  const initialEdges: Edge[] =
    savedGraph?.edges && savedGraph.edges.length > 0
      ? savedGraph.edges.map((se) => ({
          id: se.id,
          source: se.source,
          target: se.target,
          label: se.label,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
        }))
      : templates.template_lead_pitch.edges;

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>(
    () =>
      savedGraph?.executionLogs || [
        `[Ready] Select a workflow template for ${projectName || 'project'} and click Run.`,
      ]
  );

  // Sync n8n workflow nodes, edges, template, and logs to AppContext -> localStorage
  useEffect(() => {
    updateN8nGraph(targetProjectId, {
      selectedTemplateKey,
      nodes: nodes.map((n) => ({
        id: n.id,
        position: n.position,
        data: n.data as Record<string, any>,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: typeof e.label === 'string' ? e.label : undefined,
      })),
      executionLogs,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetProjectId, selectedTemplateKey, nodes, edges, executionLogs]);

  // Keep node colors synchronized with light/dark theme toggle
  useEffect(() => {
    const fresh = getTemplates(isDark)[selectedTemplateKey];
    if (fresh) {
      setNodes((curr) =>
        curr.map((n, idx) => ({
          ...n,
          style: fresh.nodes[idx]?.style || makeNodeStyle(isDark, '#6366f1'),
        }))
      );
    }
  }, [isDark, selectedTemplateKey, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params }, eds)),
    [setEdges]
  );

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    const tmpl = templates[key];
    if (tmpl) {
      setNodes(tmpl.nodes);
      setEdges(tmpl.edges);
      setSelectedNode(null);
      setExecutionLogs([`[Loaded] ${tmpl.name}`]);
    }
  };

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const runWorkflowSimulation = async () => {
    setIsSimulating(true);
    const logs: string[] = [`[Started] ${templates[selectedTemplateKey]?.name || 'Custom'}`];
    setExecutionLogs([...logs]);

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const data = node.data as unknown as WorkflowNodeData;

      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n))
      );

      logs.push(`[Step ${i + 1}/${nodes.length}] ${data.label}`);
      setExecutionLogs([...logs]);

      let result: any = null;

      try {
        switch (data.serviceId) {
          case 'MOD-01':
            result = await discoverLead({
              project_id: targetProjectId,
              prospect_url: data.params.url || 'https://punjabfreight.example.com',
            });
            break;
          case 'MOD-02':
            result = await synthesizeScope({
              project_id: targetProjectId,
              interview_transcript: 'Express delivery platform with web, mobile, and backend.',
              target_countries: data.params.target_countries || ['IN', 'DE', 'US'],
              requested_modules: data.params.modules || ['web', 'android', 'backend'],
            });
            break;
          case 'MOD-03':
            result = await buildLandingWeb({
              project_id: targetProjectId,
              brand_kit: { name: projectName || 'LaunchUp App' },
              routes: ['/'],
              seo_metadata: {},
              compliance_flags: ['DPDP_INDIA', 'GDPR_EU'],
            });
            break;
          case 'MOD-04':
            result = await buildMobileApp({
              project_id: targetProjectId,
              app_name: projectName || 'LaunchUp App',
              package_id: data.params.package_name || 'com.launchup.express',
              openapi_spec_url: 'https://api.launchup.internal/openapi.yaml',
              brand_kit: {},
            });
            break;
          case 'MOD-05':
            result = await buildBackendAPI({
              project_id: targetProjectId,
              sql_ddl: 'CREATE TABLE orders (id UUID PRIMARY KEY);',
              rbac_matrix: {},
              openapi_spec_url: 'https://api.launchup.internal/openapi.yaml',
            });
            break;
          case 'MOD-06':
            result = await verifyQA({
              project_id: targetProjectId,
              web_staging_url: 'https://preview-staging.launchup.internal',
              api_staging_url: 'https://api-staging.launchup.internal',
            });
            break;
          case 'MOD-08':
            result = await sendWhatsAppMessage({
              project_id: targetProjectId,
              event_type: 'INBOUND_CUSTOMER_MSG',
              recipient_phone_e164: '+919876543210',
              message_payload: { text_or_template: data.params.query || 'Order inquiry' },
            });
            break;
          case 'MOD-09':
            result = await healIncident({
              project_id: targetProjectId,
              incident_source: 'SENTRY_5XX',
              error_signature: 'KeyError: "shipping_rates"',
              stack_trace_or_metric: { service: 'rates' },
            });
            break;
          case 'MOD-10':
            result = await decideGate(
              'gate-0001-pitch-48192',
              'APPROVED',
              'user-human-approver-001',
              'Approved via n8n workflow'
            );
            break;
          default:
            await new Promise((r) => setTimeout(r, 400));
            result = { status: 'ok', timestamp: new Date().toISOString() };
        }

        logs.push(`  [OK] ${data.label}`);
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id ? { ...n, data: { ...n.data, status: 'success', executionResult: result } } : n
          )
        );
      } catch (err: any) {
        logs.push(`  [ERR] ${data.label}: ${err.message}`);
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id ? { ...n, data: { ...n.data, status: 'error', executionResult: err.message } } : n
          )
        );
      }

      setExecutionLogs([...logs]);
      await new Promise((r) => setTimeout(r, 250));
    }

    logs.push('[Done] Workflow finished.');
    setExecutionLogs([...logs]);
    setIsSimulating(false);
  };

  const resetWorkflow = () => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: 'idle', executionResult: undefined },
      }))
    );
    setExecutionLogs(['[Reset] Ready.']);
  };

  const exportN8nJson = () => {
    const n8nWorkflow = {
      name: templates[selectedTemplateKey]?.name || 'LaunchUp Workflow',
      nodes: nodes.map((n) => ({
        parameters: (n.data as unknown as WorkflowNodeData).params,
        id: n.id,
        name: (n.data as unknown as WorkflowNodeData).label,
        type: `launchup.${(n.data as unknown as WorkflowNodeData).serviceId.toLowerCase()}`,
        typeVersion: 1,
        position: [n.position.x, n.position.y],
      })),
      connections: edges.reduce((acc: any, edge) => {
        acc[edge.source] = { main: [[{ node: edge.target, type: 'main', index: 0 }]] };
        return acc;
      }, {}),
      active: true,
    };

    const blob = new Blob([JSON.stringify(n8nWorkflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `n8n_${selectedTemplateKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importN8nJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.nodes && Array.isArray(json.nodes)) {
          const importedNodes: Node[] = json.nodes.map((n: any, idx: number) => ({
            id: n.id || `node-${idx + 1}`,
            position: { x: n.position?.[0] || 80 + idx * 240, y: n.position?.[1] || 140 },
            data: {
              label: n.name || 'Imported Node',
              serviceId: n.type?.split('.')[1]?.toUpperCase() || 'CUSTOM',
              action: 'Custom Action',
              description: 'Imported from n8n workflow',
              params: n.parameters || {},
              status: 'idle',
            },
            style: makeNodeStyle(isDark, '#6366f1'),
          }));

          const importedEdges: Edge[] = [];
          if (json.connections) {
            Object.entries(json.connections).forEach(([sourceId, conn]: [string, any]) => {
              if (conn.main && Array.isArray(conn.main)) {
                conn.main.forEach((targets: any[]) => {
                  targets.forEach((t: any) => {
                    importedEdges.push({
                      id: `e-${sourceId}-${t.node}`,
                      source: sourceId,
                      target: t.node,
                      style: { stroke: '#6366f1' },
                    });
                  });
                });
              }
            });
          }

          setNodes(importedNodes);
          setEdges(importedEdges);
          setExecutionLogs([`[Imported] ${importedNodes.length} nodes loaded.`]);
        }
      } catch (err: any) {
        alert('Failed to parse n8n JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className={`flex flex-col bg-white dark:bg-[#111318] text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden ${
        embedded ? 'h-[680px]' : 'h-[calc(100vh-5.5rem)]'
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0D1017]">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              n8n Automation Studio
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {projectName || 'Project'} · Visual microservice flow & gate orchestration
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedTemplateKey}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {Object.entries(templates).map(([key, t]) => (
              <option key={key} value={key}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={runWorkflowSimulation}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white flex items-center gap-1.5 transition-colors"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Running...' : 'Run'}</span>
          </button>

          <button
            onClick={resetWorkflow}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={exportN8nJson}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <label className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 flex items-center gap-1 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={importN8nJson} className="hidden" />
          </label>
        </div>
      </div>

      {/* Unified 5-Cell Horizontal Summary Bar */}
      <div className="px-4 pt-3 shrink-0">
        <SummaryMetricGrid>
          <SummaryMetricCard
            title="Workflow Nodes"
            primaryValue={nodes.length}
            subtitle="MOD-01–MOD-10 Blocks"
            status="live"
          />
          <SummaryMetricCard
            title="Graph Connections"
            primaryValue={edges.length}
            subtitle="Active Data Edges"
            status="good"
          />
          <SummaryMetricCard
            title="Template Catalog"
            primaryValue={`${Object.keys(templates).length} Presets`}
            subtitle={templates[selectedTemplateKey]?.name.split('(')[0].trim() || 'Custom Flow'}
            status="neutral"
          />
          <SummaryMetricCard
            title="Execution Traces"
            primaryValue={executionLogs.length}
            subtitle={isSimulating ? 'Dispatching Mesh...' : 'Run History Logged'}
            status={isSimulating ? 'live' : 'good'}
          />
          <SummaryMetricCard
            title="Engine Status"
            primaryValue={isSimulating ? 'Running' : 'Standby'}
            subtitle="JSON Export & Webhook Sync"
            status={isSimulating ? 'live' : 'good'}
          />
        </SummaryMetricGrid>
      </div>

      {/* Main Graph Canvas + Inspector */}
      <div className="flex-1 relative flex min-h-0">
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            colorMode={isDark ? 'dark' : 'light'}
            fitView
          >
            <Background gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                const data = n.data as unknown as WorkflowNodeData;
                if (data.status === 'running') return '#6366f1';
                if (data.status === 'success') return '#10b981';
                if (data.status === 'error') return '#ef4444';
                return isDark ? '#334155' : '#cbd5e1';
              }}
            />
          </ReactFlow>
        </div>

        {selectedNode && (
          <div className="w-72 border-l border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111318] p-3.5 flex flex-col justify-between overflow-y-auto z-10">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-indigo-500" />
                  <h3 className="text-xs font-semibold">Node Inspector</h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 text-[11px]">Label</label>
                  <input
                    type="text"
                    value={(selectedNode.data as unknown as WorkflowNodeData).label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.id === selectedNode.id ? { ...n, data: { ...n.data, label: val } } : n
                        )
                      );
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[11px]">Service</label>
                  <div className="mt-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-mono">
                    {(selectedNode.data as unknown as WorkflowNodeData).serviceId}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px]">Params</label>
                  <pre className="mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-32">
                    {JSON.stringify((selectedNode.data as unknown as WorkflowNodeData).params, null, 2)}
                  </pre>
                </div>

                {(selectedNode.data as unknown as WorkflowNodeData).executionResult && (
                  <div>
                    <label className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                      Output
                    </label>
                    <pre className="mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] overflow-x-auto max-h-36">
                      {JSON.stringify(
                        (selectedNode.data as unknown as WorkflowNodeData).executionResult,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{selectedNode.id}</span>
              <span className="capitalize text-indigo-600 dark:text-indigo-400 font-medium">
                {(selectedNode.data as unknown as WorkflowNodeData).status || 'idle'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Compact Logs */}
      <div className="h-32 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0D1017] px-4 py-2.5 flex flex-col font-mono text-xs">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5 font-medium">
            <Terminal className="w-3.5 h-3.5 text-indigo-500" />
            Execution Logs
          </span>
          <span>{executionLogs.length} events</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5 py-1 text-[11px]">
          {executionLogs.map((log, idx) => (
            <div
              key={idx}
              className={
                log.includes('[OK]')
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : log.includes('[ERR]')
                  ? 'text-rose-600 dark:text-rose-400'
                  : log.includes('[Step')
                  ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
