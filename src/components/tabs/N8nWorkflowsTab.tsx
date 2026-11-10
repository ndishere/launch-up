import React, { useState, useCallback, useMemo } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Bot,
  Terminal,
  X,
  FileCode,
  Share2
} from 'lucide-react';

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

// Custom Node Card Types
interface WorkflowNodeData {
  label: string;
  serviceId: string;
  action: string;
  description: string;
  params: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error';
  executionResult?: any;
}

// 4 Agency Automation Templates
const TEMPLATES: Record<string, { name: string; description: string; nodes: Node[]; edges: Edge[] }> = {
  template_lead_pitch: {
    name: 'Lead Discovery & Pitch (MOD-01 -> Gate 1)',
    description: 'Scrapes digital gaps, autofills Canva Pro proposal, and halts for human approval.',
    nodes: [
      {
        id: 'node-1',
        position: { x: 50, y: 150 },
        data: {
          label: 'Web Audit Trigger',
          serviceId: 'WEBHOOK',
          action: 'Audit Prospect URL',
          description: 'Detects missing mobile app, viewport overflow & Lighthouse score < 50',
          params: { url: 'https://punjabfreight.example.com', target_niche: 'Logistics' },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 12, padding: 12, width: 220 },
      },
      {
        id: 'node-2',
        position: { x: 350, y: 150 },
        data: {
          label: 'Lead Pitch Engine (MOD-01)',
          serviceId: 'MOD-01',
          action: 'POST /api/v1/leads/discover',
          description: 'Generates branded Canva Pro PDF proposal with applicable DPDP/GDPR flags',
          params: { target_niche: 'Logistics', country_code: 'IN', city: 'Amritsar' },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#1e1b4b', color: '#c7d2fe', border: '1px solid #6366f1', borderRadius: 12, padding: 12, width: 240 },
      },
      {
        id: 'node-3',
        position: { x: 670, y: 150 },
        data: {
          label: 'Governance Gate 1 (MOD-10)',
          serviceId: 'MOD-10',
          action: 'Human-in-the-Loop Signoff',
          description: 'Client Approver signs proposal before technical build starts',
          params: { gate_type: 'OUTREACH_PITCH', decision: 'APPROVED' },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#064e3b', color: '#a7f3d0', border: '1px solid #10b981', borderRadius: 12, padding: 12, width: 230 },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }, style: { stroke: '#6366f1' } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }, style: { stroke: '#10b981' } },
    ],
  },

  template_intake_parallel: {
    name: 'BA Intake & Parallel Factory (MOD-02 -> 03/04/05 -> Gate 3)',
    description: 'Synthesizes PRD & schemas, compiles Web/Android/API concurrently, and validates QA.',
    nodes: [
      {
        id: 'node-1',
        position: { x: 50, y: 220 },
        data: {
          label: 'Intake Spec Synthesizer (MOD-02)',
          serviceId: 'MOD-02',
          action: 'POST /api/v1/intake/synthesize',
          description: 'Synthesizes PRD, RLS SQL migration, and OpenAPI 3.1 YAML',
          params: { target_countries: ['IN', 'DE', 'US'], modules: ['web', 'android', 'backend'] },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#1e1b4b', color: '#c7d2fe', border: '1px solid #6366f1', borderRadius: 12, padding: 12, width: 240 },
      },
      {
        id: 'node-2',
        position: { x: 380, y: 70 },
        data: {
          label: 'Web Builder (MOD-03)',
          serviceId: 'MOD-03',
          action: 'POST /api/v1/web/build',
          description: 'Verifies 375px-1920px viewports with zero horizontal overflow',
          params: { golden_template_id: 'golden-web-landing' },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: 12, padding: 12, width: 220 },
      },
      {
        id: 'node-3',
        position: { x: 380, y: 220 },
        data: {
          label: 'Android Builder (MOD-04)',
          serviceId: 'MOD-04',
          action: 'POST /api/v1/mobile/build',
          description: 'Compiles signed APK/AAB with Data Safety CSV & account deletion route',
          params: { package_name: 'com.launchup.express' },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#0f172a', color: '#34d399', border: '1px solid #059669', borderRadius: 12, padding: 12, width: 220 },
      },
      {
        id: 'node-4',
        position: { x: 380, y: 370 },
        data: {
          label: 'Backend RLS Engine (MOD-05)',
          serviceId: 'MOD-05',
          action: 'POST /api/v1/backend/build',
          description: 'Applies PostgreSQL migrations & validates 100% RLS table isolation',
          params: { golden_template_id: 'golden-backend-api' },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#0f172a', color: '#fbbf24', border: '1px solid #d97706', borderRadius: 12, padding: 12, width: 220 },
      },
      {
        id: 'node-5',
        position: { x: 680, y: 220 },
        data: {
          label: 'QA & SecOps Verifier (MOD-06)',
          serviceId: 'MOD-06',
          action: 'POST /api/v1/qa/verify',
          description: 'Playwright E2E + Semgrep + Trivy + Gitleaks + Lighthouse CI >= 90',
          params: { check_security: true, lighthouse_threshold: 90 },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#311042', color: '#e879f9', border: '1px solid #c026d3', borderRadius: 12, padding: 12, width: 230 },
      },
      {
        id: 'node-6',
        position: { x: 970, y: 220 },
        data: {
          label: 'Gate 3: Staging Signoff (MOD-10)',
          serviceId: 'MOD-10',
          action: 'Human-in-the-Loop Gate 3',
          description: 'Approves audited preview build for production deployment',
          params: { gate_type: 'STAGE_PREVIEW_APPROVED', decision: 'APPROVED' },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#064e3b', color: '#a7f3d0', border: '1px solid #10b981', borderRadius: 12, padding: 12, width: 230 },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#0284c7' } },
      { id: 'e1-3', source: 'node-1', target: 'node-3', animated: true, style: { stroke: '#059669' } },
      { id: 'e1-4', source: 'node-1', target: 'node-4', animated: true, style: { stroke: '#d97706' } },
      { id: 'e2-5', source: 'node-2', target: 'node-5', animated: true, style: { stroke: '#c026d3' } },
      { id: 'e3-5', source: 'node-3', target: 'node-5', animated: true, style: { stroke: '#c026d3' } },
      { id: 'e4-5', source: 'node-4', target: 'node-5', animated: true, style: { stroke: '#c026d3' } },
      { id: 'e5-6', source: 'node-5', target: 'node-6', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }, style: { stroke: '#10b981' } },
    ],
  },

  template_whatsapp_rag: {
    name: 'WhatsApp 24h & pgvector RAG (MOD-08)',
    description: 'Inbound message processing with 24-hour SLA check, vector similarity & Chatwoot fallback.',
    nodes: [
      {
        id: 'node-1',
        position: { x: 60, y: 160 },
        data: {
          label: 'Meta Webhook Receiver',
          serviceId: 'WEBHOOK',
          action: 'POST /webhook/whatsapp',
          description: 'Ingests inbound customer inquiry with timestamp & phone verification',
          params: { phone_number: '+919876543210', query: 'Where is my order #9482?' },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 12, padding: 12, width: 220 },
      },
      {
        id: 'node-2',
        position: { x: 360, y: 160 },
        data: {
          label: 'WhatsApp RAG Engine (MOD-08)',
          serviceId: 'MOD-08',
          action: 'Evaluate Semantic Confidence',
          description: 'Calculates pgvector cosine similarity score and validates 24h window',
          params: { rag_threshold: 0.75, enforce_24h_window: true },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#022c22', color: '#6ee7b7', border: '1px solid #059669', borderRadius: 12, padding: 12, width: 240 },
      },
      {
        id: 'node-3',
        position: { x: 680, y: 80 },
        data: {
          label: 'Autonomous Bot Reply',
          serviceId: 'MOD-08',
          action: 'Send Verified RAG Answer',
          description: 'Dispatches instant answer with mandatory opt-out footer',
          params: { reply_type: 'AUTOMATED_RAG', include_footer: true },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#0f172a', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: 12, padding: 12, width: 220 },
      },
      {
        id: 'node-4',
        position: { x: 680, y: 240 },
        data: {
          label: 'Chatwoot Human Escalation',
          serviceId: 'INTEGRATION',
          action: 'Transfer to Live Agent',
          description: 'Escalates query when RAG confidence is below 0.75 threshold',
          params: { inbox: 'Support Tier 2', auto_assign: true },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#451a03', color: '#fdba74', border: '1px solid #ea580c', borderRadius: 12, padding: 12, width: 220 },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#059669' } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, label: 'Confidence >= 0.75', style: { stroke: '#38bdf8' } },
      { id: 'e2-4', source: 'node-2', target: 'node-4', animated: true, label: 'Confidence < 0.75', style: { stroke: '#ea580c' } },
    ],
  },

  template_sre_self_healing: {
    name: 'Sentry 500 & AST Self-Healing (MOD-09 -> Gate 5)',
    description: 'Diagnoses 500 error stack trace, resolves Graphify AST blast radius, validates sandbox regression.',
    nodes: [
      {
        id: 'node-1',
        position: { x: 60, y: 150 },
        data: {
          label: 'Sentry 500 Error Webhook',
          serviceId: 'WEBHOOK',
          action: 'Ingest Crash Stacktrace',
          description: 'Detects KeyError: "shipping_rates" on production rates-service',
          params: { incident_source: 'SENTRY_5XX', signature: 'KeyError: "shipping_rates"' },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#450a0a', color: '#fca5a5', border: '1px solid #ef4444', borderRadius: 12, padding: 12, width: 220 },
      },
      {
        id: 'node-2',
        position: { x: 360, y: 150 },
        data: {
          label: 'Autonomous SRE Ops (MOD-09)',
          serviceId: 'MOD-09',
          action: 'POST /api/v1/sre/heal',
          description: 'Resolves Graphify AST blast radius & enforces forbidden file boundaries',
          params: { max_retries: 3, sandbox_test: true },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#1c1917', color: '#f59e0b', border: '1px solid #d97706', borderRadius: 12, padding: 12, width: 240 },
      },
      {
        id: 'node-3',
        position: { x: 680, y: 150 },
        data: {
          label: 'Gate 5: Hotfix Merge (MOD-10)',
          serviceId: 'MOD-10',
          action: 'Human-in-the-Loop Gate 5',
          description: 'Reviews automated GitHub PR after sandbox regression pass',
          params: { gate_type: 'HOTFIX_MERGE', decision: 'APPROVED' },
          status: 'idle',
        },
        type: 'default',
        style: { background: '#064e3b', color: '#a7f3d0', border: '1px solid #10b981', borderRadius: 12, padding: 12, width: 230 },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true, style: { stroke: '#ef4444' } },
      { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }, style: { stroke: '#10b981' } },
    ],
  },
};

export const N8nWorkflowsTab: React.FC = () => {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('template_lead_pitch');
  const [nodes, setNodes, onNodesChange] = useNodesState(TEMPLATES.template_lead_pitch.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(TEMPLATES.template_lead_pitch.edges);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    '[n8n Engine Ready] Select an agency workflow template or customize graph nodes to begin execution.',
  ]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    const tmpl = TEMPLATES[key];
    if (tmpl) {
      setNodes(tmpl.nodes);
      setEdges(tmpl.edges);
      setSelectedNode(null);
      setExecutionLogs([`[Template Loaded] Switched to "${tmpl.name}"`]);
    }
  };

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  // Run live workflow simulation calling real api.ts methods
  const runWorkflowSimulation = async () => {
    setIsSimulating(true);
    const logs: string[] = [`[Simulation Started] Executing workflow: ${TEMPLATES[selectedTemplateKey]?.name || 'Custom'}`];
    setExecutionLogs([...logs]);

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const data = node.data as unknown as unknown as WorkflowNodeData;

      // Update node status to running
      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n))
      );

      logs.push(`[Running Step ${i + 1}/${nodes.length}] ${data.label} (${data.serviceId})...`);
      setExecutionLogs([...logs]);

      let result: any = null;

      try {
        switch (data.serviceId) {
          case 'MOD-01':
            result = await discoverLead({
              project_id: 'proj-0001-0000-0000-000000000001',
              prospect_url: data.params.url || 'https://punjabfreight.example.com',
            });
            break;
          case 'MOD-02':
            result = await synthesizeScope({
              project_id: 'proj-0001-0000-0000-000000000001',
              interview_transcript: 'Express cross-border delivery platform with web, mobile, and backend.',
              target_countries: data.params.target_countries || ['IN', 'DE', 'US'],
              requested_modules: data.params.modules || ['web', 'android', 'backend'],
            });
            break;
          case 'MOD-03':
            result = await buildLandingWeb({
              project_id: 'proj-0001-0000-0000-000000000001',
              brand_kit: { name: 'LaunchUp Express' },
              routes: ['/'],
              seo_metadata: {},
              compliance_flags: ['DPDP_INDIA', 'GDPR_EU'],
            });
            break;
          case 'MOD-04':
            result = await buildMobileApp({
              project_id: 'proj-0001-0000-0000-000000000001',
              app_name: 'LaunchUp Express',
              package_id: data.params.package_name || 'com.launchup.express',
              openapi_spec_url: 'https://api.launchup.internal/openapi.yaml',
              brand_kit: {},
            });
            break;
          case 'MOD-05':
            result = await buildBackendAPI({
              project_id: 'proj-0001-0000-0000-000000000001',
              sql_ddl: 'CREATE TABLE orders (id UUID PRIMARY KEY);',
              rbac_matrix: {},
              openapi_spec_url: 'https://api.launchup.internal/openapi.yaml',
            });
            break;
          case 'MOD-06':
            result = await verifyQA({
              project_id: 'proj-0001-0000-0000-000000000001',
              web_staging_url: 'https://preview-staging.launchup.internal',
              api_staging_url: 'https://api-staging.launchup.internal',
            });
            break;
          case 'MOD-08':
            result = await sendWhatsAppMessage({
              project_id: 'proj-0001-0000-0000-000000000001',
              event_type: 'INBOUND_CUSTOMER_MSG',
              recipient_phone_e164: '+919876543210',
              message_payload: { text_or_template: data.params.query || 'Order inquiry' },
            });
            break;
          case 'MOD-09':
            result = await healIncident({
              project_id: 'proj-0001-0000-0000-000000000001',
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
              'Signed off via n8n automated workflow simulation'
            );
            break;
          default:
            // Generic step execution
            await new Promise((r) => setTimeout(r, 600));
            result = { status: 'ok', timestamp: new Date().toISOString() };
        }

        logs.push(`  ✔ [Completed] ${data.label}: Output received.`);
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id ? { ...n, data: { ...n.data, status: 'success', executionResult: result } } : n
          )
        );
      } catch (err: any) {
        logs.push(`  ✖ [Failed] ${data.label}: ${err.message}`);
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id ? { ...n, data: { ...n.data, status: 'error', executionResult: err.message } } : n
          )
        );
      }

      setExecutionLogs([...logs]);
      await new Promise((r) => setTimeout(r, 400));
    }

    logs.push('[Simulation Complete] Workflow execution finished.');
    setExecutionLogs([...logs]);
    setIsSimulating(false);
  };

  // Reset node statuses
  const resetWorkflow = () => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, status: 'idle', executionResult: undefined },
      }))
    );
    setExecutionLogs(['[Workflow Reset] Status cleared. Ready to run.']);
  };

  // Export n8n-compatible JSON
  const exportN8nJson = () => {
    const n8nWorkflow = {
      name: TEMPLATES[selectedTemplateKey]?.name || 'LaunchUp Agency Workflow',
      nodes: nodes.map((n) => ({
        parameters: (n.data as unknown as WorkflowNodeData).params,
        id: n.id,
        name: (n.data as unknown as WorkflowNodeData).label,
        type: `launchup.${(n.data as unknown as WorkflowNodeData).serviceId.toLowerCase()}`,
        typeVersion: 1,
        position: [n.position.x, n.position.y],
      })),
      connections: edges.reduce((acc: any, edge) => {
        acc[edge.source] = {
          main: [[{ node: edge.target, type: 'main', index: 0 }]],
        };
        return acc;
      }, {}),
      active: true,
      settings: { executionOrder: 'v1' },
    };

    const blob = new Blob([JSON.stringify(n8nWorkflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `n8n_${selectedTemplateKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import n8n-compatible JSON
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
            position: { x: n.position?.[0] || 100 + idx * 250, y: n.position?.[1] || 150 },
            data: {
              label: n.name || 'Imported Node',
              serviceId: n.type?.split('.')[1]?.toUpperCase() || 'CUSTOM',
              action: 'Custom Action',
              description: 'Imported from n8n workflow specification',
              params: n.parameters || {},
              status: 'idle',
            },
            type: 'default',
            style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: 12, padding: 12, width: 220 },
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
                      animated: true,
                      style: { stroke: '#6366f1' },
                    });
                  });
                });
              }
            });
          }

          setNodes(importedNodes);
          setEdges(importedEdges);
          setExecutionLogs([`[Imported] Successfully loaded ${importedNodes.length} nodes from n8n JSON.`]);
        }
      } catch (err: any) {
        alert('Failed to parse n8n JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              n8n Visual Automation Engine
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                @xyflow/react
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Interactive agency pipeline wiring real Fastify microservices with Human-in-the-Loop governance gates.
            </p>
          </div>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-400">Template:</label>
          <select
            value={selectedTemplateKey}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={runWorkflowSimulation}
            disabled={isSimulating}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              isSimulating
                ? 'bg-indigo-600/50 text-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-[1.02]'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </button>

          <button
            onClick={resetWorkflow}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={exportN8nJson}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export n8n JSON
          </button>

          <label className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            Import JSON
            <input type="file" accept=".json" onChange={importN8nJson} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Flow Canvas & Side Drawer */}
      <div className="flex-1 relative flex">
        {/* ReactFlow Interactive Canvas */}
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            className="bg-slate-950"
          >
            <Background color="#334155" gap={20} size={1} />
            <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300" />
            <MiniMap
              nodeColor={(n) => {
                const data = n.data as unknown as WorkflowNodeData;
                if (data.status === 'running') return '#6366f1';
                if (data.status === 'success') return '#10b981';
                if (data.status === 'error') return '#ef4444';
                return '#334155';
              }}
              className="!bg-slate-900 !border-slate-800"
            />
          </ReactFlow>
        </div>

        {/* Selected Node Parameter Drawer */}
        {selectedNode && (
          <div className="w-80 border-l border-slate-800 bg-slate-900/95 backdrop-blur-lg p-4 flex flex-col justify-between overflow-y-auto z-20">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Node Inspector</h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Node Label</label>
                  <input
                    type="text"
                    value={(selectedNode.data as unknown as WorkflowNodeData).label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes((nds) =>
                        nds.map((n) =>
                          n.id === selectedNode.id
                            ? { ...n, data: { ...n.data, label: val } }
                            : n
                        )
                      );
                    }}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Service Identifier</label>
                  <div className="mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-indigo-400 font-mono">
                    {(selectedNode.data as unknown as WorkflowNodeData).serviceId}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Action / Endpoint</label>
                  <div className="mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]">
                    {(selectedNode.data as unknown as WorkflowNodeData).action}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Description</label>
                  <p className="mt-1 text-slate-400 leading-relaxed text-[11px]">
                    {(selectedNode.data as unknown as WorkflowNodeData).description}
                  </p>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Parameters (JSON)</label>
                  <pre className="mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-40">
                    {JSON.stringify((selectedNode.data as unknown as WorkflowNodeData).params, null, 2)}
                  </pre>
                </div>

                {/* Execution Result */}
                {(selectedNode.data as unknown as WorkflowNodeData).executionResult && (
                  <div>
                    <label className="text-emerald-400 font-medium">Live Execution Output</label>
                    <pre className="mt-1 p-2 rounded-lg bg-slate-950 border border-emerald-900/50 text-emerald-300 font-mono text-[10px] overflow-x-auto max-h-48">
                      {JSON.stringify((selectedNode.data as unknown as WorkflowNodeData).executionResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Node ID: {selectedNode.id}</span>
              <span className="capitalize text-indigo-400">
                {(selectedNode.data as unknown as WorkflowNodeData).status || 'idle'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Live Execution Terminal HUD */}
      <div className="h-40 border-t border-slate-800 bg-slate-950 p-3 flex flex-col font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-900 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold text-slate-300 text-[11px]">Real-Time Execution Logs</span>
          </div>
          <span className="text-[10px] text-slate-500">{executionLogs.length} events recorded</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 py-1.5 text-[11px]">
          {executionLogs.map((log, idx) => (
            <div
              key={idx}
              className={`leading-relaxed ${
                log.includes('✔')
                  ? 'text-emerald-400'
                  : log.includes('✖')
                  ? 'text-rose-400'
                  : log.includes('Step')
                  ? 'text-indigo-300 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
